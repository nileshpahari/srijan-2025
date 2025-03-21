'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations, Conversation, Message } from '@/hooks/useConversations';

interface ChatProps {
  initialChatId?: string;
}

export function Chat({ initialChatId }: ChatProps) {
  const { user } = useAuth();
  const { conversations, loading, error, getConversation, sendMessage } = useConversations();
  const [message, setMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(false);

  useEffect(() => {
    if (initialChatId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv._id === initialChatId);
      if (conversation) {
        setActiveConversation(conversation);
        // Fetch full conversation with messages
        getConversation(initialChatId);
      }
    } else if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0]);
      // Fetch full conversation with messages
      getConversation(conversations[0]._id);
    }
  }, [initialChatId, conversations, getConversation]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation || !user) return;

    try {
      setLoadingMessage(true);
      await sendMessage(activeConversation._id, message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoadingMessage(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to chat</h2>
          <Button onClick={() => window.location.href = '/login'}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-black to-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
          {/* Conversations List */}
          <div className="col-span-4 glass rounded-2xl p-4">
            <h2 className="text-xl font-semibold mb-4">Conversations</h2>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      activeConversation?._id === conv._id
                        ? 'bg-white/20'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setActiveConversation(conv);
                      getConversation(conv._id);
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.name}`}
                        alt={conv.name} 
                        className="rounded-full" 
                      />
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold">{conv.name}</h3>
                      <p className="text-sm text-gray-300 truncate">
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a new conversation from the SkillSync page</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          {activeConversation ? (
            <div className="col-span-8 glass rounded-2xl p-4 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-3 border-b border-white/10 mb-4">
                <Avatar className="w-10 h-10">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeConversation.name}`}
                    alt={activeConversation.name}
                    className="rounded-full"
                  />
                </Avatar>
                <div>
                  <h3 className="font-semibold">{activeConversation.name}</h3>
                  <p className="text-sm text-gray-300">
                    {activeConversation.type === 'individual' ? 'Direct Message' : 'Group'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {activeConversation.messages && activeConversation.messages.length > 0 ? (
                  activeConversation.messages.map((msg: Message, index) => (
                    <div 
                      key={msg._id || index} 
                      className={`mb-4 flex ${
                        msg.senderEmail === user.email ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`flex items-start gap-3 max-w-[70%] ${
                        msg.senderEmail === user.email ? 'flex-row-reverse' : ''
                      }`}>
                        <Avatar className="w-8 h-8">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`}
                            alt={msg.sender}
                            className="rounded-full"
                          />
                        </Avatar>
                        <div className={`rounded-lg p-3 ${
                          msg.senderEmail === user.email 
                            ? 'bg-purple-500/30' 
                            : 'bg-white/10'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{msg.sender}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-300">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-white/5"
                  disabled={loadingMessage}
                />
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={handleSendMessage}
                  disabled={loadingMessage}
                >
                  {loadingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="col-span-8 glass rounded-2xl p-4 flex items-center justify-center">
              <p className="text-gray-400">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}