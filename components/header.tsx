import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeTab: 'voice' | 'appointments' | 'campaigns';
  onTabChange: (tab: 'voice' | 'appointments' | 'campaigns') => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'voice', label: 'Voice Chat', icon: '🎤' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'campaigns', label: 'Campaigns', icon: '📢' },
  ] as const;

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              🏥
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                MediVoice
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Appointment Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Multilingual Support
            </span>
            <div className="flex gap-1">
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                EN
              </span>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                HI
              </span>
              <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                TA
              </span>
            </div>
          </div>
        </div>

        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className="gap-2"
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
