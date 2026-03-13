import { eq, and, like, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { expenses } from "../db/schema.js";

export interface CreateExpenseInput {
  userId: number;
  paidDate: string;
  paidAmount: number;
  description: string;
  claimDate?: string | null;
  reimbursementAmount?: number | null;
  receiptPath?: string | null;
}

export interface UpdateExpenseInput {
  paidDate?: string;
  paidAmount?: number;
  description?: string;
  claimDate?: string | null;
  reimbursementAmount?: number | null;
  receiptPath?: string | null;
}

export async function getExpensesByYear(userId: number, year: number) {
  const items = await db
    .select()
    .from(expenses)
    .where(
      and(eq(expenses.userId, userId), like(expenses.paidDate, `${year}-%`))
    )
    .orderBy(asc(expenses.paidDate));

  const totalPaid = items.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalReimbursed = items.reduce(
    (sum, e) => sum + (e.reimbursementAmount || 0),
    0
  );

  return {
    items,
    totals: {
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalReimbursed: Math.round(totalReimbursed * 100) / 100,
      outOfPocket: Math.round((totalPaid - totalReimbursed) * 100) / 100,
    },
  };
}

export async function createExpense(input: CreateExpenseInput) {
  const result = await db.insert(expenses).values({
    userId: input.userId,
    paidDate: input.paidDate,
    paidAmount: input.paidAmount,
    description: input.description,
    claimDate: input.claimDate ?? null,
    reimbursementAmount: input.reimbursementAmount ?? null,
    receiptPath: input.receiptPath ?? null,
  }).returning();

  return result[0];
}

export async function updateExpense(
  id: number,
  userId: number,
  input: UpdateExpenseInput
) {
  const existing = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  if (existing.length === 0) return null;

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.paidDate !== undefined) updateData.paidDate = input.paidDate;
  if (input.paidAmount !== undefined) updateData.paidAmount = input.paidAmount;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.claimDate !== undefined) updateData.claimDate = input.claimDate;
  if (input.reimbursementAmount !== undefined)
    updateData.reimbursementAmount = input.reimbursementAmount;
  if (input.receiptPath !== undefined) updateData.receiptPath = input.receiptPath;

  const result = await db
    .update(expenses)
    .set(updateData)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .returning();

  return result[0];
}

export async function deleteExpense(id: number, userId: number) {
  const existing = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  if (existing.length === 0) return false;

  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  return true;
}
