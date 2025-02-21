// GeminiChat.jsx
import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import "./GeminiChat.css";


// Safety settings for Gemini
const safetySetting = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_PUBLIC_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySetting,
});

// Streaming function that calls the Gemini API and updates answer via the callback.
export const streamGeminiResponse = async (question, onChunk) => {
  try {
    // Start a new chat with an empty history
    const chat = model.startChat({
      history: [],
      generationConfig: {},
    });
    const result = await chat.sendMessageStream([question]);
    let accumulatedText = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      accumulatedText += text;
      if (onChunk) {
        onChunk(accumulatedText);
      }
    }
    return accumulatedText;
  } catch (error) {
    console.error("Error getting Gemini response:", error);
    if (onChunk) onChunk("An error occurred while fetching the response.");
    return "An error occurred while fetching the response.";
  }
};

// GeminiChat component simply displays the answer as it updates.
const GeminiChat = ({ answer,isComplete  }) => {
  return (
    <div className="message">
      {answer ? (
        <div className="message-content">
          <Markdown remarkPlugins={[remarkGfm]}>{answer}</Markdown>
          {!isComplete && <div className="typing-indicator">...</div>}
        </div>
      ) : (
        <div className="chat-loading">Loading...</div>
      )}
    </div>
  );
};

export default GeminiChat;
