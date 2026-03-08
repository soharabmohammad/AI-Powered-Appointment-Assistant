// In-memory database with TypeScript types
// Simulates a PostgreSQL database structure for the appointment system

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  language: 'en' | 'hi' | 'ta';
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  agentId: string;
  isAvailable: boolean;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  timeSlotId: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationHistory {
  id: string;
  patientId: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  targetPatientIds: string[];
  status: 'draft' | 'scheduled' | 'running' | 'completed';
  createdAt: Date;
}

// In-memory storage
class Database {
  private patients: Map<string, Patient> = new Map();
  private timeSlots: Map<string, TimeSlot> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private conversationHistory: ConversationHistory[] = [];
  private campaigns: Map<string, Campaign> = new Map();

  // Utility to generate IDs
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // PATIENTS
  createPatient(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Patient {
    const patient: Patient = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.patients.set(patient.id, patient);
    return patient;
  }

  getPatient(id: string): Patient | null {
    return this.patients.get(id) || null;
  }

  getPatientByPhone(phone: string): Patient | null {
    for (const patient of this.patients.values()) {
      if (patient.phone === phone) return patient;
    }
    return null;
  }

  getAllPatients(): Patient[] {
    return Array.from(this.patients.values());
  }

  updatePatient(id: string, data: Partial<Patient>): Patient | null {
    const patient = this.patients.get(id);
    if (!patient) return null;
    const updated = { ...patient, ...data, updatedAt: new Date() };
    this.patients.set(id, updated);
    return updated;
  }

  // TIME SLOTS
  createTimeSlot(data: Omit<TimeSlot, 'id' | 'createdAt'>): TimeSlot {
    const slot: TimeSlot = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.timeSlots.set(slot.id, slot);
    return slot;
  }

  getAvailableSlots(date: string, agentId: string): TimeSlot[] {
    return Array.from(this.timeSlots.values()).filter(
      (slot) => slot.date === date && slot.agentId === agentId && slot.isAvailable
    );
  }

  getTimeSlot(id: string): TimeSlot | null {
    return this.timeSlots.get(id) || null;
  }

  updateTimeSlot(id: string, data: Partial<TimeSlot>): TimeSlot | null {
    const slot = this.timeSlots.get(id);
    if (!slot) return null;
    const updated = { ...slot, ...data };
    this.timeSlots.set(id, updated);
    return updated;
  }

  // APPOINTMENTS
  createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment {
    const appointment: Appointment = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.appointments.set(appointment.id, appointment);
    
    // Mark time slot as unavailable
    const slot = this.timeSlots.get(data.timeSlotId);
    if (slot) {
      slot.isAvailable = false;
    }
    
    return appointment;
  }

  getAppointment(id: string): Appointment | null {
    return this.appointments.get(id) || null;
  }

  getPatientAppointments(patientId: string): Appointment[] {
    return Array.from(this.appointments.values()).filter(
      (apt) => apt.patientId === patientId
    );
  }

  getUpcomingAppointments(patientId: string): Appointment[] {
    return this.getPatientAppointments(patientId).filter(
      (apt) => apt.status === 'scheduled'
    );
  }

  updateAppointment(id: string, data: Partial<Appointment>): Appointment | null {
    const appointment = this.appointments.get(id);
    if (!appointment) return null;
    const updated = { ...appointment, ...data, updatedAt: new Date() };
    this.appointments.set(id, updated);
    return updated;
  }

  cancelAppointment(id: string): Appointment | null {
    const appointment = this.appointments.get(id);
    if (!appointment) return null;
    
    // Mark time slot as available again
    const slot = this.timeSlots.get(appointment.timeSlotId);
    if (slot) {
      slot.isAvailable = true;
    }
    
    const updated = { ...appointment, status: 'cancelled' as const, updatedAt: new Date() };
    this.appointments.set(id, updated);
    return updated;
  }

  // CONVERSATION HISTORY
  addConversationMessage(
    patientId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    content: string
  ): ConversationHistory {
    const message: ConversationHistory = {
      id: this.generateId(),
      patientId,
      sessionId,
      role,
      content,
      timestamp: new Date(),
    };
    this.conversationHistory.push(message);
    return message;
  }

  getConversationHistory(sessionId: string): ConversationHistory[] {
    return this.conversationHistory.filter((msg) => msg.sessionId === sessionId);
  }

  // CAMPAIGNS
  createCampaign(data: Omit<Campaign, 'id' | 'createdAt'>): Campaign {
    const campaign: Campaign = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  getCampaign(id: string): Campaign | null {
    return this.campaigns.get(id) || null;
  }

  getAllCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  updateCampaign(id: string, data: Partial<Campaign>): Campaign | null {
    const campaign = this.campaigns.get(id);
    if (!campaign) return null;
    const updated = { ...campaign, ...data };
    this.campaigns.set(id, updated);
    return updated;
  }
}

// Global database instance
export const db = new Database();

// Seed some initial data
export function seedDatabase() {
  // Create sample patients
  const patient1 = db.createPatient({
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    email: 'rajesh@example.com',
    language: 'hi',
    timezone: 'Asia/Kolkata',
  });

  const patient2 = db.createPatient({
    name: 'Priya Sharma',
    phone: '+91-9876543211',
    email: 'priya@example.com',
    language: 'en',
    timezone: 'Asia/Kolkata',
  });

  const patient3 = db.createPatient({
    name: 'Arjun Sundaram',
    phone: '+91-9876543212',
    email: 'arjun@example.com',
    language: 'ta',
    timezone: 'Asia/Kolkata',
  });

  // Create sample time slots for today
  const today = new Date().toISOString().split('T')[0];
  
  db.createTimeSlot({
    date: today,
    startTime: '09:00',
    endTime: '09:30',
    agentId: 'agent_1',
    isAvailable: true,
  });

  db.createTimeSlot({
    date: today,
    startTime: '10:00',
    endTime: '10:30',
    agentId: 'agent_1',
    isAvailable: true,
  });

  db.createTimeSlot({
    date: today,
    startTime: '14:00',
    endTime: '14:30',
    agentId: 'agent_1',
    isAvailable: true,
  });

  return { patient1, patient2, patient3 };
}
