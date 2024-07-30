import jwt from "jsonwebtoken";

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json("Unauthorized");
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json("Invalid token");
    } else {
      req.id = decoded.id;
      req.isAdmin = decoded.isAdmin;
      next();
    }
  });
};
export { verifyUser };
