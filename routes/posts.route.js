import express from "express";
import { verifyUser } from "../middlewares/verifyUser.js";
import {
  create,
  getPosts,
  deletePost,
  editPost,
  getPostsLength,
  getPostCategories,
} from "../controllers/posts.controller.js";
import { upload } from "../config/multer.config.js";
const router = express.Router();

router.get("/getposts", getPosts);
router.get("/get-categories", getPostCategories);
router.post("/create", verifyUser, upload.single("file"), create);
router.get("/getposts-length", verifyUser, getPostsLength);
router.delete("/deletepost/:postId/:userId", verifyUser, deletePost);
router.put("/editpost/:postId/:userId", verifyUser, editPost);

export default router;
