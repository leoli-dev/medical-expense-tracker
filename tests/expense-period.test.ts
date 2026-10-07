import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseExpenseRange } from "../packages/backend/src/utils/dateRange.ts";
import {
  rangeDays,
  shiftDate,
  yearRange,
} from "../packages/frontend/src/utils/dateRange.ts";

test("365-day inclusive windows handle leap years and cross-year dates", () => {
  for (const startDate of [
    "2024-01-01",
    "2024-02-29",
    "2025-10-08",
    "2026-01-01",
  ]) {
    const endDate = shiftDate(startDate, 364);
    assert.equal(rangeDays({ startDate, endDate }), 365);
    assert.equal(shiftDate(endDate, -364), startDate);
  }
  assert.equal(rangeDays(yearRange(2024)), 366);
  assert.equal(shiftDate("2025-10-08", 364), "2026-10-07");
});
test("API range validates real dates, order, and legacy years", () => {
  assert.deepEqual(parseExpenseRange({ year: "2026" }), yearRange(2026));
  assert.deepEqual(
    parseExpenseRange({ startDate: "2024-02-29", endDate: "2025-02-28" }),
    { startDate: "2024-02-29", endDate: "2025-02-28" },
  );
  for (const query of [
    { startDate: "2026-02-29", endDate: "2026-03-01" },
    { startDate: "2026-04-31", endDate: "2026-05-01" },
    { startDate: "2026-10-08", endDate: "2026-10-07" },
    { startDate: "2026-10-08" },
    { year: "2026oops" },
    { year: "0000" },
    { startDate: ["2026-01-01"], endDate: "2026-12-31" },
  ])
    assert.equal(parseExpenseRange(query), null);
});
test("range queries include both boundaries, exclude other users, and total reimbursements", async () => {
  const dir = mkdtempSync(join(tmpdir(), "medexpense-period-"));
  process.env.DATABASE_PATH = join(dir, "test.db");
  process.env.UPLOADS_DIR = dir;
  const { db } = await import("../packages/backend/src/db/index.ts");
  const { sql } = await import("drizzle-orm");
  const { users, expenses } = await import(
    "../packages/backend/src/db/schema.ts"
  );
  const { getExpensesByRange } = await import(
    "../packages/backend/src/services/expense.service.ts"
  );
  try {
    db.run(
      sql`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password_hash TEXT, display_name TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
    );
    db.run(
      sql`CREATE TABLE expenses (id INTEGER PRIMARY KEY, user_id INTEGER, paid_date TEXT, paid_amount REAL, description TEXT, claim_date TEXT, reimbursement_amount REAL, receipt_path TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
    );
    await db.insert(users).values([
      { id: 1, username: "one", passwordHash: "test", displayName: "One" },
      { id: 2, username: "two", passwordHash: "test", displayName: "Two" },
    ]);
    await db.insert(expenses).values([
      {
        userId: 1,
        paidDate: "2025-10-07",
        paidAmount: 999,
        description: "before",
      },
      {
        userId: 1,
        paidDate: "2025-10-08",
        paidAmount: 100,
        reimbursementAmount: 30,
        description: "start",
      },
      {
        userId: 1,
        paidDate: "2026-10-07",
        paidAmount: 50,
        reimbursementAmount: 20,
        description: "end",
      },
      {
        userId: 1,
        paidDate: "2026-10-08",
        paidAmount: 999,
        description: "after",
      },
      {
        userId: 2,
        paidDate: "2026-10-07",
        paidAmount: 999,
        description: "other user",
      },
    ]);
    const result = await getExpensesByRange(1, "2025-10-08", "2026-10-07");
    assert.deepEqual(
      result.items.map((x) => x.description),
      ["start", "end"],
    );
    assert.deepEqual(result.totals, {
      totalPaid: 150,
      totalReimbursed: 50,
      outOfPocket: 100,
    });
    const { processReceipt } = await import(
      "../packages/backend/src/services/receipt.service.ts"
    );
    const pdf = join(dir, "receipt.pdf");
    writeFileSync(pdf, "%PDF-1.4\n%%EOF");
    const receipt = await processReceipt(pdf, "application/octet-stream");
    assert.equal(receipt.receiptPath, "receipt.pdf");
    assert.match(receipt.extractionWarning!, /PDF attached/);
    assert.equal(receipt.extracted.paid_amount, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
