import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const upcoming = searchParams.get('upcoming') === 'true';

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const appointments = upcoming
      ? db.getUpcomingAppointments(patientId)
      : db.getPatientAppointments(patientId);

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, timeSlotId, notes } = body;

    if (!patientId || !timeSlotId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const patient = db.getPatient(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Verify time slot exists and is available
    const timeSlot = db.getTimeSlot(timeSlotId);
    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot not found' },
        { status: 404 }
      );
    }

    if (!timeSlot.isAvailable) {
      return NextResponse.json(
        { error: 'Time slot is not available' },
        { status: 409 }
      );
    }

    const appointment = db.createAppointment({
      patientId,
      timeSlotId,
      status: 'scheduled',
      notes: notes || '',
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
