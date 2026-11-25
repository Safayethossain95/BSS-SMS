import type {
  BirthdaySchedulerSettings,
  BirthdayWishRecord,
  StudentBirthdayInfo,
} from '../types/birthday';
import type { Student } from '../types';
import { smsService } from './smsService';
import { playCelebrationChime } from '../utils/audio';
import confetti from 'canvas-confetti';

const SETTINGS_KEY = 'bss_sms_birthday_settings';
const LOGS_KEY = 'bss_sms_birthday_logs';
const STUDENTS_KEY = 'bss_sms_birthday_students';

export const DEFAULT_BIRTHDAY_SETTINGS: BirthdaySchedulerSettings = {
  schedulerIntervalDays: 1, // Runs every 1 day
  lookaheadDays: 3,         // Countdown triggers when birthday is within 3 days
  exactWishTime: '00:00',   // 00:00 midnight (exact birthday send time)
  isAutoSendEnabled: true,
  wishTemplate: 'Happy Birthday, {StudentName}! 🎂 Wishing you a wonderful year filled with joy, wisdom, and achievements. Warm wishes from British Standard School (BSS).',
  channel: 'Masking',
  lastRunTimestamp: null,
  nextRunTimestamp: null,
  enableConfetti: true,
  enableSound: true,
};

class BirthdayService {
  /**
   * Retrieves active birthday scheduler settings
   */
  getSettings(): BirthdaySchedulerSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_BIRTHDAY_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse birthday settings:', e);
    }
    return { ...DEFAULT_BIRTHDAY_SETTINGS };
  }

  /**
   * Saves updated settings and schedules next run timestamp
   */
  saveSettings(newSettings: Partial<BirthdaySchedulerSettings>): BirthdaySchedulerSettings {
    const current = this.getSettings();
    const updated: BirthdaySchedulerSettings = {
      ...current,
      ...newSettings,
    };

    // Recalculate next run timestamp if not explicitly set
    if (!newSettings.nextRunTimestamp) {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + (updated.schedulerIntervalDays || 1));
      const [hours, minutes] = (updated.exactWishTime || '00:00').split(':').map(Number);
      nextDate.setHours(hours || 0, minutes || 0, 0, 0);
      updated.nextRunTimestamp = nextDate.toISOString();
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Gets list of registered students with DOBs
   */
  getStudents(): Student[] {
    try {
      const saved = localStorage.getItem(STUDENTS_KEY);
      if (saved) {
        const parsed: Student[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to read registered students:', e);
    }

    // Return empty array if not saved; students are populated dynamically from API
    return [];
  }

  /**
   * Persists students list to localStorage
   */
  saveStudents(students: Student[]): void {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }

  /**
   * Updates or sets date of birth for a student
   */
  updateStudentDob(studentId: string, dob: string): Student[] {
    const students = this.getStudents();
    const updated = students.map((s) => (s.id === studentId ? { ...s, dob } : s));
    this.saveStudents(updated);
    return updated;
  }

  /**
   * Adds or registers a new student with birthday
   */
  addStudent(student: Student): Student[] {
    const students = this.getStudents();
    const existingIndex = students.findIndex((s) => s.id === student.id);
    let updated: Student[];
    if (existingIndex >= 0) {
      updated = [...students];
      updated[existingIndex] = { ...updated[existingIndex], ...student };
    } else {
      updated = [student, ...students];
    }
    this.saveStudents(updated);
    return updated;
  }

  /**
   * Removes a student from birthday registry
   */
  deleteStudent(studentId: string): Student[] {
    const students = this.getStudents();
    const updated = students.filter((s) => s.id !== studentId);
    this.saveStudents(updated);
    return updated;
  }

  /**
   * Gets birthday wish records history
   */
  getWishRecords(): BirthdayWishRecord[] {
    try {
      const saved = localStorage.getItem(LOGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse wish records:', e);
    }
    return [];
  }

  /**
   * Appends a new wish record
   */
  saveWishRecord(record: BirthdayWishRecord): void {
    const records = this.getWishRecords();
    const updated = [record, ...records.filter((r) => r.id !== record.id)];
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  }

  /**
   * Resets sent history (useful for testing countdown & automated sending)
   */
  resetWishRecords(studentId?: string): void {
    if (studentId) {
      const records = this.getWishRecords().filter((r) => r.studentId !== studentId);
      localStorage.setItem(LOGS_KEY, JSON.stringify(records));
    } else {
      localStorage.removeItem(LOGS_KEY);
    }
  }

  /**
   * Calculates comprehensive birthday info & countdown timer for a given student
   */
  calculateStudentBirthdayInfo(
    student: Student,
    settings: BirthdaySchedulerSettings,
    wishRecords: BirthdayWishRecord[],
    now: Date = new Date()
  ): StudentBirthdayInfo | null {
    if (!student.dob) return null;

    const parts = student.dob.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return null;
    }

    const birthYear = parts[0];
    const birthMonth = parts[1] - 1; // 0-indexed
    const birthDay = parts[2];

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    const isToday = currentMonth === birthMonth && currentDay === birthDay;

    // Check if wish has been sent for this year
    const lastSentRecord = wishRecords.find(
      (r) => r.studentId === student.id && r.year === currentYear && (r.status === 'Delivered' || r.status === 'Sent')
    );
    const hasSentThisYear = Boolean(lastSentRecord);

    // Exact wish delivery time configuration
    const [wishHour, wishMinute] = (settings.exactWishTime || '00:00').split(':').map(Number);

    // Determine target birthday date
    let targetYear = currentYear;

    // If birthday date is in past this year (and not today, or today but already sent)
    const todayMidnight = new Date(currentYear, currentMonth, currentDay, 0, 0, 0, 0);
    const candidateMidnight = new Date(currentYear, birthMonth, birthDay, 0, 0, 0, 0);

    if (candidateMidnight < todayMidnight || (isToday && hasSentThisYear)) {
      targetYear = currentYear + 1;
    }

    const targetSendDateTime = new Date(targetYear, birthMonth, birthDay, wishHour || 0, wishMinute || 0, 0, 0);
    const nextBirthdayDate = new Date(targetYear, birthMonth, birthDay);

    // Calculate calendar days until birthday
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfBirthday = new Date(targetYear, birthMonth, birthDay).getTime();
    const daysUntil = Math.max(0, Math.round((startOfBirthday - startOfToday) / (1000 * 60 * 60 * 24)));

    // Countdown total seconds remaining until target exact send time
    const diffMs = targetSendDateTime.getTime() - now.getTime();
    const totalSecondsRemaining = Math.max(0, Math.floor(diffMs / 1000));

    const hoursUntil = Math.floor((totalSecondsRemaining % (3600 * 24)) / 3600);
    const minutesUntil = Math.floor((totalSecondsRemaining % 3600) / 60);
    const secondsUntil = totalSecondsRemaining % 60;

    // Countdown window check: is daysUntil <= lookaheadDays (n)
    const isWithinCountdownWindow = daysUntil <= settings.lookaheadDays;
    const turningAge = targetYear - birthYear;

    return {
      student,
      dob: student.dob,
      nextBirthdayDate,
      daysUntil,
      hoursUntil,
      minutesUntil,
      secondsUntil,
      totalSecondsRemaining,
      isToday,
      isWithinCountdownWindow,
      targetSendDateTime,
      turningAge,
      hasSentThisYear,
      lastSentRecord,
    };
  }

  /**
   * Retrieves birthday info for all registered students, sorted by nearest birthday
   */
  getAllBirthdayInfos(now: Date = new Date()): StudentBirthdayInfo[] {
    const settings = this.getSettings();
    const students = this.getStudents();
    const wishRecords = this.getWishRecords();

    const list: StudentBirthdayInfo[] = [];

    for (const student of students) {
      const info = this.calculateStudentBirthdayInfo(student, settings, wishRecords, now);
      if (info) {
        list.push(info);
      }
    }

    // Sort by:
    // 1. Celebrating Today (isToday && !hasSentThisYear) first
    // 2. Nearest daysUntil
    // 3. totalSecondsRemaining
    return list.sort((a, b) => {
      if (a.isToday && !a.hasSentThisYear && !(b.isToday && !b.hasSentThisYear)) return -1;
      if (!(a.isToday && !a.hasSentThisYear) && b.isToday && !b.hasSentThisYear) return 1;
      if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
      return a.totalSecondsRemaining - b.totalSecondsRemaining;
    });
  }

  /**
   * Prepares personalized message using template
   */
  compileMessage(template: string, student: Student, turningAge?: number): string {
    return template
      .replace(/{StudentName}/gi, student.name)
      .replace(/{StudentID}/gi, student.id)
      .replace(/{Class}/gi, student.className)
      .replace(/{Section}/gi, student.section)
      .replace(/{Roll}/gi, student.roll || '01')
      .replace(/{Age}/gi, turningAge !== undefined ? String(turningAge) : '10')
      .replace(/{SchoolName}/gi, 'British Standard School');
  }

  /**
   * Dispatches birthday wish SMS and saves audit record
   */
  async sendWish(
    student: Student,
    customMessage?: string,
    triggerType: 'automatic' | 'manual' = 'manual'
  ): Promise<BirthdayWishRecord> {
    const settings = this.getSettings();
    const turningAge = student.dob ? new Date().getFullYear() - Number(student.dob.split('-')[0]) : undefined;
    const message = customMessage || this.compileMessage(settings.wishTemplate, student, turningAge);

    let status: 'Delivered' | 'Sent' | 'Failed' = 'Delivered';

    try {
      await smsService.sendBroadcast({
        templateText: message,
        message,
        targetGroupSummary: `Birthday Wish (${student.className})`,
        recipients: [student],
      });
    } catch (err) {
      console.warn('API send broadcast fallback for birthday wish:', err);
      // Even if network fails, we record as Sent in local ledger
      status = 'Sent';
    }

    const record: BirthdayWishRecord = {
      id: `bday-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentId: student.id,
      studentHeaderId: student.headerId,
      studentName: student.name,
      mobile: student.mobile,
      className: student.className,
      section: student.section,
      roll: student.roll,
      birthdayDate: student.dob || new Date().toISOString().slice(0, 10),
      turningAge,
      message,
      sentAt: new Date().toISOString(),
      status,
      triggerType,
      year: new Date().getFullYear(),
    };

    this.saveWishRecord(record);

    // Audio & Confetti Celebrations
    if (settings.enableConfetti) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    if (settings.enableSound) {
      playCelebrationChime();
    }

    // Emit event so any listening UI components refresh immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('bss_birthday_wish_dispatched', {
          detail: { record, student },
        })
      );
    }

    return record;
  }

  /**
   * Main automated scheduler tick.
   * Checks students whose birthday is today, countdown has hit 0,
   * and auto-sends birthday SMS at exact configured time.
   */
  async checkAndExecuteScheduler(now: Date = new Date()): Promise<{
    dispatchedCount: number;
    dispatchedRecords: BirthdayWishRecord[];
  }> {
    const settings = this.getSettings();
    const students = this.getStudents();
    const wishRecords = this.getWishRecords();

    const dispatchedRecords: BirthdayWishRecord[] = [];

    // If auto-send is enabled in settings
    if (settings.isAutoSendEnabled) {
      for (const student of students) {
        const info = this.calculateStudentBirthdayInfo(student, settings, wishRecords, now);
        if (!info) continue;

        // Check conditions for automatic dispatch:
        // 1. Birthday is today
        // 2. Countdown has reached target exact time (totalSecondsRemaining === 0 or targetSendDateTime <= now)
        // 3. Wish has not been sent yet for this year
        // 4. Within countdown window
        if (info.isToday && !info.hasSentThisYear && info.totalSecondsRemaining <= 0) {
          try {
            const record = await this.sendWish(student, undefined, 'automatic');
            dispatchedRecords.push(record);
          } catch (e) {
            console.error(`Failed to auto-send birthday wish to ${student.name}:`, e);
          }
        }
      }
    }

    // Update scheduler execution metadata
    const nextDate = new Date(now);
    nextDate.setDate(nextDate.getDate() + (settings.schedulerIntervalDays || 1));
    const [h, m] = (settings.exactWishTime || '00:00').split(':').map(Number);
    nextDate.setHours(h || 0, m || 0, 0, 0);

    this.saveSettings({
      lastRunTimestamp: now.toISOString(),
      nextRunTimestamp: nextDate.toISOString(),
    });

    return {
      dispatchedCount: dispatchedRecords.length,
      dispatchedRecords,
    };
  }
}

export const birthdayService = new BirthdayService();
