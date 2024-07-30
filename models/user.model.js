import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true, // Added trimming for extra spaces
      minlength: 3, // Minimum length validation
      maxlength: 50, // Maximum length validation
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Added trimming for extra spaces
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ], // Regex for email validation
    },
    password: {
      type: String,
      required: true,
      minlength: 8, // Minimum length validation
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, strict: true }
);

const User = mongoose.model("User", userSchema);

export default User;
