'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  progress?: {
    total: number;
    completed: number;
    failed: number;
    percentComplete: number;
  };
}

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCampaignName, setNewCampaignName] = useState('');

  useEffect(() => {
    // Fetch campaigns - implement in production
    setLoading(false);
    console.log('[v0] Campaign manager initialized');
  }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) return;

    // Create campaign API call - implement in production
    console.log('[v0] Creating campaign:', newCampaignName);
    setNewCampaignName('');
  };

  const handleStartCampaign = async (campaignId: string) => {
    // Start campaign API call - implement in production
    console.log('[v0] Starting campaign:', campaignId);
  };

  return (
    <div className="space-y-6">
      {/* Create New Campaign */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Create New Campaign
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Campaign name (e.g., April Reminders)"
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
            className="flex-1 bg-input border-border"
          />
          <Button
            onClick={handleCreateCampaign}
            disabled={!newCampaignName.trim()}
          >
            Create Campaign
          </Button>
        </div>
      </Card>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="bg-card border-border p-8 text-center">
          <p className="text-muted-foreground">
            No campaigns yet. Create one to start scheduling outbound voice calls.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="bg-card border-border p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="font-medium">{campaign.status}</span>
                  </p>
                </div>
                {campaign.status === 'draft' && (
                  <Button
                    onClick={() => handleStartCampaign(campaign.id)}
                    className="gap-2"
                  >
                    ▶ Start Campaign
                  </Button>
                )}
              </div>

              {campaign.progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {campaign.progress.percentComplete}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{
                        width: `${campaign.progress.percentComplete}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Completed: {campaign.progress.completed}</span>
                    <span>Failed: {campaign.progress.failed}</span>
                    <span>Total: {campaign.progress.total}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
