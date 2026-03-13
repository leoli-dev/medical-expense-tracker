import { Router, Request, Response } from "express";
import { login, getUserById } from "../services/auth.service.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const result = await login(username, password);
  if (!result) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  res.json(result);
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const user = await getUserById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

export default router;
