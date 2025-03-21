import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { email, fullName, branch, skills, bio, linkedin, github } = await request.json();
    
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: user.email });
    
    if (existingUser) {
      // Update existing user
      existingUser.fullName = fullName;
      existingUser.branch = branch;
      existingUser.skills = skills;
      existingUser.bio = bio;
      existingUser.linkedin = linkedin;
      existingUser.github = github;
      
      await existingUser.save();
      
      return NextResponse.json(existingUser);
    } else {
      // Create new user profile
      const newUser = new User({
        email: user.email,
        fullName,
        branch,
        skills,
        bio,
        linkedin,
        github,
        createdAt: new Date()
      });
      
      await newUser.save();
      
      return NextResponse.json(newUser);
    }
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}