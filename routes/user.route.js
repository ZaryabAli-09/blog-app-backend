import express from "express";
import {
  updateUser,
  deleteUser,
  signOut,
  getUsers,
  getUsersLength,
} from "../controllers/user.controller.js";
import { verifyUser } from "../middlewares/verifyUser.js";

const router = express.Router();

router.get("/getusers", verifyUser, getUsers);
router.get("/getusers-length", verifyUser, getUsersLength);
router.post("/signout", signOut);
router.delete("/delete/:userId", deleteUser);
router.put("/update/:userId", verifyUser, updateUser);
export default router;
