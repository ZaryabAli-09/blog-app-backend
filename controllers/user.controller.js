import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../config/cloudinary.config.js";

const updateUser = async (req, res, next) => {
  try {
    if (req.id !== req.params.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!req.body.password || req.body.password === "") {
      return res.status(400).json({ message: "Please enter password" });
    }

    const existingUser = await User.findById(req.params.userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let profilePicture = req.body.profilePicture || existingUser.profilePicture;

    if (req.file) {
      const uploadedFile = await uploadToCloudinary(req.file.path);
      if (uploadedFile) {
        profilePicture = uploadedFile.secure_url;
      }
    }

    const hashedPassword = bcryptjs.hashSync(req.body.password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username || existingUser.username,
          email: req.body.email || existingUser.email,
          profilePicture: profilePicture,
          bio: req.body.bio !== undefined ? req.body.bio : existingUser.bio,
          socialLinks: req.body.socialLinks || existingUser.socialLinks,
          password: hashedPassword,
        },
      },
      { new: true }
    );
    res
      .status(200)
      .json({ data: updatedUser, message: "Updated user successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    const name = deletedUser.username;
    res.status(200).json({ message: `user ${name} deleted successfully` });
  } catch (error) {
    next(error);
  }
};
const signOut = async (req, res, next) => {
  try {
    res
      .clearCookie("token")
      .status(200)
      .json({ message: "User has been signed out" });
  } catch (error) {
    next(error);
  }
};
const getUsers = async (req, res, next) => {
  if (!req.isAdmin) {
    return res
      .status(403)
      .json({ message: "You are not allowed to see all users" });
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    users.password = undefined;

    res.status(200).json({
      users,
    });
  } catch (error) {
    next(error);
  }
};
const getUsersLength = async (req, res, next) => {
  if (!req.isAdmin) {
    return res
      .status(403)
      .json({ message: "You are not allowed to see all users" });
  }
  try {
    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export { getUsersLength, updateUser, deleteUser, signOut, getUsers };
