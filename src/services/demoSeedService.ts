import { db, getSetting, updateSetting } from '@/db/database';

/**
 * Clear all demo data from the database.
 * Runs once on startup to purge any previously seeded demo data.
 */
export async function clearAllDemoData(): Promise<void> {
  try {
    const alreadyCleared = await getSetting<boolean>('demoDataCleared');
    if (alreadyCleared) return;

    // Delete only parts explicitly marked as demo
    const demoParts = await db.parts.filter(p => p.isDemo === true).toArray();
    if (demoParts.length > 0) {
      await db.parts.bulkDelete(demoParts.map(p => p.id));
    }

    await updateSetting('demoDataCleared', true);
    console.log(`[DemoCleanup] Removed ${demoParts.length} demo parts`);
  } catch (error) {
    console.error('[DemoCleanup] Failed to clear demo data:', error);
  }
}
