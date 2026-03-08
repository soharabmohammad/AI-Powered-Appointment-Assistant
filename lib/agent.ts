import { tool, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { db } from './db';
import { detectLanguage } from './voice';

// Tool definitions for the agent
const tools = {
  // Search for available appointments
  searchAvailableSlots: tool({
    description:
      'Search for available appointment time slots on a specific date for an agent',
    inputSchema: z.object({
      date: z.string().describe('Date in YYYY-MM-DD format'),
      agentId: z.string().describe('ID of the appointment agent'),
    }),
    execute: async ({ date, agentId }) => {
      const slots = db.getAvailableSlots(date, agentId);
      return {
        success: true,
        date,
        agentId,
        availableSlots: slots.map((slot) => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
        count: slots.length,
      };
    },
  }),

  // Book an appointment
  bookAppointment: tool({
    description: 'Book an appointment for a patient at an available time slot',
    inputSchema: z.object({
      patientId: z.string().describe('ID of the patient'),
      timeSlotId: z.string().describe('ID of the time slot to book'),
      notes: z.string().describe('Optional notes for the appointment'),
    }),
    execute: async ({ patientId, timeSlotId, notes }) => {
      try {
        const patient = db.getPatient(patientId);
        if (!patient) {
          return { success: false, error: 'Patient not found' };
        }

        const timeSlot = db.getTimeSlot(timeSlotId);
        if (!timeSlot) {
          return { success: false, error: 'Time slot not found' };
        }

        if (!timeSlot.isAvailable) {
          return { success: false, error: 'Time slot is no longer available' };
        }

        const appointment = db.createAppointment({
          patientId,
          timeSlotId,
          status: 'scheduled',
          notes,
        });

        return {
          success: true,
          appointmentId: appointment.id,
          message: `Appointment booked successfully for ${patient.name} on ${timeSlot.date} from ${timeSlot.startTime} to ${timeSlot.endTime}`,
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
  }),

  // Get patient information
  getPatientInfo: tool({
    description: 'Retrieve information about a patient by phone number or ID',
    inputSchema: z.object({
      query: z.string().describe('Patient phone number or ID'),
      queryType: z
        .enum(['phone', 'id'])
        .describe('Type of query: phone or id'),
    }),
    execute: async ({ query, queryType }) => {
      try {
        let patient;
        if (queryType === 'phone') {
          patient = db.getPatientByPhone(query);
        } else {
          patient = db.getPatient(query);
        }

        if (!patient) {
          return { success: false, error: 'Patient not found' };
        }

        return {
          success: true,
          patient: {
            id: patient.id,
            name: patient.name,
            phone: patient.phone,
            email: patient.email,
            language: patient.language,
            timezone: patient.timezone,
          },
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
  }),

  // Get patient's upcoming appointments
  getUpcomingAppointments: tool({
    description: 'Retrieve upcoming scheduled appointments for a patient',
    inputSchema: z.object({
      patientId: z.string().describe('ID of the patient'),
    }),
    execute: async ({ patientId }) => {
      try {
        const patient = db.getPatient(patientId);
        if (!patient) {
          return { success: false, error: 'Patient not found' };
        }

        const appointments = db.getUpcomingAppointments(patientId);
        const appointmentDetails = appointments.map((apt) => {
          const timeSlot = db.getTimeSlot(apt.timeSlotId);
          return {
            id: apt.id,
            date: timeSlot?.date,
            startTime: timeSlot?.startTime,
            endTime: timeSlot?.endTime,
            status: apt.status,
            notes: apt.notes,
          };
        });

        return {
          success: true,
          patientName: patient.name,
          upcomingAppointments: appointmentDetails,
          count: appointmentDetails.length,
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
  }),

  // Cancel an appointment
  cancelAppointment: tool({
    description: 'Cancel an existing appointment',
    inputSchema: z.object({
      appointmentId: z.string().describe('ID of the appointment to cancel'),
    }),
    execute: async ({ appointmentId }) => {
      try {
        const appointment = db.cancelAppointment(appointmentId);

        if (!appointment) {
          return { success: false, error: 'Appointment not found' };
        }

        return {
          success: true,
          message: `Appointment ${appointmentId} has been cancelled`,
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
  }),

  // Detect and store patient language preference
  setPatientLanguage: tool({
    description:
      'Update patient language preference based on conversation language',
    inputSchema: z.object({
      patientId: z.string().describe('ID of the patient'),
      language: z
        .enum(['en', 'hi', 'ta'])
        .describe('Language code: en, hi, or ta'),
    }),
    execute: async ({ patientId, language }) => {
      try {
        const patient = db.updatePatient(patientId, { language });

        if (!patient) {
          return { success: false, error: 'Patient not found' };
        }

        return {
          success: true,
          message: `Patient language preference set to ${language}`,
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
  }),

  // Add conversation to history
  recordConversation: tool({
    description:
      'Record user message and assistant response in conversation history',
    inputSchema: z.object({
      patientId: z.string().describe('ID of the patient'),
      sessionId: z.string().describe('ID of the conversation session'),
      userMessage: z.string().describe('The user message content'),
      assistantMessage: z.string().describe('The assistant response content'),
    }),
    execute: async ({ patientId, sessionId, userMessage, assistantMessage }) => {
      try {
        db.addConversationMessage(patientId, sessionId, 'user', userMessage);
        db.addConversationMessage(
          patientId,
          sessionId,
          'assistant',
          assistantMessage
        );

        return {
          success: true,
          message: 'Conversation recorded',
        };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
  }),
};

// Create the appointment booking agent
export const appointmentAgent = new ToolLoopAgent({
  model: 'openai/gpt-4-turbo',
  instructions: `You are a helpful appointment booking assistant for a healthcare clinic. Your role is to:
1. Help patients find and book appointments
2. Answer questions about their existing appointments
3. Detect the patient's preferred language and communicate in that language
4. Be professional, friendly, and concise

You have access to tools that allow you to:
- Search for available appointment slots
- Book appointments for patients
- Retrieve patient information
- Check upcoming appointments
- Cancel appointments if needed
- Update patient language preferences
- Record conversation history

Always try to understand the patient's needs first before taking action. If a patient provides their phone number, use it to look them up. If they're a new patient, collect necessary information first.

Important guidelines:
- Speak in the patient's preferred language (English, Hindi, or Tamil)
- Be empathetic and helpful
- Confirm all appointment details before booking
- Provide clear confirmation with appointment date, time, and any next steps
- Handle cancellation requests gracefully`,
  tools,
  maxSteps: 20,
});

// Helper function to prepare system context for conversations
export function prepareSystemContext(patientData?: {
  id: string;
  name: string;
  phone: string;
  language: 'en' | 'hi' | 'ta';
}): string {
  if (!patientData) {
    return 'Starting new conversation - please identify the patient first.';
  }

  return `Current patient context:
- Name: ${patientData.name}
- Phone: ${patientData.phone}
- Preferred Language: ${patientData.language}
- ID: ${patientData.id}

Continue the conversation in the patient's preferred language.`;
}

// Helper function to detect language and identify patient
export async function identifyPatient(input: string): Promise<{
  language: 'en' | 'hi' | 'ta';
  patientId?: string;
  phoneNumber?: string;
}> {
  // Extract phone number pattern
  const phonePattern = /\+?91[-]?\d{4}[-]?\d{6}|\d{10}/;
  const phoneMatch = input.match(phonePattern);

  const detectedLanguage = detectLanguage(input);

  if (phoneMatch) {
    // Normalize phone number
    const phoneNumber = phoneMatch[0].replace(/[-]/g, '');
    const patient = db.getPatientByPhone(phoneNumber);

    if (patient) {
      return {
        language: detectedLanguage,
        patientId: patient.id,
        phoneNumber: phoneNumber,
      };
    }

    return {
      language: detectedLanguage,
      phoneNumber: phoneNumber,
    };
  }

  return {
    language: detectedLanguage,
  };
}
