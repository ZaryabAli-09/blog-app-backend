import Category from "../models/category.model.js";

// create category controller
const createCategory = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({ name: name.trim() });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    next(error);
  }
};

// get categories controller

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({ categories: categories.map((cat) => cat.name) });
  } catch (error) {
    next(error);
  }
};

// delete category controller

const deleteCategory = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { categoryId } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { createCategory, getCategories, deleteCategory };