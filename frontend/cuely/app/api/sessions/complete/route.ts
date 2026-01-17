import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // TODO: Mark session as complete, save results
        return NextResponse.json({ status: 'completed', sessionId: body.sessionId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
    }
}
