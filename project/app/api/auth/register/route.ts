import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signJwtToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, branch, skills, bio, linkedin, github } = await request.json();
    
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      fullName: fullName || '',
      branch: branch || '',
      skills: skills || [],
      bio: bio || '',
      linkedin: linkedin || '',
      github: github || '',
      createdAt: new Date()
    });
    
    await user.save();
    
    // Generate JWT token
    const token = await signJwtToken({
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName
    });
    
    // Create response
    const response = NextResponse.json(
      { success: true, message: 'User registered successfully' },
      { status: 201 }
    );
    
    // Set cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}