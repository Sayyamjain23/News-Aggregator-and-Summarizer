
# NEWS AGGREGATOR AND SUMMARIZER

The AI News Aggregator and Summarizer, powered by the MERN stack and integrated with the ChatGPT API, represents a cutting-edge solution to the modern challenge of accessing relevant and trustworthy news amidst the vast array of online sources. Leveraging the power of artificial intelligence through the ChatGPT API, this platform redefines how individuals consume news by collecting articles from diverse sources and providing concise and informative summaries.

Here's how the integration with the ChatGPT API enhances the functionality of the News Aggregator and Summarizer:

Summarization: The ChatGPT API is utilized to generate concise summaries of news articles. By analyzing the content of articles and extracting key information, ChatGPT produces accurate and coherent summaries that capture the essence of the original text.

Upgraded to Gemini API As Open Ai API was not free

Personalization: Through continuous learning and adaptation, the platform tailors news summaries to individual user preferences. By analyzing user interactions and feedback, ChatGPT helps personalize the news consumption experience, ensuring that users receive summaries relevant to their interests.


Timeliness: With real-time access to the ChatGPT API, the platform delivers timely news summaries as soon as articles are collected. This ensures that users stay up-to-date with the latest developments and breaking news stories.


Automation: The integration with the ChatGPT API automates the summarization process, allowing for efficient handling of large volumes of articles. This automation streamlines the news aggregation workflow, enabling the platform to provide summaries quickly and efficiently.


By combining the capabilities of the ChatGPT API with the MERN stack, the News Aggregator and Summarizer offers an advanced and user-friendly platform for accessing personalized and informative news summaries. This integration represents a transformative approach to news consumption, providing users with a convenient and efficient way to stay informed in today's fast-paced digital landscape.

## ScreenShots

As I am using NEWS API it is for only limited free requests so i am showing you the ScreenShots and one more happend was previously newsApi was providing many urltoimages but now it reduced so i used a dummy image to show the news article 

![Home Page](./home.png)

Home Page 

![Summarizer](./summarizer.png)

Summarizer

![News Atricle By Category](./newsarticlewithdummyimage.png)

![Personlizatin](./personalized%20feild.png)

![Summary of an article using url](./summarized%20text%20from%20link.png)

## Installation

To Run Frontend:
cd client
npm install

npm start

To Run Backend:
cd server
npm install

export OPENAI_API_KEY="your-api-key"
node index.js

