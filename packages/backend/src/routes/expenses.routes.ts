import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getExpensesByYear,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expense.service.js";
import { generateCSV } from "../utils/csv.js";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const result = await getExpensesByYear(req.user!.userId, year);
  res.json(result);
});

router.post("/", async (req: Request, res: Response) => {
  const { paidDate, paidAmount, description, claimDate, reimbursementAmount, receiptPath } =
    req.body;

  if (!paidDate || paidAmount === undefined || !description) {
    res
      .status(400)
      .json({ error: "paidDate, paidAmount, and description are required" });
    return;
  }

  const expense = await createExpense({
    userId: req.user!.userId,
    paidDate,
    paidAmount: parseFloat(String(paidAmount)),
    description,
    claimDate: claimDate || null,
    reimbursementAmount: reimbursementAmount != null ? parseFloat(reimbursementAmount) : null,
    receiptPath: receiptPath || null,
  });

  res.status(201).json(expense);
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const { paidDate, paidAmount, description, claimDate, reimbursementAmount, receiptPath } =
    req.body;

  const updateData: Record<string, unknown> = {};
  if (paidDate !== undefined) updateData.paidDate = paidDate;
  if (paidAmount !== undefined) updateData.paidAmount = parseFloat(String(paidAmount));
  if (description !== undefined) updateData.description = description;
  if (claimDate !== undefined) updateData.claimDate = claimDate;
  if (reimbursementAmount !== undefined)
    updateData.reimbursementAmount =
      reimbursementAmount != null ? parseFloat(reimbursementAmount) : null;
  if (receiptPath !== undefined) updateData.receiptPath = receiptPath;

  const expense = await updateExpense(id, req.user!.userId, updateData);
  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json(expense);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const deleted = await deleteExpense(id, req.user!.userId);

  if (!deleted) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json({ success: true });
});

router.get("/export", async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const result = await getExpensesByYear(req.user!.userId, year);

  const csv = generateCSV(result.items);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="medical-expenses-${year}.csv"`
  );
  res.send(csv);
});

export default router;
