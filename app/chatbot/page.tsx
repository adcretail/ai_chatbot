"use client";
import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (typeof window === 'undefined') {
  require('dotenv').config();
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY || '');

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const Chatbot = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;

    setChatHistory((prev) => [...prev, { role: 'user', text: prompt }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const chat = model.startChat({
        history: [
          ...chatHistory.map(({ role, text }) => ({
            role,
            parts: [{ text }],
          })),
          { role: 'user', parts: [{ text: prompt }] },
        ],
        generationConfig: {
          maxOutputTokens: 1000000,
        },
      });

      const result = await chat.sendMessage(prompt);
      const responseText = await result.response.text();

      // Ensure correct formatting with new lines after full stops, paragraph changes, etc.
      const formattedResponse = responseText
        .replace(/([.!?])\s+(?=[A-Z])/g, '$1\n\n') // Add new lines after sentence endings followed by a capital letter
        .replace(/\n+/g, '\n\n') // Normalize multiple new lines to double new lines
        .trim(); // Remove any leading/trailing whitespace
      setChatHistory((prev) => [
        ...prev,
        { role: 'model', text: formattedResponse },
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">AI Chatbot</h1>
      <div className="w-full max-w-3xl bg-white rounded shadow p-4">
        <div className="mb-4">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded whitespace-pre-wrap ${chat.role === 'user' ? 'bg-blue-100' : 'bg-green-100'
                }`}
            >
              {chat.text}
            </div>
          ))}
          {isLoading && <div className="mb-2 p-2 rounded bg-yellow-100">...</div>}
        </div>
        <div className="flex">
          <input
            type="text"
            value={prompt}
            onChange={handlePromptChange}
            className="flex-grow p-2 border rounded-l"
            placeholder="Type your prompt..."
          />
          <button
            onClick={handleSendPrompt}
            className="bg-blue-500 text-white p-2 rounded-r"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 
