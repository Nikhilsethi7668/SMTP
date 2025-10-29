import express from "express";
import EmailAccount from "../models/EmailAccount.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.post("/connect/custom", async (req, res) => {
  const { email, smtp, imap } = req.body;
  const user = req.user!.id;
  if (!email || !smtp || !imap || !user) {
    return res.status(400).json({
      success: false,
      message: "Email, SMTP, IMAP, and user are required",
    });
  }

  const account = await EmailAccount.create({
    userId: user,
    provider: "custom",
    email,
    smtp,
    imap,
  });

  res.json({ message: "✅ Custom mail connected successfully!", account });
});

router.get("/accounts", async (req, res) => {
  const userId = req.user!.id;
  const accounts = await EmailAccount.find({ userId });
  res.json(accounts);
});

router.delete("/accounts/:id/disconnect", async (req, res) => {
  await EmailAccount.findByIdAndDelete(req.params.id);
  res.json({ message: "Disconnected successfully" });
});

export default router;
