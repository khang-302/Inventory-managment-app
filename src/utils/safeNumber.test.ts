import { describe, it, expect } from 'vitest';
import {
  toSafeNumber,
  toSafeInt,
  toSafePositive,
  toSafeQuantity,
  safeAdd,
  safeMultiply,
  safeDivide,
  calculateProfitSafe,
  calculateTotalSafe,
} from './safeNumber';

describe('Safe Number Utilities', () => {
  describe('toSafeNumber', () => {
    it('returns valid numbers as-is', () => { expect(toSafeNumber(42)).toBe(42); });
    it('converts string numbers', () => { expect(toSafeNumber('123')).toBe(123); });
    it('returns fallback for NaN', () => { expect(toSafeNumber(NaN, 0)).toBe(0); });
    it('returns fallback for null', () => { expect(toSafeNumber(null, 99)).toBe(99); });
    it('returns fallback for undefined', () => { expect(toSafeNumber(undefined)).toBe(0); });
    it('returns fallback for empty string', () => { expect(toSafeNumber('')).toBe(0); });
    it('returns fallback for Infinity', () => { expect(toSafeNumber(Infinity)).toBe(0); });
  });

  describe('toSafeQuantity', () => {
    it('floors fractional values', () => { expect(toSafeQuantity(3.7)).toBe(3); });
    it('clamps negatives to 0', () => { expect(toSafeQuantity(-5)).toBe(0); });
    it('handles zero', () => { expect(toSafeQuantity(0)).toBe(0); });
  });

  describe('safeAdd', () => {
    it('adds valid numbers', () => { expect(safeAdd(1, 2, 3)).toBe(6); });
    it('treats NaN as 0', () => { expect(safeAdd(10, NaN, 5)).toBe(15); });
  });

  describe('safeMultiply', () => {
    it('multiplies correctly', () => { expect(safeMultiply(5, 10)).toBe(50); });
    it('handles NaN inputs', () => { expect(safeMultiply(NaN, 10)).toBe(0); });
  });

  describe('safeDivide', () => {
    it('divides correctly', () => { expect(safeDivide(10, 2)).toBe(5); });
    it('returns fallback on zero denominator', () => { expect(safeDivide(10, 0, -1)).toBe(-1); });
  });

  describe('calculateProfitSafe', () => {
    it('calculates profit = (sell - buy) * qty', () => {
      expect(calculateProfitSafe(100, 150, 10)).toBe(500);
    });
    it('handles negative profit (loss)', () => {
      expect(calculateProfitSafe(200, 100, 5)).toBe(-500);
    });
  });

  describe('calculateTotalSafe', () => {
    it('calculates total = qty * price', () => {
      expect(calculateTotalSafe(5, 200)).toBe(1000);
    });
  });
});
