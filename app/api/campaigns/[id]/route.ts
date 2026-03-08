import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignQueue } from '@/lib/campaignQueue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = db.getCampaign(id);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const jobs = campaignQueue.getCampaignJobs(id);
    const progress = campaignQueue.getCampaignProgress(id);

    return NextResponse.json({
      campaign,
      jobs,
      progress,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const campaign = db.updateCampaign(id, body);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}
