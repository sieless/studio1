/**
 * Messages Page
 * View all conversations and chat
 */

'use client';

import { useState } from 'react';
import { ConversationsList } from '@/components/messaging/conversations-list';
import { Chat } from '@/components/messaging/chat';

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className={selectedConversationId ? 'hidden lg:block' : ''}>
          <ConversationsList
            onSelectConversation={setSelectedConversationId}
            selectedConversationId={selectedConversationId || undefined}
          />
        </div>

        {/* Chat */}
        <div className={cn(
          'lg:col-span-2',
          !selectedConversationId && 'hidden lg:flex lg:items-center lg:justify-center'
        )}>
          {selectedConversationId ? (
            <Chat
              conversationId={selectedConversationId}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="text-center p-12">
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
