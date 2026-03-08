import { NextRequest, NextResponse } from 'next/server';
import { db, seedDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const patients = db.getAllPatients();
    return NextResponse.json({ patients });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, language, timezone } = body;

    if (!name || !phone || !email || !language || !timezone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if patient already exists
    const existing = db.getPatientByPhone(phone);
    if (existing) {
      return NextResponse.json(
        { error: 'Patient with this phone already exists' },
        { status: 409 }
      );
    }

    const patient = db.createPatient({
      name,
      phone,
      email,
      language,
      timezone,
    });

    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
