import express from "express";
import { authenticate } from "../middleware/authMiddleware.js"; // Only authenticate, remove authorize
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all users (Admin only) – check role manually
router.get("/", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch profile data" });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, currentPassword, newPassword } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({ message: "Profile updated successfully", user: userData });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
