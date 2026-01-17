import { NextResponse } from 'next/server';

export async function GET() {
    // TODO: Fetch available scenarios from DB or static file
    const scenarios = [
        { id: '1', title: 'Scenario 1', description: 'Description here' },
        { id: '2', title: 'Scenario 2', description: 'Description here' },
    ];
    return NextResponse.json({ scenarios });
}
