import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const username = "admin1";
    const password = "AdminPassword123!";

    const user = await User.findOne({ username });
    if (!user) return console.log("User not found");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

testLogin();
