import { uploadToCloudinary } from "../config/cloudinary.config.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";

const create = async (req, res, next) => {
  if (!req.isAdmin) {
    console.log(req.isAdmin);
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!req.body.title || !req.body.content) {
    return res
      .status(400)
      .json({ message: "Please fill all the required fields" });
  }
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-z0-9-]/g, "-");

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Upload file to Cloudinary
  const localFilePath = req.file.path;

  try {
    const uploadedFile = await uploadToCloudinary(localFilePath);

    if (!uploadedFile) {
      return res
        .status(400)
        .json({ message: "Error occur while uploading image" });
    }
    const newPost = new Post({
      userId: req.id,
      content: req.body.content,
      title: req.body.title,
      image: uploadedFile?.secure_url,
      imagePublicUrl: uploadedFile.public_id,
      category: req.body.category,
      slug: slug,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

const getPostCategories = async (req, res) => {
  try {
    // Retrieve all unique categories from posts
    const categories = await Post.aggregate([
      { $group: { _id: "$category" } }, // Group by category
      { $project: { _id: 0, category: "$_id" } }, // Project to only include category field
    ]);

    res.status(200).json({ categories: categories.map((cat) => cat.category) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

const getPosts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      posts,
    });
  } catch (error) {
    next(error);
  }
};

const getPostsLength = async (req, res, next) => {
  if (!req.isAdmin) {
    console.log(req.isAdmin);
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const totalPosts = await Post.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    if (!req.isAdmin || req.id !== req.params.userId) {
      return res
        .status(401)
        .json({ message: "you are not allowed to delete this post" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const deletePostImage = await cloudinary.uploader.destroy(
      post.imagePublicUrl
    );

    console.log(deletePostImage);
    await Post.deleteOne({ _id: post._id });
    res.status(200).json({ message: "The post has been deleted" });
  } catch (error) {
    next(error);
  }
};

const editPost = async (req, res, next) => {
  try {
    if (!req.isAdmin || req.id !== req.params.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          category: req.body.category,
          content: req.body.content,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
export {
  getPostsLength,
  create,
  getPosts,
  deletePost,
  editPost,
  getPostCategories,
};
