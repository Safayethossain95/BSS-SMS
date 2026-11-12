export interface Student {
  headerId: string;
  id: string; // e.g. 2606093807
  name: string;
  mobile: string;
  guardianName?: string;
  className: string;
  section: string;
  roll?: string;
  status: 'active' | 'inactive';
}

export interface SectionInfo {
  id: string;
  name: string;
  classId: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  sections: SectionInfo[];
}

export interface SmsTemplate {
  id: string;
  title: string;
  category: 'general' | 'attendance' | 'fee' | 'exam' | 'emergency';
  body: string;
}

export interface SmsMetrics {
  charCount: number;
  charLimit: number;
  charRemain: number;
  segments: number;
  isUnicode: boolean;
  totalSmsCost: number;
}

export interface SentBroadcastRecord {
  id: string;
  timestamp: string;
  className: string;
  section: string;
  message: string;
  totalRecipients: number;
  totalSmsUnits: number;
  status: 'Delivered' | 'Partially Delivered' | 'Processing';
  recipients: Array<{
    name: string;
    mobile: string;
    status: 'Delivered' | 'Sent' | 'Failed';
  }>;
}

export interface CustomGroupTarget {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
}

export type AppPage =
  | 'delivery'
  | 'custom-groups'
  | 'templates'
  | 'logs'
  | 'students'
  | 'add-student';

export interface CustomGroup {
  id: string;
  name: string;
  targets: CustomGroupTarget[];
  createdAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
  campus: string;
  initials: string;
}

export const DEMO_USER: AuthUser = {
  id: 'admin-01',
  username: 'admin',
  name: 'Administrator',
  role: 'Campus 4 • Admin',
  campus: 'Campus 4',
  initials: 'AD',
};


