const role = (roles = []) => {
  return (req, res, next) => {
    // Check if the user's role (attached by auth middleware) is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export default role;