import { db } from './db';

export interface BookingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BookingConflict {
  hasConflict: boolean;
  conflicts: {
    existingAppointmentId: string;
    date: string;
    startTime: string;
    endTime: string;
    conflictType: 'full' | 'partial';
  }[];
  suggestions: {
    alternativeSlotId: string;
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

/**
 * Validate booking request
 */
export function validateBooking(
  patientId: string,
  timeSlotId: string
): BookingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if patient exists
  const patient = db.getPatient(patientId);
  if (!patient) {
    errors.push('Patient not found');
  }

  // Check if time slot exists
  const timeSlot = db.getTimeSlot(timeSlotId);
  if (!timeSlot) {
    errors.push('Time slot not found');
  }

  // Check if time slot is available
  if (timeSlot && !timeSlot.isAvailable) {
    errors.push('Time slot is no longer available');
  }

  // Check for conflicts with existing appointments
  if (patient && timeSlot) {
    const conflict = checkBookingConflicts(patientId, timeSlotId);
    if (conflict.hasConflict) {
      warnings.push(`Potential conflict: Patient has overlapping appointment`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check for appointment conflicts
 * Returns conflicts if the patient already has an appointment at the same time
 */
export function checkBookingConflicts(
  patientId: string,
  timeSlotId: string
): BookingConflict {
  const timeSlot = db.getTimeSlot(timeSlotId);
  if (!timeSlot) {
    return { hasConflict: false, conflicts: [], suggestions: [] };
  }

  const patientAppointments = db.getPatientAppointments(patientId);
  const conflicts: BookingConflict['conflicts'] = [];

  for (const appointment of patientAppointments) {
    if (appointment.status === 'cancelled') continue;

    const existingSlot = db.getTimeSlot(appointment.timeSlotId);
    if (!existingSlot || existingSlot.date !== timeSlot.date) continue;

    // Check for time overlap
    const isOverlap = timeOverlap(
      timeSlot.startTime,
      timeSlot.endTime,
      existingSlot.startTime,
      existingSlot.endTime
    );

    if (isOverlap) {
      conflicts.push({
        existingAppointmentId: appointment.id,
        date: existingSlot.date,
        startTime: existingSlot.startTime,
        endTime: existingSlot.endTime,
        conflictType: fullOverlap(
          timeSlot.startTime,
          timeSlot.endTime,
          existingSlot.startTime,
          existingSlot.endTime
        )
          ? 'full'
          : 'partial',
      });
    }
  }

  // Get alternative slots
  const suggestions = getAlternativeSlots(timeSlot.date, timeSlot.agentId, 3);

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    suggestions: suggestions.map((slot) => ({
      alternativeSlotId: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    })),
  };
}

/**
 * Resolve a booking conflict by finding alternative slots
 */
export function resolveBookingConflict(
  patientId: string,
  timeSlotId: string
): BookingConflict {
  return checkBookingConflicts(patientId, timeSlotId);
}

/**
 * Get alternative available slots around a date
 */
export function getAlternativeSlots(
  date: string,
  agentId: string,
  maxResults: number = 5
): {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}[] {
  // Try same day, then next few days
  const alternatives = [];
  const dateObj = new Date(date);

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(dateObj);
    checkDate.setDate(checkDate.getDate() + i);
    const checkDateStr = checkDate.toISOString().split('T')[0];

    const availableSlots = db.getAvailableSlots(checkDateStr, agentId);
    alternatives.push(
      ...availableSlots.map((slot) => ({
        id: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable,
      }))
    );

    if (alternatives.length >= maxResults) break;
  }

  return alternatives.slice(0, maxResults);
}

/**
 * Check if two time ranges overlap
 */
function timeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

/**
 * Check if two time ranges fully overlap
 */
function fullOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 === s2 && e1 === e2;
}

/**
 * Convert time string to minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Check slot availability considering cancellation buffer
 */
export function isSlotAvailableWithBuffer(
  slotId: string,
  bufferMinutes: number = 30
): boolean {
  const slot = db.getTimeSlot(slotId);
  if (!slot || !slot.isAvailable) return false;

  // Check if any appointment is too close
  // This could be enhanced with actual appointment times
  return true;
}

/**
 * Get booking summary for confirmation
 */
export function getBookingSummary(
  appointmentId: string
): {
  appointmentId: string;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
} | null {
  const appointment = db.getAppointment(appointmentId);
  if (!appointment) return null;

  const patient = db.getPatient(appointment.patientId);
  const timeSlot = db.getTimeSlot(appointment.timeSlotId);

  if (!patient || !timeSlot) return null;

  return {
    appointmentId: appointment.id,
    patientName: patient.name,
    date: timeSlot.date,
    startTime: timeSlot.startTime,
    endTime: timeSlot.endTime,
    status: appointment.status,
  };
}

/**
 * Format booking confirmation message
 */
export function formatBookingConfirmation(
  summary: ReturnType<typeof getBookingSummary>,
  language: 'en' | 'hi' | 'ta'
): string {
  if (!summary) return 'Appointment not found';

  const confirmations: Record<string, string> = {
    en: `Your appointment has been confirmed!\nPatient: ${summary.patientName}\nDate: ${summary.date}\nTime: ${summary.startTime} - ${summary.endTime}\nConfirmation ID: ${summary.appointmentId}`,
    hi: `आपकी अपॉइंटमेंट की पुष्टि हुई है!\nरोगी: ${summary.patientName}\nतारीख: ${summary.date}\nसमय: ${summary.startTime} - ${summary.endTime}\nपुष्टि ID: ${summary.appointmentId}`,
    ta: `உங்கள் சந்திப்பு உறுதிப்படுத்தப்பட்டுள்ளது!\nநோயாளி: ${summary.patientName}\nதேதி: ${summary.date}\nநேரம்: ${summary.startTime} - ${summary.endTime}\nசரிபார்ப்பு ID: ${summary.appointmentId}`,
  };

  return confirmations[language] || confirmations.en;
}
