import express from "express";

const router = express.Router();

// Example health check route
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SMTP Backend API is running 🚀" });
});

// Example user route (GET)
router.get("/users", async (req, res) => {
  try {
    // Replace this with your DB query logic
    const users = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example POST route
router.post("/send-email", async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Missing email fields" });
    }

    // Example response (you can integrate Nodemailer or SMTP relay here)
    res.json({
      success: true,
      message: `Email queued to ${to} with subject "${subject}"`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
