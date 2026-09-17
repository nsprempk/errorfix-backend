import express from "express";

import {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
} from "../controllers/quoteController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
|
| Website visitors can submit a quote request.
|
*/

router.post("/", createQuote);

/*
|--------------------------------------------------------------------------
| Protected Admin Routes
|--------------------------------------------------------------------------
|
| These routes require a valid admin JWT.
|
*/

router.get("/", authMiddleware, getQuotes);

router.get("/:id", authMiddleware, getQuoteById);

router.patch("/:id/status", authMiddleware, updateQuoteStatus);

router.patch("/:id", authMiddleware, updateQuote);

router.delete("/:id", authMiddleware, deleteQuote);

export default router;
