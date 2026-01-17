import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name } = body;

        // Validation
        if (!email || !name) {
            return NextResponse.json(
                { error: 'Email and name are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Create user
        const user = await createUser({ email, name });

        return NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}