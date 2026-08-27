import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
// the function is asynchronous because we save data to database(mongodb atlas)
const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || username === "" || email === "") {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password must be 8 characters" });
  }
  try {
    //   password encrytion using bcryptjs
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });

    // save is builtin function to save data to database and is asynchronous
    await newUser.save();

    res.status(200).json({ message: "Signup successful" });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password || email === "" || password === "") {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      // 404 status code is for user not found in db
      return res.status(404).json({ message: "User not found" });
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      // 400 status code is for bad request
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // JWT consists of three parts: a header, payload, and signature. The header typically consists of two parts: the type of the token, which is JWT, and the algorithm that is used, such as HMAC SHA256 or RSA SHA256. It is Base64Url encoded to form the first part of the JWT.
    const token = jwt.sign(
      {
        id: validUser._id,
        isAdmin: validUser.isAdmin,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "10d",
      }
    );
    // removing the password
    validUser.password = undefined;
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    });
    res.status(200).json(validUser);
  } catch (error) {
    next(error);
  }
};

export { signUp, signIn };
