import type { SmsMetrics } from '../types';

// Standard GSM 7-bit basic character set
const GSM_7BIT_REGEX = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ^{}\\[~\]|€ÆæßÉ!"#%&'()*+,\-./0-9:;<=>?A-ZÄÖÑÜ§a-zäöñüà\s]*$/;

export function checkIsUnicode(text: string): boolean {
  if (!text) return false;
  return !GSM_7BIT_REGEX.test(text);
}

export function calculateSmsMetrics(text: string, recipientCount: number): SmsMetrics {
  const charCount = text.length;
  const isUnicode = checkIsUnicode(text);

  if (charCount === 0) {
    return {
      charCount: 0,
      charLimit: isUnicode ? 70 : 160,
      charRemain: isUnicode ? 70 : 160,
      messageCount: 0,
      segments: 0,
      isUnicode,
      totalSmsCost: 0,
    };
  }

  let singleLimit: number;
  let multiLimit: number;

  if (isUnicode) {
    singleLimit = 70;
    multiLimit = 67;
  } else {
    singleLimit = 160;
    multiLimit = 153;
  }

  let messageCount = 1;
  let charRemain = 0;

  if (charCount <= singleLimit) {
    messageCount = 1;
    charRemain = singleLimit - charCount;
  } else {
    messageCount = Math.ceil(charCount / multiLimit);
    charRemain = (messageCount * multiLimit) - charCount;
  }

  const totalSmsCost = messageCount * recipientCount;

  return {
    charCount,
    charLimit: messageCount === 1 ? singleLimit : messageCount * multiLimit,
    charRemain,
    messageCount,
    segments: messageCount,
    isUnicode,
    totalSmsCost,
  };
}

export function formatPhoneNumber(phone: string): string {
  // Format Bangladesh numbers like 8801749421005 or 01749421005
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('880') && clean.length === 13) {
    return `+${clean.slice(0, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  }
  if (clean.startsWith('01') && clean.length === 11) {
    return `+88 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return phone;
}
