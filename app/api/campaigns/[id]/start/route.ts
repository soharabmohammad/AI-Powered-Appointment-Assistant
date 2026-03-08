import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaignQueue } from '@/lib/campaignQueue';

export async function POST(
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

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return NextResponse.json(
        { error: `Campaign cannot be started from '${campaign.status}' status` },
        { status: 400 }
      );
    }

    // Start the campaign by adding jobs to queue
    const jobs = campaignQueue.addCampaignJobs({
      campaignId: id,
      patientIds: campaign.targetPatientIds,
      maxConcurrent: 3,
      maxRetries: 2,
      retryDelay: 5000,
    });

    // Update campaign status
    const updatedCampaign = db.updateCampaign(id, {
      status: 'running',
    });

    const progress = campaignQueue.getCampaignProgress(id);

    console.log(
      `[v0] Started campaign ${id} with ${jobs.length} jobs`
    );

    return NextResponse.json({
      campaign: updatedCampaign,
      jobs: jobs.slice(0, 5), // Return first 5 jobs
      totalJobs: jobs.length,
      progress,
      message: `Campaign started with ${jobs.length} outbound calls queued`,
    });
  } catch (error) {
    console.error('[v0] Campaign start error:', error);
    return NextResponse.json(
      { error: 'Failed to start campaign' },
      { status: 500 }
    );
  }
}
