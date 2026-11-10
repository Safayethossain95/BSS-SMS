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

export interface CustomGroup {
  id: string;
  name: string;
  targets: CustomGroupTarget[];
  createdAt: string;
}

