import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Find conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: user.email
    }).sort({ lastMessageTime: -1 });
    
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { name, type, participants, initialMessage } = await request.json();
    
    // Ensure current user is included in participants
    if (!participants.includes(user.email)) {
      participants.push(user.email);
    }
    
    await connectToDatabase();
    
    // Check if conversation already exists between these participants
    let conversation;
    
    if (type === 'individual' && participants.length === 2) {
      conversation = await Conversation.findOne({
        type: 'individual',
        participants: { $all: participants, $size: 2 }
      });
    }
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        name,
        type,
        participants,
        messages: [],
        createdAt: new Date()
      });
      
      // Add initial message if provided
      if (initialMessage) {
        conversation.messages.push({
          sender: user.fullName,
          senderEmail: user.email,
          content: initialMessage,
          timestamp: new Date()
        });
        
        conversation.lastMessage = initialMessage;
        conversation.lastMessageTime = new Date();
      }
      
      await conversation.save();
    }
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}