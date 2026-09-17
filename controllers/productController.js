import mongoose from "mongoose";
import Product from "../models/Product.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
|--------------------------------------------------------------------------
| GET ALL PRODUCTS
|--------------------------------------------------------------------------
*/

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ACTIVE PRODUCTS
|--------------------------------------------------------------------------
*/

export const getActiveProducts = async (req, res) => {
  try {
    const products = await Product.find({
      active: true,
    }).sort({
      category: 1,
      name: 1,
    });

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get active products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch active products.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PRODUCT BY ID
|--------------------------------------------------------------------------
*/

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PRODUCT
|--------------------------------------------------------------------------
*/

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      currency,
      features,
      deliveryTime,
      notes,
      active,
    } = req.body;

    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Product name, category and price are required.",
      });
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      description: description || "",
      price: parsedPrice,
      currency: currency || "USD",
      features: Array.isArray(features) ? features : [],
      deliveryTime: deliveryTime || "",
      notes: notes || "",
      active: active !== undefined ? Boolean(active) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Please check the product information.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PRODUCT
|--------------------------------------------------------------------------
*/

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const {
      name,
      category,
      description,
      price,
      currency,
      features,
      deliveryTime,
      notes,
      active,
    } = req.body;

    const updateData = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty.",
        });
      }

      updateData.name = String(name).trim();
    }

    if (category !== undefined) {
      if (!String(category).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product category cannot be empty.",
        });
      }

      updateData.category = String(category).trim();
    }

    if (description !== undefined) {
      updateData.description = String(description).trim();
    }

    if (price !== undefined) {
      const parsedPrice = Number(price);

      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid non-negative number.",
        });
      }

      updateData.price = parsedPrice;
    }

    if (currency !== undefined) {
      updateData.currency = String(currency).trim().toUpperCase();
    }

    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          message: "Features must be an array.",
        });
      }

      updateData.features = features;
    }

    if (deliveryTime !== undefined) {
      updateData.deliveryTime = String(deliveryTime).trim();
    }

    if (notes !== undefined) {
      updateData.notes = String(notes).trim();
    }

    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes were provided.",
      });
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product information.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PRODUCT
|--------------------------------------------------------------------------
*/

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
};
