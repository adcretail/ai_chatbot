"use client";
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch('/api/chat/getChatHistory');
        const storedChatHistory: ChatMessage[] = await response.json();
        const mergedChatHistory: ChatMessage[] = mergeChunks(storedChatHistory);
        setChatHistory(mergedChatHistory);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, []);

  const mergeChunks = (chatMessages: ChatMessage[]): ChatMessage[] => {
    const mergedMessages: ChatMessage[] = [];
    let currentMessage: ChatMessage | null = null;

    chatMessages.forEach((message) => {
      if (currentMessage && currentMessage.role === message.role) {
        currentMessage.text += message.text;
      } else {
        if (currentMessage) {
          mergedMessages.push(currentMessage);
        }
        currentMessage = { ...message };
      }
    });

    if (currentMessage) {
      mergedMessages.push(currentMessage);
    }

    return mergedMessages;
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;

    setChatHistory((prev) => [...prev, { role: 'user', text: prompt }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
        history: [
          ...chatHistory.map(({ role, text }) => ({
            role,
            parts: [{ text }],
          })),
          { role: 'user', parts: [{ text: prompt }] },
        ],
        generationConfig: {
          maxOutputTokens: 1000000, // Adjust based on your needs
        },
      });

      const result = await chat.sendMessage(prompt);
      const responseText = await result.response.text();

      const formattedResponse = responseText
        .replace(/([.!?])\s+(?=[A-Z])/g, '$1\n\n')
        .replace(/\n+/g, '\n\n')
        .trim();

      await fetch('/api/chat/addMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'user', text: prompt }),
      });

      await fetch('/api/chat/addMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'model', text: formattedResponse }),
      });

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
              className={`mb-2 p-2 rounded whitespace-pre-wrap ${chat.role === 'user' ? 'bg-blue-400 font-bold' : 'bg-green-300'}`}
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

export default function Home() {
  return (
    <div>
      <Chatbot />
    </div>
  );
};
