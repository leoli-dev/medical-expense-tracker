import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import expensesRoutes from "./routes/expenses.routes.js";
import receiptsRoutes from "./routes/receipts.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/receipts", receiptsRoutes);

// Serve frontend static files in production
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
