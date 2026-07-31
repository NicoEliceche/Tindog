import { NextResponse } from 'next/server';
import { isGitHubPagesStaticBuild } from '@core/deploy/staticExport';
import prisma from '@core/data/client/PrismaClient';

export function generateStaticParams() {
  return [{ id: 'chat-1' }, { id: 'chat-2' }, { id: 'chat-3' }, { id: '1' }, { id: '2' }];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isGitHubPagesStaticBuild()) {
    return NextResponse.json([]);
  }

  try {
    const { id } = await params;
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  if (isGitHubPagesStaticBuild()) {
    return NextResponse.json({ error: 'API is hosted on Render' }, { status: 405 });
  }

  try {
    const { id } = await params;
    const { text, senderId } = await request.json();
    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        conversationId: id,
      },
      include: { sender: true },
    });
    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
