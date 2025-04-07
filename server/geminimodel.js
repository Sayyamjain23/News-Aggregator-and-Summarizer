// // Import necessary modules
// const {GoogleGenerativeAI} = require("@google/generative-ai");
  
// const apiKey = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   const generationConfig = {
//     temperature: 1,
//     topP: 0.95,
//     topK: 64,
//     maxOutputTokens: 500, // Adjust this based on the expected summary length
//     responseMimeType: "text/plain",
//   };
  
//   // Function to summarize an article using Gemini
//   const summarizeWithGemini = async (articleBody) => {
//     try {
//       // Create a chat session
//       const chatSession = model.startChat({
//         generationConfig,
//         history: [
//           {
//             role: "user",
//             parts: [
//               { text: `Summarize the following article:\n"${articleBody}"` },
//             ],
//           },
//         ],
//       });
  
//       // Send the message and get the response
//       const result = await chatSession.sendMessage(articleBody);
//       const summary = result.response.text();
//       console.log("Sending to Gemini: ", articleText);
//       return summary;
     
//     } catch (error) {
//       console.error('Error summarizing with Gemini:', error);
//       return 'Failed to summarize';
//     }
//   };
  
//   // Export the summarize function
//   module.exports = { summarizeWithGemini };
// require("dotenv").config();
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const apiKey = process.env.GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const summarizeWithGemini = async (articleBody) => {
//     try {
//         const prompt = `Summarize the following article:\n"${articleBody}"`;
//         const result = await model.generateContent(prompt);
        
//         // Extract response correctly
//         const summary = result.response.candidates[0].content.parts[0].text;
//         return summary;
//     } catch (error) {
//         console.error('Error summarizing with Gemini:', error);
//         return 'Failed to summarize';
//     }
// };

// module.exports = { summarizeWithGemini };
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

const generationConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 500,
};

const summarizeWithGemini = async (articleBody) => {
  try {
    const prompt = `Summarize the following article in one paragraph:\n\n"${articleBody}"`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    const candidates = response.candidates;

    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      if (parts && parts.length > 0) {
        const summary = parts[0].text;
        console.log("✅ Summary Extracted:\n", summary);
        return summary;
      }
    }

    throw new Error("No content parts in response.");

  } catch (error) {
    console.error("❌ Error extracting text from Gemini response:", error.message || error);
    return "Failed to summarize";
  }
};

module.exports = { summarizeWithGemini };
