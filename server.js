const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure the correct key is used
const baseURL = "https://api.aimlapi.com/v1";
const systemPrompt = "Helpful, brief, friendly assistant.";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL,
});

// Route to handle chat requests
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const chatResponse = completion.choices[0].message.content.trim();
    res.json({ message: chatResponse });

  } catch (error) {
    if (error.status === 429 ) {
      console.error("Rate limit exceeded. Please try again later.");
      res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    } else {
      console.error("Error fetching chatbot response:", error.status);
      res.status(500).send("Internal Server Error");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
