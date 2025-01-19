import { NextRequest, NextResponse } from 'next/server';
import { sendOTP } from '../[...nextauth]/route';
import User from '@/db/models/User';
import clientPromise from '@/db/connectDb';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    await clientPromise;

    // If name is provided, update or create user
    if (name) {
      await User.findOneAndUpdate(
        { email: normalizedEmail },
        { 
          $set: { 
            name,
            username: normalizedEmail.split('@')[0] 
          }
        },
        { upsert: true }
      );
    }

    await sendOTP(normalizedEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
