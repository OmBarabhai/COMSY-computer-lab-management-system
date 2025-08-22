import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==================== Login ====================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // Debug logs
    console.log("---- Login Debug ----");
    console.log("Email entered:", email);
    console.log("Password entered:", password);
    console.log("Stored hashed password:", user.password);

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid?", isPasswordValid);

    if (!isPasswordValid) return res.status(401).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
