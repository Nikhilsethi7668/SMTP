import express from "express";
import EmailAccount from "../models/EmailAccount.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

router.post("/connect/custom", async (req, res) => {
  try {
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

    res.json({ 
      success: true,
      message: "✅ Custom mail connected successfully!", 
      data: account 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to connect custom email account",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/accounts", async (req, res) => {
  try {
    const userId = req.user!.id;
    const accounts = await EmailAccount.find({ userId });
    res.json({
      success: true,
      data: accounts,
      message: "Accounts retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve accounts",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.delete("/accounts/:id/disconnect", async (req, res) => {
  try {
    const deletedAccount = await EmailAccount.findByIdAndDelete(req.params.id);
    if (!deletedAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }
    res.json({ 
      success: true,
      message: "Disconnected successfully" 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to disconnect account",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.patch("/accounts/:id/set-primary", async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // First, set all accounts for this user to non-primary
    await EmailAccount.updateMany({ userId }, { isPrimary: false });
    
    // Then set the selected account as primary
    const updatedAccount = await EmailAccount.findByIdAndUpdate(
      req.params.id, 
      { isPrimary: true },
      { new: true }
    );
    
    if (!updatedAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }
    
    res.json({
      success: true,
      message: "Set as primary successfully",
      data: updatedAccount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to set primary account",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
export default router;
