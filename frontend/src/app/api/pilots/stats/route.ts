import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/pilots/stats/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Revalidate every 5 minutes
      next: { revalidate: 300 }
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Pilot stats error:', error);
    // Return default values if backend is unavailable
    return NextResponse.json({
      total_applications: 0,
      active_pilots: 0,
      remaining_spots: 10,
      spots_limited: false,
    });
  }
}
