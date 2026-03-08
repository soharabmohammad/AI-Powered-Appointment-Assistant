'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface Appointment {
  id: string;
  patientId: string;
  timeSlotId: string;
  status: string;
  notes: string;
}

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    // Fetch appointments - implement in production
    setLoading(false);
    console.log('[v0] Appointment manager initialized');
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((f) => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : appointments.length === 0 ? (
        <Card className="bg-card border-border p-8 text-center">
          <p className="text-muted-foreground">
            No appointments found. Create appointments through the voice chat interface.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <Card
              key={apt.id}
              className="bg-card border-border p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground">
                    Appointment {apt.id.substring(0, 8)}...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Status: <span className="font-medium">{apt.status}</span>
                  </p>
                  {apt.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Notes: {apt.notes}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
