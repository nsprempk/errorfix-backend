import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const testAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@errorfixsolution.com";
    const password = "Admin@123#@@";

    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      console.log("❌ ADMIN NOT FOUND");
      console.log("Email searched:", email);
      process.exit(1);
    }

    console.log("✅ ADMIN FOUND");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Password hash exists:", Boolean(admin.password));
    console.log("Hash starts with:", admin.password.substring(0, 7));

    const matches = await bcrypt.compare(password, admin.password);

    console.log("Password matches:", matches);

    process.exit(0);
  } catch (error) {
    console.error("TEST ERROR:", error);
    process.exit(1);
  }
};

testAdmin();
