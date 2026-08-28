import { uploadToCloudinary } from "../config/cloudinary.config.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

const generateUniqueSlug = async (title, postId = null) => {
  const baseSlug = title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "-");
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingPost = await Post.findOne({
      slug,
      ...(postId && { _id: { $ne: postId } }),
    });
    if (!existingPost) break;
    slug = `${baseSlug}-${Date.now()}-${counter}`;
    counter++;
  }

  return slug;
};

const create = async (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!req.body.title || !req.body.content) {
    return res
      .status(400)
      .json({ message: "Please fill all the required fields" });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const slug = await generateUniqueSlug(req.body.title);

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
      featured: req.body.featured || false,
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

    const userIds = [...new Set(posts.map((post) => post.userId))];
    const users = await User.find(
      { _id: { $in: userIds } },
      "username profilePicture bio"
    );
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const postsWithAuthor = posts.map((post) => {
      const author = userMap.get(post.userId);
      return {
        ...post.toObject(),
        author: author
          ? {
              username: author.username,
              profilePicture: author.profilePicture,
              bio: author.bio,
            }
          : null,
      };
    });

    res.status(200).json({
      posts: postsWithAuthor,
    });
  } catch (error) {
    next(error);
  }
};

const getPostsLength = async (req, res, next) => {
  if (!req.isAdmin) {
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

    const existingPost = await Post.findById(req.params.postId);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    let image = existingPost.image;
    let imagePublicUrl = existingPost.imagePublicUrl;

    if (req.file) {
      const uploadedFile = await uploadToCloudinary(req.file.path);
      if (uploadedFile) {
        image = uploadedFile.secure_url;
        imagePublicUrl = uploadedFile.public_id;
        if (existingPost.imagePublicUrl) {
          await cloudinary.uploader.destroy(existingPost.imagePublicUrl);
        }
      }
    }

    let updateData = {
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      image: image,
      imagePublicUrl: imagePublicUrl,
    };

    if (req.body.featured !== undefined) {
      updateData.featured = req.body.featured;
    }

    if (req.body.title) {
      updateData.slug = await generateUniqueSlug(req.body.title, req.params.postId);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: updateData,
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
const toggleFeatured = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.featured = !post.featured;
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const posts = await Post.find({ featured: true })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const userIds = [...new Set(posts.map((post) => post.userId))];
    const users = await User.find(
      { _id: { $in: userIds } },
      "username profilePicture bio"
    );
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const postsWithAuthor = posts.map((post) => {
      const author = userMap.get(post.userId);
      return {
        ...post.toObject(),
        author: author
          ? {
              username: author.username,
              profilePicture: author.profilePicture,
              bio: author.bio,
            }
          : null,
      };
    });

    res.status(200).json({ posts: postsWithAuthor });
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
  toggleFeatured,
  getFeatured,
};
