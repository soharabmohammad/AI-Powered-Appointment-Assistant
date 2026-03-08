import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const agentId = searchParams.get('agentId');

    if (!date || !agentId) {
      return NextResponse.json(
        { error: 'date and agentId are required' },
        { status: 400 }
      );
    }

    const slots = db.getAvailableSlots(date, agentId);
    return NextResponse.json({ slots });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch time slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, agentId } = body;

    if (!date || !startTime || !endTime || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const timeSlot = db.createTimeSlot({
      date,
      startTime,
      endTime,
      agentId,
      isAvailable: true,
    });

    return NextResponse.json({ timeSlot }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create time slot' },
      { status: 500 }
    );
  }
}
