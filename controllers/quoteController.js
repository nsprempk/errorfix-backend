import mongoose from "mongoose";
import Quote from "../models/Quote.js";
import { sendQuoteEmails } from "../services/emailService.js";

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "In Progress",
  "Completed",
  "Rejected",
];

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

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

    /*
     * The enquiry is already safely stored.
     * Email failure should never remove the enquiry.
     */
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

    /*
     * Automatically record when the enquiry is contacted.
     *
     * If an admin changes the status to Contacted or beyond,
     * we record the current time.
     */
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

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid quote status.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update quote status.",
    });
  }
};

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

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry information.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update enquiry.",
    });
  }
};

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
