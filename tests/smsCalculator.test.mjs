import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSmsMetrics, checkIsUnicode, formatPhoneNumber } from '../src/utils/smsCalculator.ts';

test('SMS Calculator - Empty Message', () => {
  const result = calculateSmsMetrics('', 10);
  assert.equal(result.charCount, 0);
  assert.equal(result.charRemain, 160);
  assert.equal(result.messageCount, 0);
  assert.equal(result.totalSmsCost, 0);
  assert.equal(result.isUnicode, false);
});

test('SMS Calculator - Standard GSM 7-bit Single Part', () => {
  const msg = 'Dear Guardian, your child attended school today.';
  const result = calculateSmsMetrics(msg, 5);
  assert.equal(result.charCount, msg.length);
  assert.equal(result.isUnicode, false);
  assert.equal(result.messageCount, 1);
  assert.equal(result.charRemain, 160 - msg.length);
  assert.equal(result.totalSmsCost, 5);
});

test('SMS Calculator - Standard GSM 7-bit Multi-part Boundary', () => {
  const msg160 = 'A'.repeat(160);
  const res160 = calculateSmsMetrics(msg160, 2);
  assert.equal(res160.messageCount, 1);
  assert.equal(res160.charRemain, 0);
  assert.equal(res160.totalSmsCost, 2);

  // 161 characters triggers 2 segments with 153 chars/segment
  const msg161 = 'A'.repeat(161);
  const res161 = calculateSmsMetrics(msg161, 2);
  assert.equal(res161.messageCount, 2);
  assert.equal(res161.charRemain, (2 * 153) - 161);
  assert.equal(res161.totalSmsCost, 4);
});

test('SMS Calculator - Unicode Bengali Text Detection & Calculation', () => {
  const bengaliMsg = 'সম্মানিত অভিভাবক, ব্রিটিশ স্ট্যান্ডার্ড স্কুল এ আপনাকে স্বাগতম।';
  assert.equal(checkIsUnicode(bengaliMsg), true);

  const result = calculateSmsMetrics(bengaliMsg, 3);
  assert.equal(result.isUnicode, true);
  assert.equal(result.charCount, bengaliMsg.length);
  assert.ok(result.messageCount >= 1);
  assert.equal(result.totalSmsCost, result.messageCount * 3);
});

test('SMS Calculator - Phone Number Formatting', () => {
  assert.equal(formatPhoneNumber('8801749421005'), '+880 1749 421005');
  assert.equal(formatPhoneNumber('01749421005'), '+88 01749 421005');
  assert.equal(formatPhoneNumber(''), '');
  assert.equal(formatPhoneNumber(null), '');
  assert.equal(formatPhoneNumber(undefined), '');
});
