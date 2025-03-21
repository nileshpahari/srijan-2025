'use client';

import { useParams } from 'next/navigation';
import { Chat } from '@/components/chat';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;

  return <Chat initialChatId={chatId} />;
}