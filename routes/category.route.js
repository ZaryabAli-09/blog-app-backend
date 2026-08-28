import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.post("/create", verifyUser, createCategory);
router.get("/get-categories", getCategories);
router.delete("/delete/:categoryId", verifyUser, deleteCategory);

export default router;