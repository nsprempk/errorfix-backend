import mongoose from "mongoose";

import Quote from "../models/Quote.js";
import Product from "../models/Product.js";

import {
  sendQuoteEmails,
  sendQuotationEmail,
} from "../services/emailService.js";

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "In Progress",
  "Completed",
  "Rejected",
];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
|--------------------------------------------------------------------------
| CREATE PUBLIC QUOTE
|--------------------------------------------------------------------------
*/

export const createQuote = async (req, res) => {
  try {
    const {
      solution,
      companyName,
      industry,
      projectDescription,
      existingWebsite,
      features,
      platforms,
      name,
      email,
      phone,
      country,
      contactMethod,
    } = req.body;

    if (
      !solution ||
      !companyName ||
      !industry ||
      !projectDescription ||
      !name ||
      !email ||
      !phone ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    const quote = await Quote.create({
      solution,
      companyName,
      industry,
      projectDescription,
      existingWebsite: existingWebsite || "",
      features: Array.isArray(features) ? features : [],
      platforms: Array.isArray(platforms) ? platforms : [],
      name,
      email,
      phone,
      country,
      contactMethod: contactMethod || "Email",
    });

    try {
      await sendQuoteEmails(quote);

      console.log("Quote emails sent successfully.");
    } catch (emailError) {
      console.error("Quote email failed:", emailError?.message || emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Quote request submitted successfully.",
      quoteId: quote._id,
    });
  } catch (error) {
    console.error("Create quote error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please check the submitted quote information.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit quote request.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL QUOTES
|--------------------------------------------------------------------------
*/

export const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      quotes,
    });
  } catch (error) {
    console.error("Get quotes error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch quotes.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET QUOTE BY ID
|--------------------------------------------------------------------------
*/

export const getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID.",
      });
    }

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    return res.json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error("Get quote error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch quote.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE QUOTE STATUS
|--------------------------------------------------------------------------
*/

export const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID.",
      });
    }

    if (!STATUS_OPTIONS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status.",
      });
    }

    const updateData = {
      status,
    };

    if (["Contacted", "In Progress", "Completed"].includes(status)) {
      updateData.lastContactedAt = new Date();
    }

    const quote = await Quote.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    return res.json({
      success: true,
      message: "Quote status updated.",
      quote,
    });
  } catch (error) {
    console.error("Update quote status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update quote status.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE QUOTE
|--------------------------------------------------------------------------
*/

export const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, status, lastContactedAt } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID.",
      });
    }

    const updateData = {};

    if (notes !== undefined) {
      if (typeof notes !== "string") {
        return res.status(400).json({
          success: false,
          message: "Notes must be text.",
        });
      }

      updateData.notes = notes.trim();
    }

    if (status !== undefined) {
      if (!STATUS_OPTIONS.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid enquiry status.",
        });
      }

      updateData.status = status;
    }

    if (lastContactedAt !== undefined) {
      if (lastContactedAt === null || lastContactedAt === "") {
        updateData.lastContactedAt = null;
      } else {
        const parsedDate = new Date(lastContactedAt);

        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid last contacted date.",
          });
        }

        updateData.lastContactedAt = parsedDate;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were provided.",
      });
    }

    const quote = await Quote.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    return res.json({
      success: true,
      message: "Enquiry updated successfully.",
      quote,
    });
  } catch (error) {
    console.error("Update quote error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update enquiry.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE QUOTE
|--------------------------------------------------------------------------
*/

export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID.",
      });
    }

    const quote = await Quote.findByIdAndDelete(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    return res.json({
      success: true,
      message: "Quote deleted successfully.",
    });
  } catch (error) {
    console.error("Delete quote error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete quote.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE / SAVE QUOTATION
|--------------------------------------------------------------------------
*/

export const createQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID.",
      });
    }

    const {
      products,
      discount = 0,
      tax = 0,
      additionalCharges = 0,
      currency = "USD",
      message = "",
      validUntil = null,
    } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one product.",
      });
    }

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    /*
     * We retrieve the actual products from MongoDB.
     *
     * This prevents the frontend from changing the product's
     * stored name/details/price when creating a quotation.
     */

    const quotationProducts = [];

    for (const item of products) {
      if (!item?.productId || !isValidId(item.productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product selected.",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (!product.active) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is inactive.`,
        });
      }

      const quantity = Number(item.quantity || 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for "${product.name}".`,
        });
      }

      const price = Number(product.price);
      const total = Number((price * quantity).toFixed(2));

      quotationProducts.push({
        productId: product._id,
        name: product.name,
        description: product.description || "",
        category: product.category || "",
        quantity,
        price,
        currency: product.currency || currency || "USD",
        deliveryTime: product.deliveryTime || "",
        features: Array.isArray(product.features) ? product.features : [],
        total,
      });
    }

    const subtotal = Number(
      quotationProducts
        .reduce((sum, product) => sum + product.total, 0)
        .toFixed(2),
    );

    const numericDiscount = Number(discount) || 0;
    const numericTax = Number(tax) || 0;
    const numericAdditionalCharges = Number(additionalCharges) || 0;

    if (numericDiscount < 0 || numericTax < 0 || numericAdditionalCharges < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount, tax and additional charges cannot be negative.",
      });
    }

    const total = Number(
      Math.max(
        0,
        subtotal - numericDiscount + numericTax + numericAdditionalCharges,
      ).toFixed(2),
    );

    let parsedValidUntil = null;

    if (validUntil) {
      parsedValidUntil = new Date(validUntil);

      if (Number.isNaN(parsedValidUntil.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid quotation validity date.",
        });
      }
    }

    quote.quotation = {
      products: quotationProducts,
      subtotal,
      discount: numericDiscount,
      tax: numericTax,
      additionalCharges: numericAdditionalCharges,
      total,
      currency: String(currency || "USD").toUpperCase(),
      message: String(message || "").trim(),
      validUntil: parsedValidUntil,
      sentAt: null,
    };

    await quote.save();

    return res.json({
      success: true,
      message: "Quotation saved successfully.",
      quotation: quote.quotation,
      quote,
    });
  } catch (error) {
    console.error("Create quotation error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid quotation information.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create quotation.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET QUOTATION
|--------------------------------------------------------------------------
*/

export const getQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID.",
      });
    }

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    return res.json({
      success: true,
      quotation: quote.quotation || {
        products: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        additionalCharges: 0,
        total: 0,
        currency: "USD",
        message: "",
        validUntil: null,
        sentAt: null,
      },
    });
  } catch (error) {
    console.error("Get quotation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch quotation.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE QUOTATION
|--------------------------------------------------------------------------
*/

export const updateQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID.",
      });
    }

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    /*
     * Reuse the quotation creation logic by rebuilding the quotation
     * from the supplied product IDs.
     */

    const {
      products,
      discount = 0,
      tax = 0,
      additionalCharges = 0,
      currency = quote.quotation?.currency || "USD",
      message = "",
      validUntil = null,
    } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one product.",
      });
    }

    const quotationProducts = [];

    for (const item of products) {
      if (!item?.productId || !isValidId(item.productId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product selected.",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Selected product was not found.",
        });
      }

      if (!product.active) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is inactive.`,
        });
      }

      const quantity = Number(item.quantity || 1);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for "${product.name}".`,
        });
      }

      const price = Number(product.price);
      const productTotal = Number((price * quantity).toFixed(2));

      quotationProducts.push({
        productId: product._id,
        name: product.name,
        description: product.description || "",
        category: product.category || "",
        quantity,
        price,
        currency: product.currency || currency,
        deliveryTime: product.deliveryTime || "",
        features: Array.isArray(product.features) ? product.features : [],
        total: productTotal,
      });
    }

    const subtotal = Number(
      quotationProducts
        .reduce((sum, product) => sum + product.total, 0)
        .toFixed(2),
    );

    const numericDiscount = Number(discount) || 0;
    const numericTax = Number(tax) || 0;
    const numericAdditionalCharges = Number(additionalCharges) || 0;

    if (numericDiscount < 0 || numericTax < 0 || numericAdditionalCharges < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount, tax and additional charges cannot be negative.",
      });
    }

    const total = Number(
      Math.max(
        0,
        subtotal - numericDiscount + numericTax + numericAdditionalCharges,
      ).toFixed(2),
    );

    let parsedValidUntil = null;

    if (validUntil) {
      parsedValidUntil = new Date(validUntil);

      if (Number.isNaN(parsedValidUntil.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid quotation validity date.",
        });
      }
    }

    quote.quotation = {
      products: quotationProducts,
      subtotal,
      discount: numericDiscount,
      tax: numericTax,
      additionalCharges: numericAdditionalCharges,
      total,
      currency: String(currency || "USD").toUpperCase(),
      message: String(message || "").trim(),
      validUntil: parsedValidUntil,
      sentAt: quote.quotation?.sentAt || null,
    };

    await quote.save();

    return res.json({
      success: true,
      message: "Quotation updated successfully.",
      quotation: quote.quotation,
      quote,
    });
  } catch (error) {
    console.error("Update quotation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update quotation.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SEND QUOTATION
|--------------------------------------------------------------------------
*/

export const sendQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quote ID.",
      });
    }

    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: "Quote not found.",
      });
    }

    if (
      !quote.quotation ||
      !Array.isArray(quote.quotation.products) ||
      quote.quotation.products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please create a quotation before sending it.",
      });
    }

    await sendQuotationEmail(quote);

    quote.quotation.sentAt = new Date();

    if (quote.status === "New") {
      quote.status = "Contacted";
      quote.lastContactedAt = new Date();
    }

    await quote.save();

    return res.json({
      success: true,
      message: "Quotation sent successfully.",
      quote,
    });
  } catch (error) {
    console.error("Send quotation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send quotation.",
    });
  }
};
