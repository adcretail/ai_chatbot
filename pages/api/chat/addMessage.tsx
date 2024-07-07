import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismaclient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { role, text } = req.body;

  if (!role || !text) {
    return res.status(400).json({ error: 'Role and text are required' });
  }

  try {
    // Insert the message into the database
    await prisma.chatMessage.create({
      data: {
        role,
        text
      }
    });

    res.status(200).json({ message: 'Message added successfully' });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Error adding message' });
  }
}
