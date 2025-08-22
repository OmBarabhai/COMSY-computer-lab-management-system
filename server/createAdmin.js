import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    const adminData = {
      username: "admin1",
      name: "Admin User",
      email: "admin1@comsy.com",
      password: "AdminPassword123!",
      role: "admin"
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      return process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    adminData.password = hashedPassword;

    // Create admin user
    const admin = await User.create(adminData);
    console.log("✅ Admin created successfully!");
    console.log("Email:", admin.email);
    console.log("Password (plain text): AdminPassword123!"); // Keep track for login

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
