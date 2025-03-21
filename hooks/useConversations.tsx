"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export interface Message {
  _id?: string;
  sender: string;
  senderEmail: string;
  content: string;
  timestamp: Date;
}

export interface Conversation {
  _id: string;
  name: string;
  type: "individual" | "group";
  participants: string[];
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: Date;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", response.status, errorData);
        throw new Error(
          `Failed to fetch conversations: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(
        `Failed to load conversations: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const createConversation = async (
    name: string,
    type: "individual" | "group",
    participants: string[],
    initialMessage?: string
  ) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          participants,
          initialMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", response.status, errorData);
        throw new Error(
          `Failed to create conversation: ${response.status} ${response.statusText}`
        );
      }

      const newConversation = await response.json();
      setConversations((prev) => [newConversation, ...prev]);

      return newConversation;
    } catch (err) {
      console.error("Error creating conversation:", err);
      throw err;
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", response.status, errorData);
        throw new Error(
          `Failed to send message: ${response.status} ${response.statusText}`
        );
      }

      const newMessage = await response.json();

      // Update conversations with new message
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: content,
              lastMessageTime: new Date(),
            };
          }
          return conv;
        })
      );

      return newMessage;
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  };

  const getConversation = async (conversationId: string) => {
    if (!conversationId) {
      console.error("Invalid conversation ID:", conversationId);
      throw new Error("Invalid conversation ID");
    }

    try {
      console.log(`Fetching conversation with ID: ${conversationId}`);
      const response = await fetch(`/api/conversations/${conversationId}`);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error Response:", response.status, errorData);
        throw new Error(
          `Failed to fetch conversation: ${response.status} ${response.statusText}`
        );
      }

      const conversation = await response.json();
      console.log("Conversation data received:", conversation);

      // Update the conversation in the state
      setConversations((prev) =>
        prev.map((conv) => (conv._id === conversationId ? conversation : conv))
      );

      return conversation;
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError(
        `Failed to fetch conversation: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      throw err;
    }
  };

  // New function to handle error recovery
  const clearError = () => {
    setError(null);
  };

  return {
    conversations,
    loading,
    error,
    clearError,
    fetchConversations,
    createConversation,
    sendMessage,
    getConversation,
  };
}
