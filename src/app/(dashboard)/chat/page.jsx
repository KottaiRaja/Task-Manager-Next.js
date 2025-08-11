// src/app/(dashboard)/chat/page.jsx
'use client'
import dynamic from 'next/dynamic';

// Lazy-load the client-only Chat component
const ChatClient = dynamic(() => import('@/components/ChatClient'), { ssr: false });

export default function ChatPage() {
  return <ChatClient />;
}
