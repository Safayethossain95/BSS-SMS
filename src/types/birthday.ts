import type { Student } from './index';

export interface BirthdaySchedulerSettings {
  /**
   * Frequency for scheduler execution check (run every n days).
   * Controlled from Setting -> Birthday Scheduler Run Time
   */
  schedulerIntervalDays: number; // e.g. 1, 2, 3, etc.

  /**
   * Countdown threshold window in days (n).
   * When a student's birthday is within n days, countdown starts automatically.
   */
  lookaheadDays: number; // e.g. 3 (start countdown 3 days before)

  /**
   * Exact send time on the birthday (HH:mm format, 24-hr, e.g. "00:00" midnight or "08:00")
   */
  exactWishTime: string;

  /**
   * Master switch to enable automatic birthday wishing when countdown reaches 0
   */
  isAutoSendEnabled: boolean;

  /**
   * Wish message template with placeholders: {StudentName}, {Class}, {Section}, {Roll}, {Age}, {SchoolName}
   */
  wishTemplate: string;

  /**
   * Sending channel (Masking / Non-Masking)
   */
  channel: 'Masking' | 'Non-Masking';

  /**
   * Timestamp of the last scheduler execution
   */
  lastRunTimestamp: string | null;

  /**
   * Timestamp of the next scheduled run
   */
  nextRunTimestamp: string | null;

  /**
   * Enable celebratory confetti animation
   */
  enableConfetti: boolean;

  /**
   * Enable celebratory chime sound
   */
  enableSound: boolean;
}

export interface BirthdayWishRecord {
  id: string;
  studentId: string;
  studentHeaderId?: string;
  studentName: string;
  mobile: string;
  className: string;
  section: string;
  roll?: string;
  birthdayDate: string; // YYYY-MM-DD
  turningAge?: number;
  message: string;
  sentAt: string; // ISO string
  status: 'Delivered' | 'Sent' | 'Failed';
  triggerType: 'automatic' | 'manual';
  year: number;
}

export interface StudentBirthdayInfo {
  student: Student;
  dob: string; // YYYY-MM-DD
  nextBirthdayDate: Date;
  daysUntil: number; // 0 = today, 1 = tomorrow, etc.
  hoursUntil: number;
  minutesUntil: number;
  secondsUntil: number;
  totalSecondsRemaining: number;
  isToday: boolean;
  isWithinCountdownWindow: boolean; // daysUntil <= lookaheadDays
  targetSendDateTime: Date;
  turningAge: number;
  hasSentThisYear: boolean;
  lastSentRecord?: BirthdayWishRecord;
}
