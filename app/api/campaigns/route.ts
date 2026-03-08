import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignQueue } from '@/lib/campaignQueue';

export async function GET(request: NextRequest) {
  try {
    const campaigns = db.getAllCampaigns();
    const campaignsWithProgress = campaigns.map((campaign) => {
      const progress = campaignQueue.getCampaignProgress(campaign.id);
      return {
        ...campaign,
        progress,
      };
    });

    return NextResponse.json({ campaigns: campaignsWithProgress });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      startDate,
      endDate,
      targetPatientIds,
    } = body;

    if (!name || !targetPatientIds || !Array.isArray(targetPatientIds)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = db.createCampaign({
      name,
      description: description || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      targetPatientIds,
      status: 'draft',
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
