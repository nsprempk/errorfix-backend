import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";
dotenv.config();
const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = "admin@errorfixsolution.com";
    const password = "Admin@123#@@";
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await Admin.create({
      name: "Errorfix Admin",
      email,
      password: hashedPassword,
    });
    console.log("Admin created successfully.");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error);
    process.exit(1);
  }
};
createAdmin();
