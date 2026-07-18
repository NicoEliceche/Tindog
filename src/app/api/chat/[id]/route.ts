import { NextResponse } from 'next/server';
import prisma from '@core/data/client/PrismaClient';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { text, senderId } = await request.json();
    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        conversationId: params.id,
      },
      include: { sender: true },
    });
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
