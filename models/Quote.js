import mongoose from "mongoose";

const quotationProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
      trim: true,
      uppercase: true,
    },

    deliveryTime: {
      type: String,
      default: "",
      trim: true,
    },

    features: {
      type: [String],
      default: [],
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

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

    /*
    |--------------------------------------------------------------------------
    | Quotation
    |--------------------------------------------------------------------------
    */

    quotation: {
      products: {
        type: [quotationProductSchema],
        default: [],
      },

      subtotal: {
        type: Number,
        default: 0,
        min: 0,
      },

      discount: {
        type: Number,
        default: 0,
        min: 0,
      },

      tax: {
        type: Number,
        default: 0,
        min: 0,
      },

      additionalCharges: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        default: 0,
        min: 0,
      },

      currency: {
        type: String,
        default: "USD",
        trim: true,
        uppercase: true,
      },

      message: {
        type: String,
        default: "",
        trim: true,
      },

      validUntil: {
        type: Date,
        default: null,
      },

      sentAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Quote", quoteSchema);
