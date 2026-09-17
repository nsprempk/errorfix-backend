import express from "express";

import {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
  createQuotation,
  getQuotation,
  updateQuotation,
  sendQuotation,
} from "../controllers/quoteController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
*/

router.post("/", createQuote);

/*
|--------------------------------------------------------------------------
| PROTECTED ADMIN
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, getQuotes);

/*
|--------------------------------------------------------------------------
| QUOTATIONS
|--------------------------------------------------------------------------
*/

router.post("/:id/quotation", authMiddleware, createQuotation);

router.get("/:id/quotation", authMiddleware, getQuotation);

router.patch("/:id/quotation", authMiddleware, updateQuotation);

router.post("/:id/quotation/send", authMiddleware, sendQuotation);

/*
|--------------------------------------------------------------------------
| INDIVIDUAL ENQUIRY
|--------------------------------------------------------------------------
*/

router.get("/:id", authMiddleware, getQuoteById);

router.patch("/:id/status", authMiddleware, updateQuoteStatus);

router.patch("/:id", authMiddleware, updateQuote);

router.delete("/:id", authMiddleware, deleteQuote);

export default router;
