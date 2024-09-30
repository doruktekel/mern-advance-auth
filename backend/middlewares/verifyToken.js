import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorize - No Token" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorize - Token is not valid" });
    }

    req.userId = decode.userId;

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default verifyToken;
