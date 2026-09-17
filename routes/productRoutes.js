import express from "express";

import {
  getProducts,
  getActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC
|--------------------------------------------------------------------------
| Active products can be used by the public website if needed.
|--------------------------------------------------------------------------
*/

router.get("/active", getActiveProducts);

/*
|--------------------------------------------------------------------------
| PROTECTED ADMIN
|--------------------------------------------------------------------------
*/

router.get("/", authMiddleware, getProducts);

router.get("/:id", authMiddleware, getProductById);

router.post("/", authMiddleware, createProduct);

router.patch("/:id", authMiddleware, updateProduct);

router.delete("/:id", authMiddleware, deleteProduct);

export default router;
