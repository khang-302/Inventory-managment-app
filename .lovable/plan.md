## Auto Bill Generation from Sale Workflows

### Overview

Add an optional **Auto Generate Bill** toggle to both **Record Sale** and **Quick Sell** workflows.

When enabled, the system automatically creates a bill from the sale data immediately after the sale completes.

The bill generation must be optional and must never interrupt the sale process. If bill generation fails, the sale must still complete normally.

After a successful auto-generated bill, the user should see a confirmation dialog offering **View Bill**, **Share Bill**, or **Done** actions.

---

## Changes

### 1. New Component

`src/components/sale/SaleSuccessDialog.tsx`

Create a reusable success dialog shown after a sale completes when **Auto Generate Bill** is enabled.

Dialog content:

Sale Completed Successfully  
Bill #AMT-0001 Created

Buttons:

- **View Bill** → Navigate to bill detail page
- **Share Bill** → Trigger bill image share
- **Done** → Close dialog and return to dashboard

Props:

- billId
- billNumber
- onClose

Sharing should reuse existing utilities:

- `captureBillAsImage`
- `shareViaWhatsAppNative`

---

### 2. Create Helper Function for Bill Generation

Create a helper service to avoid duplicating logic across screens.

New file:

`src/services/saleBillService.ts`

Function:

`createBillFromSale(saleData)`

Responsibilities:

- Convert sale data into bill format
- Map sale items into `BillFormItem[]`
- Call existing `createBill()` from `billService`
- Return:

```
{
  billId,
  billNumber
}

```

This ensures bill generation logic is centralized and reusable.

---

### 3. Update `src/pages/RecordSale.tsx`

Add state variables:

- autoGenerateBill
- isGeneratingBill
- createdBillId
- createdBillNumber
- showSuccessDialog

Default:

`autoGenerateBill = false`

UI Change:

Inside the **Customer Info section**, add a toggle option:

Auto Generate Bill [toggle]

This toggle should appear before the final sale action buttons.

Sale completion logic:

1. Record the sale using `recordMultiSale()`.
2. If **autoGenerateBill is OFF**:
  - Keep current behavior (toast + navigation).
3. If **autoGenerateBill is ON**:

- Set `isGeneratingBill` to true
- Call `createBillFromSale()`

After success:

- Store `billId` and `billNumber`
- Open `SaleSuccessDialog`

If bill generation fails:

Show notification:

"Sale recorded but bill generation failed"

The sale must not be cancelled.

---

### 4. Update `src/components/dashboard/QuickSellModal.tsx`

Add the same toggle:

Auto Generate Bill

Add states:

- autoGenerateBill
- isGeneratingBill
- createdBillId
- createdBillNumber
- showSuccessDialog

After the sale is recorded:

If toggle is ON:

- Call `createBillFromSale()`
- Show `SaleSuccessDialog`

If toggle is OFF:

- Keep existing Quick Sell behavior.

---

### 5. Data Mapping (Sale → Bill)


| Sale Field                    | Bill Field     |
| ----------------------------- | -------------- |
| customerName / buyerName      | buyerName      |
| customerPhone / buyerPhone    | buyerPhone     |
| sale items                    | BillFormItem[] |
| item.partName                 | partName       |
| item.partSku / partNumber     | partCode       |
| item.unitPrice / sellingPrice | price          |
| item.quantity                 | quantity       |
| brand (QuickSell only)        | brand          |
| notes                         | notes          |
| discount                      | discount       |


Bill totals must match the sale totals.

---

### 6. UI Layout

Inside the Customer Information section:

---

## Auto Generate Bill [toggle]

Success dialog layout:

✓ Sale Completed Successfully Bill #AMT-0001 Created

[ View Bill ] [ Share Bill ] [ Done ]

---

### Error Handling

Bill generation errors must never interrupt the sale process.

If bill creation fails:

- Sale remains recorded
- Show error notification
- User can manually generate a bill later if needed

---

### Expected Result

After implementation:

- Users can optionally generate a bill directly while completing a sale
- Sale workflow remains fast and simple
- Customer information is reused automatically
- No duplicate data entry is required
- Works in both **Record Sale** and **Quick Sell** workflows