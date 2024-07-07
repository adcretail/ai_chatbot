import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismaclient';

interface ChatMessage {
  id: number; 
  role: string;
  text: string;
  createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chatHistory = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'asc' }
    }) as ChatMessage[]; 

    const formattedChatHistory = chatHistory.map((message: ChatMessage) => {
      // 1. Split into sentences (handling more boundary cases)
      const sentences = message.text.match(/[^.!?]+([.!?]|\s*\n|$)/g) || []; 

      // 2. Join sentences with two newlines
      const formattedText = sentences.join('\n\n');

      return {
        ...message,
        text: formattedText.trim() // Trim any extra whitespace 
      };
    });

    res.status(200).json(formattedChatHistory);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat history' });
  }
}