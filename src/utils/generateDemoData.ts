import { v4 as uuidv4 } from 'uuid';
import type { Part } from '@/types';
import type { Bill, BillItem } from '@/types/bill';
import { db } from '@/db/database';

// ── Part name templates ──────────────────────────────────────────────
const PART_CATEGORIES: Record<string, string[]> = {
  'Engine Parts': [
    'Piston Ring', 'Cylinder Head', 'Crankshaft', 'Camshaft', 'Valve Spring',
    'Oil Pump', 'Timing Chain', 'Connecting Rod', 'Engine Mount', 'Rocker Arm',
    'Flywheel', 'Intake Manifold', 'Exhaust Manifold', 'Head Gasket', 'Oil Pan',
  ],
  'Brake System': [
    'Brake Pad', 'Brake Disc', 'Brake Drum', 'Brake Caliper', 'Brake Shoe',
    'Brake Hose', 'Master Cylinder', 'Brake Booster', 'ABS Sensor', 'Brake Line',
  ],
  'Suspension': [
    'Shock Absorber', 'Coil Spring', 'Control Arm', 'Ball Joint', 'Tie Rod End',
    'Stabilizer Link', 'Strut Mount', 'Leaf Spring', 'Bushing Kit', 'Sway Bar',
  ],
  'Electrical': [
    'Alternator', 'Starter Motor', 'Ignition Coil', 'Spark Plug', 'Battery Terminal',
    'Fuse Box', 'Wiring Harness', 'Relay Module', 'Voltage Regulator', 'Sensor Unit',
  ],
  'Cooling System': [
    'Radiator', 'Water Pump', 'Thermostat', 'Coolant Hose', 'Fan Clutch',
    'Expansion Tank', 'Heater Core', 'Radiator Cap', 'Temperature Sensor', 'Fan Belt',
  ],
  'Transmission': [
    'Clutch Plate', 'Pressure Plate', 'Gear Shaft', 'Synchronizer Ring', 'Shift Fork',
    'Transmission Mount', 'Clutch Cable', 'Flywheel Ring Gear', 'Speedometer Gear', 'Oil Seal',
  ],
  'Fuel System': [
    'Fuel Pump', 'Fuel Filter', 'Injector Nozzle', 'Carburetor Kit', 'Fuel Tank Cap',
    'Fuel Line', 'Throttle Body', 'Air Filter', 'Fuel Pressure Regulator', 'Intake Valve',
  ],
  'Filters': [
    'Oil Filter', 'Air Filter Element', 'Cabin Filter', 'Hydraulic Filter', 'Fuel Filter Element',
    'Transmission Filter', 'Power Steering Filter', 'Breather Filter', 'Coolant Filter', 'Diesel Filter',
  ],
  'Bearings & Seals': [
    'Wheel Bearing', 'Crankshaft Bearing', 'Camshaft Bearing', 'Pilot Bearing', 'Thrust Bearing',
    'Oil Seal Front', 'Oil Seal Rear', 'Axle Seal', 'Valve Stem Seal', 'Hub Seal',
  ],
  'Hydraulic Parts': [
    'Hydraulic Pump', 'Hydraulic Cylinder', 'Hydraulic Hose', 'Control Valve', 'Hydraulic Motor',
    'Pressure Gauge', 'Flow Divider', 'Accumulator', 'Hydraulic Jack', 'Ram Cylinder',
  ],
  'Belts & Chains': [
    'V-Belt', 'Serpentine Belt', 'Timing Belt', 'Fan Belt', 'AC Belt',
    'Chain Link', 'Roller Chain', 'Drive Chain', 'Silent Chain', 'Timing Chain Kit',
  ],
  'Exhaust System': [
    'Muffler', 'Catalytic Converter', 'Exhaust Pipe', 'Exhaust Gasket', 'Oxygen Sensor',
    'Exhaust Clamp', 'Flex Pipe', 'Resonator', 'Tail Pipe', 'Heat Shield',
  ],
  'Steering': [
    'Power Steering Pump', 'Steering Rack', 'Steering Column', 'Steering Wheel Hub', 'Pitman Arm',
    'Idler Arm', 'Drag Link', 'Steering Gear Box', 'Steering Knuckle', 'Center Link',
  ],
  'Body Parts': [
    'Side Mirror', 'Door Handle', 'Window Regulator', 'Bumper Bracket', 'Fender Liner',
    'Hood Latch', 'Trunk Lock', 'Wiper Motor', 'Wiper Blade', 'Headlight Assembly',
  ],
};

const BRANDS = [
  'Toyota Genuine', 'Honda Atlas', 'Suzuki Parts', 'Denso', 'Bosch',
  'NGK', 'Aisin', 'KYB', 'Monroe', 'Gates',
  'Mahle', 'Mann Filter', 'Valeo', 'SKF', 'NTN',
  'Koyo', 'Exedy', 'TRW', 'Brembo', 'Dayco',
];

const CATEGORY_NAMES = Object.keys(PART_CATEGORIES);

const LOCATIONS = [
  'Shelf A1', 'Shelf A2', 'Shelf A3', 'Shelf B1', 'Shelf B2', 'Shelf B3',
  'Shelf C1', 'Shelf C2', 'Shelf C3', 'Shelf D1', 'Shelf D2',
  'Rack E1', 'Rack E2', 'Rack F1', 'Rack F2', 'Rack G1',
  'Warehouse W1', 'Warehouse W2', 'Warehouse W3', 'Counter Display',
];

// ── Customer name pools ──────────────────────────────────────────────
const FIRST_NAMES = [
  'Ahmed', 'Muhammad', 'Ali', 'Hassan', 'Usman', 'Bilal', 'Tariq', 'Imran',
  'Salman', 'Farhan', 'Waqas', 'Asad', 'Zubair', 'Kamran', 'Naveed',
  'Shahid', 'Faisal', 'Adnan', 'Rizwan', 'Kashif', 'Junaid', 'Irfan',
  'Sohail', 'Nasir', 'Amir', 'Hamza', 'Saad', 'Yasir', 'Owais', 'Qasim',
  'Arslan', 'Mohsin', 'Danish', 'Tahir', 'Zahid', 'Shakeel', 'Nadeem',
  'Aamir', 'Shoaib', 'Waseem', 'Khalid', 'Majid', 'Rafiq', 'Sajid',
  'Tanveer', 'Babar', 'Zeeshan', 'Rehan', 'Saqib', 'Atif',
];

const LAST_NAMES = [
  'Khan', 'Ahmed', 'Ali', 'Malik', 'Sheikh', 'Butt', 'Chaudhry', 'Iqbal',
  'Hussain', 'Raza', 'Siddiqui', 'Qureshi', 'Mirza', 'Ansari', 'Hashmi',
  'Bhatti', 'Gill', 'Javed', 'Akram', 'Aslam', 'Rehman', 'Memon',
  'Shah', 'Durrani', 'Niazi', 'Lodhi', 'Khattak', 'Yousaf', 'Baloch', 'Afridi',
];

// ── Helpers ──────────────────────────────────────────────────────────
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const prefixes = ['0300', '0301', '0302', '0303', '0304', '0311', '0312', '0313', '0321', '0322', '0331', '0332', '0333', '0345', '0346'];
  return `${pick(prefixes)}-${rand(1000000, 9999999)}`;
}

function randomDate(monthsBack: number): Date {
  const now = Date.now();
  const past = now - monthsBack * 30 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

// ── Generators ───────────────────────────────────────────────────────
export function generateDemoSpareParts(count: number = 1000): Part[] {
  const parts: Part[] = [];
  // Flatten all templates
  const allTemplates: { category: string; name: string }[] = [];
  for (const [cat, names] of Object.entries(PART_CATEGORIES)) {
    for (const name of names) {
      allTemplates.push({ category: cat, name });
    }
  }

  for (let i = 0; i < count; i++) {
    const template = allTemplates[i % allTemplates.length];
    const variant = Math.floor(i / allTemplates.length) + 1;
    const suffix = allTemplates.length <= count ? ` Model ${String(variant).padStart(2, '0')}` : '';
    const partName = `${template.name}${suffix}`;
    const buyingPrice = rand(500, 150000);
    const markup = 1 + rand(20, 40) / 100;

    parts.push({
      id: uuidv4(),
      name: partName,
      sku: `DEMO-${String(i + 1).padStart(4, '0')}`,
      brandId: pick(BRANDS),
      categoryId: template.category,
      buyingPrice,
      sellingPrice: Math.round(buyingPrice * markup),
      quantity: rand(0, 200),
      minStockLevel: rand(2, 20),
      location: pick(LOCATIONS),
      notes: `Demo part for testing — ${template.category}`,
      images: [],
      unitType: 'piece' as const,
      isDemo: true,
      createdAt: randomDate(6),
      updatedAt: new Date(),
    });
  }
  return parts;
}

export function generateDemoBills(
  count: number = 1000,
  parts: Part[],
): { bills: Bill[]; billItems: BillItem[] } {
  const bills: Bill[] = [];
  const billItems: BillItem[] = [];

  for (let i = 0; i < count; i++) {
    const billId = uuidv4();
    const itemCount = rand(1, 5);
    const date = randomDate(6);
    let subtotal = 0;
    const usedParts = new Set<number>();

    for (let j = 0; j < itemCount; j++) {
      let partIdx: number;
      do { partIdx = rand(0, parts.length - 1); } while (usedParts.has(partIdx) && usedParts.size < parts.length);
      usedParts.add(partIdx);
      const part = parts[partIdx];
      const qty = rand(1, 5);
      const price = part.sellingPrice;
      const total = qty * price;
      subtotal += total;

      billItems.push({
        id: uuidv4(),
        billId,
        partName: part.name,
        partCode: part.sku,
        brand: part.brandId,
        quantity: qty,
        price,
        total,
      });
    }

    const discountPct = rand(0, 10);
    const discount = Math.round(subtotal * discountPct / 100);

    bills.push({
      id: billId,
      billNumber: `DEMO-${String(i + 1).padStart(4, '0')}`,
      buyerName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      buyerPhone: randomPhone(),
      date,
      subtotal,
      discount,
      finalTotal: subtotal - discount,
      notes: '',
      isDemo: true,
      createdAt: date,
    });
  }

  return { bills, billItems };
}

// ── Database operations ──────────────────────────────────────────────
const BATCH_SIZE = 100;

async function bulkAddInBatches<T>(table: any, items: T[]): Promise<void> {
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await table.bulkAdd(batch);
  }
}

export async function hasDemoData(): Promise<boolean> {
  const count = await db.parts.where('isDemo').equals(1).count();
  return count > 0;
}

export async function insertDemoData(
  onProgress?: (pct: number) => void,
): Promise<{ partsCount: number; billsCount: number }> {
  const parts = generateDemoSpareParts(1000);
  onProgress?.(5);

  const { bills, billItems } = generateDemoBills(1000, parts);
  onProgress?.(10);

  // Insert parts in batches
  const totalSteps = Math.ceil(parts.length / BATCH_SIZE)
    + Math.ceil(bills.length / BATCH_SIZE)
    + Math.ceil(billItems.length / BATCH_SIZE);
  let step = 0;

  for (let i = 0; i < parts.length; i += BATCH_SIZE) {
    await db.parts.bulkAdd(parts.slice(i, i + BATCH_SIZE));
    step++;
    onProgress?.(10 + Math.round((step / totalSteps) * 85));
  }

  for (let i = 0; i < bills.length; i += BATCH_SIZE) {
    await (db as any).bills.bulkAdd(bills.slice(i, i + BATCH_SIZE));
    step++;
    onProgress?.(10 + Math.round((step / totalSteps) * 85));
  }

  for (let i = 0; i < billItems.length; i += BATCH_SIZE) {
    await (db as any).billItems.bulkAdd(billItems.slice(i, i + BATCH_SIZE));
    step++;
    onProgress?.(10 + Math.round((step / totalSteps) * 85));
  }

  onProgress?.(100);
  return { partsCount: parts.length, billsCount: bills.length };
}

export async function clearDemoData(): Promise<{ partsCleared: number; billsCleared: number }> {
  // Find demo parts
  const demoParts = await db.parts.filter(p => p.isDemo === true).toArray();
  const demoPartIds = demoParts.map(p => p.id);

  // Find demo bills
  const demoBills = await (db as any).bills.filter((b: any) => b.isDemo === true).toArray();
  const demoBillIds = demoBills.map((b: any) => b.id);

  // Find bill items for demo bills
  const demoBillItems = await (db as any).billItems
    .filter((bi: any) => demoBillIds.includes(bi.billId))
    .toArray();

  await db.transaction('rw', [db.parts, (db as any).bills, (db as any).billItems], async () => {
    if (demoPartIds.length) await db.parts.bulkDelete(demoPartIds);
    if (demoBillIds.length) await (db as any).bills.bulkDelete(demoBillIds);
    if (demoBillItems.length) await (db as any).billItems.bulkDelete(demoBillItems.map((bi: any) => bi.id));
  });

  return { partsCleared: demoParts.length, billsCleared: demoBills.length };
}
