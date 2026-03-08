'use client';

import { useState } from 'react';
import VoiceChat from '@/components/voice-chat';
import AppointmentManager from '@/components/appointment-manager';
import CampaignManager from '@/components/campaign-manager';
import Header from '@/components/header';

type TabType = 'voice' | 'appointments' | 'campaigns';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('voice');

  return (
    <main className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'voice' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Voice Appointment Assistant
              </h2>
              <p className="text-muted-foreground">
                Book appointments through natural voice conversation. Available in
                English, Hindi, and Tamil.
              </p>
            </div>
            <VoiceChat />
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Appointment Management
              </h2>
              <p className="text-muted-foreground">
                View and manage all patient appointments and time slots.
              </p>
            </div>
            <AppointmentManager />
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Campaign Mode
              </h2>
              <p className="text-muted-foreground">
                Schedule and manage outbound voice call campaigns for appointment
                reminders and bookings.
              </p>
            </div>
            <CampaignManager />
          </div>
        )}
      </div>
    </main>
  );
}
