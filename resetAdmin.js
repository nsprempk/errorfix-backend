import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@errorfixsolution.com";
    const newPassword = "Admin@123#@@";

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      console.log("Admin not found:", email);
      process.exit(1);
    }

    admin.password = await bcrypt.hash(newPassword, 12);

    await admin.save();

    console.log("Admin password reset successfully.");
    console.log("Email:", admin.email);
    console.log("New password:", newPassword);

    process.exit(0);
  } catch (error) {
    console.error("Password reset failed:", error);
    process.exit(1);
  }
};

resetAdmin();
