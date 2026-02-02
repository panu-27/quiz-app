import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attaches { id, role, instituteId } to the request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;