import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { SystemMessage, ToastType } from '../types/toast';

const STORAGE_KEY = 'bss_sms_system_messages';

export const DEFAULT_SYSTEM_MESSAGES: SystemMessage[] = [
  // Birthday Wishes
  {
    id: 1,
    key: 'SUCCESS_BIRTHDAY_WISH_SENT',
    category: 'BIRTHDAY',
    type: 'success',
    title: 'Birthday Wish Dispatched',
    messageText: '🎉 Birthday greeting SMS successfully delivered to {StudentName}!',
    description: 'Fires when a manual or scheduled birthday wish is sent.',
    isActive: true,
  },
  {
    id: 2,
    key: 'SUCCESS_AUTO_WISH_BATCH',
    category: 'BIRTHDAY',
    type: 'success',
    title: 'Automated Wishes Dispatched',
    messageText: 'Dispatched {Count} automated birthday wish(es) at exact scheduled time.',
    description: 'Fires when automated background scheduler delivers birthday wishes.',
    isActive: true,
  },
  {
    id: 3,
    key: 'ERR_BIRTHDAY_WISH_FAILED',
    category: 'BIRTHDAY',
    type: 'error',
    title: 'Birthday Wish Delivery Failed',
    messageText: 'Could not dispatch birthday SMS to {StudentName}. Reason: {Details}',
    description: 'Fires if gateway or network fails while sending wish.',
    isActive: true,
  },
  {
    id: 4,
    key: 'WARN_NO_STUDENT_DOB',
    category: 'BIRTHDAY',
    type: 'warning',
    title: 'Missing Date of Birth',
    messageText: 'Student {StudentName} does not have a registered birth date. Please update DOB.',
    description: 'Fires when attempting countdown on student with missing DOB.',
    isActive: true,
  },
  {
    id: 5,
    key: 'SUCCESS_STUDENT_DOB_UPDATED',
    category: 'BIRTHDAY',
    type: 'success',
    title: 'Birthday Updated',
    messageText: 'Date of birth for {StudentName} was successfully saved.',
    description: 'Fires when admin edits student birthday.',
    isActive: true,
  },

  // Scheduler Execution
  {
    id: 6,
    key: 'SUCCESS_SCHEDULER_EXECUTED',
    category: 'SCHEDULER',
    type: 'success',
    title: 'Scheduler Executed',
    messageText: 'Birthday scheduler checked all student queues. {Count} wish(es) sent.',
    description: 'Fires on manual or periodic scheduler run.',
    isActive: true,
  },
  {
    id: 7,
    key: 'INFO_SCHEDULER_NO_DUE',
    category: 'SCHEDULER',
    type: 'info',
    title: 'Scheduler Completed',
    messageText: 'Scheduler checked queues. No student birthdays are due for delivery at this moment.',
    description: 'Fires when scheduler finds no pending wishes.',
    isActive: true,
  },
  {
    id: 8,
    key: 'ERR_SCHEDULER_EXECUTION',
    category: 'SCHEDULER',
    type: 'error',
    title: 'Scheduler Execution Error',
    messageText: 'An error occurred while running the birthday scheduler: {Details}',
    description: 'Fires on scheduler execution failure.',
    isActive: true,
  },
  {
    id: 9,
    key: 'SUCCESS_SETTINGS_SAVED',
    category: 'SCHEDULER',
    type: 'success',
    title: 'Settings Saved',
    messageText: 'Birthday scheduler run time and countdown settings updated successfully.',
    description: 'Fires when saving settings in Settings page.',
    isActive: true,
  },

  // SMS Gateway & System
  {
    id: 10,
    key: 'ERR_GATEWAY_OFFLINE',
    category: 'SMS_GATEWAY',
    type: 'error',
    title: 'SMS Gateway Offline',
    messageText: 'Cannot connect to SMS gateway provider. Please verify credentials in Settings.',
    description: 'Fires on gateway connectivity failure.',
    isActive: true,
  },
  {
    id: 11,
    key: 'ERR_INSUFFICIENT_BALANCE',
    category: 'SMS_GATEWAY',
    type: 'error',
    title: 'Insufficient Balance',
    messageText: 'SMS balance is too low to dispatch messages. Current balance: {Balance}',
    description: 'Fires when credits are exhausted.',
    isActive: true,
  },
  {
    id: 12,
    key: 'WARN_SAFE_MODE_ACTIVE',
    category: 'SMS_GATEWAY',
    type: 'warning',
    title: 'Safe Test Mode Active',
    messageText: 'Broadcast intercepted by safety guard and routed to test phone {Mobile}.',
    description: 'Fires when Safe Test Mode is ON.',
    isActive: true,
  },

  // Backend Validation & API Errors
  {
    id: 13,
    key: 'ERR_MESSAGE_BODY_EMPTY',
    category: 'VALIDATION',
    type: 'error',
    title: 'Message Body Empty',
    messageText: 'Broadcast SMS message body cannot be empty. Please enter your message.',
    description: 'Triggered when attempting to broadcast without message text.',
    isActive: true,
  },
  {
    id: 14,
    key: 'ERR_NO_RECIPIENTS_SELECTED',
    category: 'VALIDATION',
    type: 'error',
    title: 'No Recipients Selected',
    messageText: 'At least one student or recipient must be selected to dispatch SMS.',
    description: 'Triggered when trying to send without selecting any recipients.',
    isActive: true,
  },
  {
    id: 15,
    key: 'ERR_SCHEDULED_TIME_PAST',
    category: 'VALIDATION',
    type: 'error',
    title: 'Invalid Scheduled Time',
    messageText: 'Scheduled delivery time must be in the future.',
    description: 'Triggered when scheduler date/time is set in the past.',
    isActive: true,
  },
  {
    id: 16,
    key: 'ERR_TEST_SMS_BODY_EMPTY',
    category: 'VALIDATION',
    type: 'error',
    title: 'Test SMS Empty',
    messageText: 'Test SMS message body cannot be empty.',
    description: 'Triggered when dispatching a test SMS with empty body.',
    isActive: true,
  },
  {
    id: 17,
    key: 'ERR_TEMPLATE_TITLE_EMPTY',
    category: 'VALIDATION',
    type: 'error',
    title: 'Template Title Required',
    messageText: 'Template title cannot be empty.',
    description: 'Triggered when creating/editing a template without title.',
    isActive: true,
  },
  {
    id: 18,
    key: 'ERR_TEMPLATE_BODY_EMPTY',
    category: 'VALIDATION',
    type: 'error',
    title: 'Template Body Required',
    messageText: 'Template body content cannot be empty.',
    description: 'Triggered when saving an SMS template with empty content.',
    isActive: true,
  },
  {
    id: 19,
    key: 'ERR_TEMPLATE_INVALID_TAGS',
    category: 'VALIDATION',
    type: 'error',
    title: 'Invalid Placeholder Tags',
    messageText: 'Invalid placeholder tags detected: {Tags}. Allowed tags are: {StudentName}, {StudentID}, {Class}, {Section}, {Roll}.',
    description: 'Triggered when template contains unsupported placeholder tags.',
    isActive: true,
  },
  {
    id: 20,
    key: 'ERR_TEMPLATE_ID_INVALID',
    category: 'VALIDATION',
    type: 'error',
    title: 'Invalid Template ID',
    messageText: 'Invalid template identifier provided.',
    description: 'Triggered when template lookup fails.',
    isActive: true,
  },
  {
    id: 21,
    key: 'ERR_GROUP_QUERY_SELECT_ONLY',
    category: 'GROUP',
    type: 'error',
    title: 'Restricted SQL Query',
    messageText: 'Dynamic group query must be a read-only SELECT or WITH statement.',
    description: 'Triggered when custom SQL query attempts non-SELECT operations.',
    isActive: true,
  },
  {
    id: 22,
    key: 'ERR_GROUP_QUERY_DANGEROUS',
    category: 'GROUP',
    type: 'error',
    title: 'Dangerous SQL Keywords',
    messageText: 'Potentially dangerous SQL keywords detected in dynamic group query.',
    description: 'Security guard triggered when DROP/DELETE/ALTER keywords detected in query.',
    isActive: true,
  },
  {
    id: 23,
    key: 'ERR_GATEWAY_NOT_FOUND',
    category: 'SMS_GATEWAY',
    type: 'error',
    title: 'Gateway Not Found',
    messageText: 'SMS Gateway configuration #{Id} not found in database.',
    description: 'Triggered when gateway ID does not exist in settings.',
    isActive: true,
  },
  {
    id: 24,
    key: 'ERR_SYSTEM_MESSAGE_KEY_EMPTY',
    category: 'VALIDATION',
    type: 'error',
    title: 'Message Key Required',
    messageText: 'System message key cannot be empty.',
    description: 'Triggered when saving system message without key.',
    isActive: true,
  },
  {
    id: 25,
    key: 'ERR_SYSTEM_MESSAGE_TEXT_EMPTY',
    category: 'VALIDATION',
    type: 'error',
    title: 'Message Text Required',
    messageText: 'System message template text cannot be empty.',
    description: 'Triggered when system message body is left blank.',
    isActive: true,
  },
  {
    id: 26,
    key: 'ERR_SYSTEM_MESSAGE_NOT_FOUND',
    category: 'VALIDATION',
    type: 'error',
    title: 'Message Template Not Found',
    messageText: "System message with key '{Key}' does not exist in database.",
    description: 'Triggered when lookup for non-existent message key occurs.',
    isActive: true,
  },
  {
    id: 27,
    key: 'MSG_INDEX_RECOMMENDATIONS_LOADED',
    category: 'DATABASE',
    type: 'info',
    title: 'Database Recommendations Loaded',
    messageText: 'Retrieved index recommendations and live status from SQL Server.',
    description: 'Fires when database index status is loaded.',
    isActive: true,
  },
  {
    id: 28,
    key: 'MSG_INDEX_APPLIED_SUCCESS',
    category: 'DATABASE',
    type: 'success',
    title: 'Index Applied Successfully',
    messageText: 'Nonclustered index {IndexName} created with ONLINE = ON.',
    description: 'Fires when admin applies an index from Database Indexer.',
    isActive: true,
  },
  {
    id: 29,
    key: 'ERR_INDEX_RECOMMENDATION_NOT_FOUND',
    category: 'DATABASE',
    type: 'error',
    title: 'Index Not Found',
    messageText: 'No database index recommendation found with identifier {IndexId}.',
    description: 'Fires if requested index is invalid.',
    isActive: true,
  },
  {
    id: 30,
    key: 'SUCCESS_SCHEDULED_CANCELLED',
    category: 'SCHEDULER',
    type: 'success',
    title: 'Scheduled Broadcast Cancelled',
    messageText: 'The scheduled broadcast has been safely cancelled.',
    description: 'Fires when a scheduled message is cancelled.',
    isActive: true,
  },
  {
    id: 31,
    key: 'ERR_CANCEL_SCHEDULED_FAILED',
    category: 'SCHEDULER',
    type: 'error',
    title: 'Cancellation Failed',
    messageText: 'Failed to cancel the scheduled broadcast. Please retry.',
    description: 'Fires if cancelling a scheduled job encounters an error.',
    isActive: true,
  },
  {
    id: 32,
    key: 'SUCCESS_SCHEDULED_DISPATCHED_NOW',
    category: 'SCHEDULER',
    type: 'success',
    title: 'Dispatched Immediately',
    messageText: 'Scheduled broadcast dispatched immediately and recorded in logs.',
    description: 'Fires when clicking Dispatch Now on a scheduled broadcast.',
    isActive: true,
  },
  {
    id: 33,
    key: 'ERR_DISPATCH_NOW_FAILED',
    category: 'SCHEDULER',
    type: 'error',
    title: 'Immediate Dispatch Failed',
    messageText: 'Failed to dispatch the scheduled broadcast immediately.',
    description: 'Fires if immediate dispatch of scheduled message fails.',
    isActive: true,
  },
  {
    id: 34,
    key: 'WARN_CANNOT_DELETE_ACTIVE_GATEWAY',
    category: 'SMS_GATEWAY',
    type: 'warning',
    title: 'Active Gateway Protected',
    messageText: 'Cannot delete the currently active SMS gateway. Please activate another gateway first.',
    description: 'Safety guard preventing deletion of the active SMS route.',
    isActive: true,
  },
  {
    id: 35,
    key: 'WARN_GATEWAY_URL_REQUIRED',
    category: 'SMS_GATEWAY',
    type: 'warning',
    title: 'Gateway URL Required',
    messageText: 'Please enter a valid SMS Gateway URL before testing reachability.',
    description: 'Fires when connectivity test is triggered without an API endpoint.',
    isActive: true,
  },
  {
    id: 36,
    key: 'ERR_GATEWAY_TABLE_NOT_INITIALIZED',
    category: 'SMS_GATEWAY',
    type: 'error',
    title: 'Gateway Table Not Initialized',
    messageText: 'Table BSS_SMS_GATEWAY_SETUP does not exist in SQL Server. Please create the table first.',
    description: 'Fires when attempting gateway actions before running the database DDL script.',
    isActive: true,
  },
];

class SystemMessageService {
  private cache: Map<string, SystemMessage> = new Map();
  private hasInitialized = false;

  constructor() {
    this.initFromLocalStorage();
  }

  private initFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const list: SystemMessage[] = JSON.parse(saved);
        list.forEach((m) => this.cache.set(m.key, m));
      } else {
        DEFAULT_SYSTEM_MESSAGES.forEach((m) => this.cache.set(m.key, m));
        this.saveToLocalStorage();
      }
    } catch {
      DEFAULT_SYSTEM_MESSAGES.forEach((m) => this.cache.set(m.key, m));
    }
    this.hasInitialized = true;
  }

  private saveToLocalStorage() {
    try {
      const list = Array.from(this.cache.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save system messages to localStorage:', e);
    }
  }

  /**
   * Fetches latest system message templates from Database API, with local fallback
   */
  async fetchMessages(): Promise<SystemMessage[]> {
    if (!this.hasInitialized) {
      this.initFromLocalStorage();
    }

    try {
      const response = await apiClient.get<ApiResponse<Array<{
        id: number;
        key: string;
        category: string;
        type: string;
        title: string;
        messageText: string;
        description?: string;
        isActive: boolean;
        lastUpdated: string;
      }>>>('/api/system-messages');

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((item) => {
          this.cache.set(item.key, {
            id: item.id,
            key: item.key,
            category: item.category,
            type: item.type.toLowerCase() as ToastType,
            title: item.title,
            messageText: item.messageText,
            description: item.description,
            isActive: item.isActive,
            lastUpdated: item.lastUpdated,
          });
        });
        this.saveToLocalStorage();
      }
    } catch (err) {
      console.debug('Using local/cached system messages dictionary (API sync optional):', err);
    }

    return Array.from(this.cache.values());
  }

  /**
   * Returns all current system message templates
   */
  getMessages(): SystemMessage[] {
    if (!this.hasInitialized || this.cache.size === 0) {
      this.initFromLocalStorage();
    }
    return Array.from(this.cache.values());
  }

  /**
   * Returns a single template by its key
   */
  getMessage(key: string): SystemMessage | undefined {
    return this.cache.get(key) || DEFAULT_SYSTEM_MESSAGES.find((m) => m.key === key);
  }

  /**
   * Updates a system message in DB and local store
   */
  async updateMessage(
    key: string,
    updates: { title: string; messageText: string; description?: string; isActive?: boolean }
  ): Promise<SystemMessage> {
    const existing = this.getMessage(key);
    const updated: SystemMessage = {
      ...(existing || {
        id: Date.now(),
        key,
        category: 'SYSTEM',
        type: 'info',
        title: updates.title,
        messageText: updates.messageText,
        isActive: true,
      }),
      title: updates.title,
      messageText: updates.messageText,
      description: updates.description ?? existing?.description,
      isActive: updates.isActive ?? existing?.isActive ?? true,
      lastUpdated: new Date().toISOString(),
    };

    this.cache.set(key, updated);
    this.saveToLocalStorage();

    // Persist to database if API is reachable
    try {
      await apiClient.put(`/api/system-messages/${encodeURIComponent(key)}`, {
        title: updates.title,
        messageText: updates.messageText,
        description: updates.description,
        isActive: updates.isActive,
      });
    } catch (err) {
      console.warn(`Could not sync update for ${key} to backend API; saved locally:`, err);
    }

    // Trigger update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bss_system_messages_updated'));
    }

    return updated;
  }

  /**
   * Resolves a message template by key and interpolates variables
   */
  resolve(
    key: string,
    variables?: Record<string, string | number>
  ): { title: string; message: string; type: ToastType } {
    const template = this.getMessage(key);
    if (!template) {
      return {
        title: 'System Notification',
        message: key,
        type: 'info',
      };
    }

    let resolvedMessage = template.messageText;
    let resolvedTitle = template.title;

    if (variables) {
      Object.entries(variables).forEach(([vKey, vVal]) => {
        const regex = new RegExp(`\\{${vKey}\\}`, 'gi');
        resolvedMessage = resolvedMessage.replace(regex, String(vVal));
        resolvedTitle = resolvedTitle.replace(regex, String(vVal));
      });
    }

    return {
      title: resolvedTitle,
      message: resolvedMessage,
      type: template.type,
    };
  }
}

export const systemMessageService = new SystemMessageService();
