import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/drupal/generated';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');

    try {
        const result = await getCalendarEvents(year ? parseInt(year, 10) : undefined);
        return NextResponse.json(result.data, { status: result.status });
    } catch (error) {
        console.error('Failed to fetch calendar events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}
