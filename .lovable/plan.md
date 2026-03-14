## Plan: Extended Demo Data Generator (3,000 Spare Parts + 3,000 Bills)

### Overview

Extend the existing demo data generator to create a **larger, realistic dataset** that simulates approximately **one year of shop activity**.

This dataset will allow proper testing of:

• inventory performance  
• bill history performance  
• reports and analytics  
• profit calculations  
• UI responsiveness with large datasets

The generator will create:

```text
3,000 Spare Parts
3,000 Bills

```

All generated records must be tagged with `isDemo: true` so they can be safely removed later.

---

# 1. Update `src/utils/generateDemoData.ts`

Enhance the existing generator functions so they can support larger datasets and more realistic sales behavior.

---

## Enhance `generateDemoSpareParts(count: number)`

Update the spare parts generator to support **3,000 parts** with realistic attributes.

### Requirements

• Allow `count = 3000`  
• Ensure each part has a **unique SKU**

Example pattern:

```
DEMO-0001 → DEMO-3000

```

### Profit Margin Distribution

Replace the fixed markup with a **weighted margin system**.


| Margin Type            | Probability |
| ---------------------- | ----------- |
| Low margin (5–10%)     | 20%         |
| Normal margin (15–30%) | 60%         |
| High margin (30–45%)   | 20%         |


Selling price must be calculated from cost price using the selected margin.

---

### Inventory Values

Generate realistic inventory data:


| Field           | Range    |
| --------------- | -------- |
| Stock Quantity  | 0 – 300  |
| Low Stock Level | 3 – 25   |
| Shelf Location  | A1 – Z10 |


All generated parts must include:

```ts
isDemo: true

```

---

# 2. Enhance `generateDemoBills(count: number, parts: Part[])`

Update the bill generator to create **3,000 realistic bills**.

### Bill Creation Rule

Bills **must be created using the existing billing service**:

```
createBill()

```

This ensures the system uses real production logic including:

• bill numbering  
• totals calculation  
• validation  
• persistence

Direct database insertion must not be used.

---

### Bill Date Distribution

Bill dates must be randomly distributed across the **past 12 months**.

This allows proper testing of:

• monthly reports  
• yearly statistics  
• sales trends

---

### Items Per Bill

Use weighted distribution to simulate real shop sales:


| Items in Bill | Probability |
| ------------- | ----------- |
| 1 item        | 25%         |
| 2–3 items     | 45%         |
| 4–6 items     | 30%         |


---

### Sales Popularity Simulation

To simulate real shop behavior:

• some parts should appear frequently in bills  
• some parts should appear occasionally  
• some parts should rarely appear

Implement a **popularity weighting system** when selecting items for bills.

---

### Inventory Adjustment

When bills are generated, stock quantities should be reduced to simulate historical sales.

However, inventory must **never become negative**.

Apply the rule:

```ts
stock = Math.max(stock - soldQuantity, 0)

```

---

### Demo Tagging

Every generated bill must include:

```ts
isDemo: true

```

This allows safe deletion later.

---

# 3. Add `insertExtendedDemoData()` Function

Create a new utility function:

```
insertExtendedDemoData(onProgress)

```

Responsibilities:

1. Generate **3,000 spare parts**
2. Insert them into the database using batch inserts
3. Generate **3,000 bills** referencing those parts
4. Use progress callbacks to update the UI

---

# 4. Performance-Safe Data Generation

To prevent UI freezing, all inserts must use **batch processing**.

Recommended configuration:

```
batch size: 100

```

Rules:

• Insert spare parts in batches  
• Create bills in controlled asynchronous batches  
• Provide progress updates to the UI

---

# 5. Update Settings Page

File:

```
src/pages/Settings.tsx

```

Add a new button in the **Developer / Testing Tools** section.

### Button

```
Generate Extended Demo Data
(3000 Spare Parts + 3000 Bills)

```

---

### Confirmation Dialog

Before generation, display warning:

```
This will generate a large demo dataset simulating one year of shop activity.

The system will create 3,000 spare parts and 3,000 bills.
This data is for testing purposes only and can be removed using "Clear Demo Data".

```

---

### Duplicate Protection

Before generating extended demo data, check if demo data already exists.

If demo records are found:

```
Demo data already exists.
Please clear demo data before generating again.

```

---

# Expected Result

After running the generator:

Inventory contains:

```
3,000 demo spare parts

```

Bill history contains:

```
3,000 demo bills

```

The dataset should simulate approximately **one year of shop activity**, including:

• realistic profit margins  
• varied customer purchases  
• repeated buyers  
• different sales volumes  
• historical sales data

The application should remain **stable, responsive, and capable of scaling to 10,000+ spare parts in real-world usage**.