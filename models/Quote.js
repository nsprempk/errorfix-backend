import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    solution: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    industry: {
      type: String,
      required: true,
      trim: true,
    },

    projectDescription: {
      type: String,
      required: true,
      trim: true,
    },

    existingWebsite: {
      type: String,
      default: "",
      trim: true,
    },

    features: {
      type: [String],
      default: [],
    },

    platforms: {
      type: [String],
      default: [],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    contactMethod: {
      type: String,
      default: "Email",
      trim: true,
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "In Progress", "Completed", "Rejected"],
      default: "New",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },

    lastContactedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Quote", quoteSchema);
