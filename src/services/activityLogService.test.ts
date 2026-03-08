import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/database';
import {
  logActivity,
  getAllActivityLogs,
  getRecentActivity,
  getActivityLogsByEntity,
  getActivityLogsByAction,
  getActivityCounts,
  clearActivityLogs,
  getActivityIcon,
  getActivityColor,
} from './activityLogService';

describe('Activity Log Service', () => {
  beforeEach(async () => {
    await db.activityLogs.clear();
  });

  describe('logActivity', () => {
    it('creates a log with correct fields', async () => {
      const log = await logActivity({
        action: 'create',
        entityType: 'part',
        entityId: 'part-1',
        description: 'Created test part',
        metadata: { key: 'value' },
      });

      expect(log.id).toBeDefined();
      expect(log.action).toBe('create');
      expect(log.entityType).toBe('part');
      expect(log.entityId).toBe('part-1');
      expect(log.description).toBe('Created test part');
      expect(log.isDeleted).toBe(false);
      expect(log.createdAt).toBeInstanceOf(Date);
    });

    it('persists to database', async () => {
      const log = await logActivity({
        action: 'sale',
        entityType: 'sale',
        description: 'Test sale',
      });
      const saved = await db.activityLogs.get(log.id);
      expect(saved).toBeDefined();
      expect(saved!.action).toBe('sale');
    });
  });

  describe('getAllActivityLogs', () => {
    it('returns logs in reverse chronological order', async () => {
      await logActivity({ action: 'create', entityType: 'part', description: 'First' });
      await logActivity({ action: 'update', entityType: 'part', description: 'Second' });

      const logs = await getAllActivityLogs();
      expect(logs.length).toBe(2);
      expect(logs[0].description).toBe('Second');
    });

    it('respects limit parameter', async () => {
      for (let i = 0; i < 5; i++) {
        await logActivity({ action: 'create', entityType: 'part', description: `Log ${i}` });
      }
      const logs = await getAllActivityLogs(3);
      expect(logs.length).toBe(3);
    });
  });

  describe('getRecentActivity', () => {
    it('returns limited recent logs', async () => {
      for (let i = 0; i < 20; i++) {
        await logActivity({ action: 'create', entityType: 'part', description: `Log ${i}` });
      }
      const recent = await getRecentActivity(5);
      expect(recent.length).toBe(5);
    });
  });

  describe('getActivityLogsByEntity', () => {
    it('filters by entity type and id', async () => {
      await logActivity({ action: 'create', entityType: 'part', entityId: 'p1', description: 'Part 1' });
      await logActivity({ action: 'update', entityType: 'part', entityId: 'p1', description: 'Part 1 update' });
      await logActivity({ action: 'create', entityType: 'part', entityId: 'p2', description: 'Part 2' });

      const logs = await getActivityLogsByEntity('part', 'p1');
      expect(logs.length).toBe(2);
      expect(logs.every(l => l.entityId === 'p1')).toBe(true);
    });
  });

  describe('getActivityLogsByAction', () => {
    it('filters by action type', async () => {
      await logActivity({ action: 'create', entityType: 'part', description: 'Created' });
      await logActivity({ action: 'sale', entityType: 'sale', description: 'Sale' });
      await logActivity({ action: 'create', entityType: 'brand', description: 'Brand' });

      const creates = await getActivityLogsByAction('create');
      expect(creates.length).toBe(2);
    });
  });

  describe('getActivityCounts', () => {
    it('returns correct counts per action type', async () => {
      await logActivity({ action: 'create', entityType: 'part', description: 'C1' });
      await logActivity({ action: 'create', entityType: 'part', description: 'C2' });
      await logActivity({ action: 'sale', entityType: 'sale', description: 'S1' });

      const counts = await getActivityCounts();
      expect(counts.create).toBe(2);
      expect(counts.sale).toBe(1);
      expect(counts.delete).toBe(0);
    });
  });

  describe('clearActivityLogs', () => {
    it('removes all logs', async () => {
      await logActivity({ action: 'create', entityType: 'part', description: 'Test' });
      await clearActivityLogs();
      const logs = await getAllActivityLogs();
      expect(logs.length).toBe(0);
    });
  });

  describe('getActivityIcon', () => {
    it('returns correct icons for each action', () => {
      expect(getActivityIcon('create')).toBe('Plus');
      expect(getActivityIcon('delete')).toBe('Trash2');
      expect(getActivityIcon('sale')).toBe('ShoppingCart');
      expect(getActivityIcon('backup')).toBe('Download');
    });
  });

  describe('getActivityColor', () => {
    it('returns correct color classes', () => {
      expect(getActivityColor('create')).toBe('text-success');
      expect(getActivityColor('delete')).toBe('text-destructive');
    });
  });
});
