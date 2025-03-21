import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
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
    
    // Get search query from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    
    // Find users matching the query
    const users = await User.find({
      $and: [
        { email: { $ne: user.email } }, // Exclude current user
        {
          $or: [
            { fullName: { $regex: query, $options: 'i' } },
            { skills: { $regex: query, $options: 'i' } },
            { branch: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('-password').limit(20);
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}