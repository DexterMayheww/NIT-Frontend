// app/api/proxy-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return new NextResponse('Missing URL', { status: 400 });
    }

    try {
        const response = await fetch(fileUrl);
        const data = await response.arrayBuffer();

        return new NextResponse(data, {
            headers: {
                'Content-Type': 'application/pdf',
                'Access-Control-Allow-Origin': '*', // Allows your frontend to see it
            },
        });
    } catch (error) {
        return new NextResponse('Error fetching PDF', { status: 500 });
    }
}