import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    // TODO: Fetch user by ID from DB
    return NextResponse.json({ id, name: 'Placeholder User' });
}
