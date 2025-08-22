import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const adminEmail = "admin1@comsy.com";
    const newPassword = "AdminPassword123!"; // plain text

    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log("Admin user not found");
      process.exit(1);
    }

    admin.password = newPassword; // assign plain text
    await admin.save(); // pre-save hook hashes automatically

    console.log("Admin password reset successfully");
    console.log(`Use this password to login: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error("Error resetting password:", error);
    process.exit(1);
  }
};

resetAdminPassword();
