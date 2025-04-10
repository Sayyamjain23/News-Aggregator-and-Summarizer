require('dotenv').config();  // Load environment variables from .env file
// const extractModule =  import('@extractus/article-extractor');
// const { extract } = extractModule;


const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const morgan = require('morgan'); // For request logging

const { summarizeWithGemini } = require('./geminimodel');
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan('dev')); // Log requests

const secretKey = process.env.JWT_SECRET; // Secret key for JWT
const apiKey = process.env.NEWS_API_KEY; // API key for NewsAPI

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define NewsSchema
const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  imageUrl: String,
  category: String,
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);

// User Schema
const User = mongoose.model('User', {
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: [String],
});

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  article: {
    title: String,
    description: String,
    url: String,
    imageUrl: String,
    category: String,
  },
}, { timestamps: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

app.post('/api/bookmarks', async (req, res) => {
  try {
    const { userId, article } = req.body;

    if (!userId || !article) {
      return res.status(400).json({ error: 'User ID and article are required' });
    }

    const bookmark = new Bookmark({ userId, article });
    await bookmark.save();
    res.status(201).json({ message: 'Bookmark saved successfully!' });
  } catch (error) {
    console.error('Error saving bookmark:', error);
    res.status(500).json({ error: 'Error saving bookmark. Please try again later.' });
  }
});

app.get('/api/bookmarks', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const bookmarks = await Bookmark.find({ userId });
    res.status(200).json(bookmarks);
  } catch (error) {
    console.error('Error retrieving bookmarks:', error);
    res.status(500).json({ error: 'Error retrieving bookmarks' });
  }
});

app.post('/register', async (req, res) => {
  const { username, password, preferences } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, preferences });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    jwt.sign({ username: user.username, userId: user._id }, secretKey, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('Error generating token:', err);
        return res.status(500).json({ error: 'Error logging in' });
      }

      res.json({ token, user: { username: user.username, userId: user._id, preferences: user.preferences } });
    });
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});



app.get('/api/news', async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];

    const apiUrlBase = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

    const newsData = await Promise.all(
      categories.map(async (category) => {
        try {
          const response = await axios.get(`${apiUrlBase}&category=${category}`);
          return response.data.articles
           // .filter(article => article.urlToImage)
            .map(article => ({
              title: article.title,
              description: article.content,
              url: article.url,
              imageUrl: article.urlToImage,
              category,
            }));
        } catch (err) {
          console.error(`Error fetching category ${category}:`, err.message);
          return []; // Return empty list on failure
        }
      })
    );

    const flattenedNewsData = newsData.flat();

    if (flattenedNewsData.length > 0) {
      try {
        await News.insertMany(flattenedNewsData, { ordered: false });
      } catch (dbError) {
        console.error("Database Insert Error:", dbError.message);
      }
    }

    res.json(flattenedNewsData);
  } catch (error) {
    console.error('Main Fetch Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.get('/api/personalized-news', async (req, res) => {
  const { preferences } = req.query;
  if (!preferences) return res.status(400).json({ error: 'Preferences are required' });

  const categories = preferences.split(',');
  try {
    const personalizedNews = await Promise.allSettled(
      categories.map(async (category) => {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=in&category=${category}&apiKey=${apiKey}`);
        return response.data.articles.map(article => ({
          title: article.title,
          description: article.content,
          url: article.url,
          imageUrl: article.urlToImage,
          category,
        }));
      })
    );

    const flattened = personalizedNews.flat();
    res.json(flattened);
  } catch (err) {
    console.error("Error fetching personalized news:", err.message);
    res.status(500).json({ error: 'Failed to fetch personalized news' });
  }
});


app.get('/scrape', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });

    const { extract } = await import('@extractus/article-extractor');
    const article = await extract(url);

    if (!article || !article.content) {
      return res.status(404).json({ error: 'Unable to extract content' });
    }

 
    const $ = cheerio.load(article.content);
    const cleanText = $.text().replace(/\s+/g, ' ').trim();


    const readableText = cleanText.slice(0, 6000);

    console.log("🔹 Cleaned Article Preview:\n", readableText.slice(0, 500));

    const summary = await summarizeWithGemini(readableText);

    res.json({
      title: article.title || 'No title',
      articleBody: readableText,
      summary
    });

  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const isProduction = process.env.NODE_ENV === 'production';
const isCombinedDeploy = process.env.COMBINED_DEPLOY === 'true';

// API routes
app.use('/api', apiRoutes);

// Only serve frontend if we're in a combined deployment
if (isProduction && isCombinedDeploy) {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  // For API-only deployment
  app.get('/', (req, res) => {
    res.json({ message: 'News Aggregator API is running' });
  });
}




app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
