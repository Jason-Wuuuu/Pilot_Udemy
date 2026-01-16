export const protect = (req, res, next) => {
  // TEMP: fake authenticated user
  req.user = {
    _id: "admin-001",
    role: "ADMIN"
  };
  next();
};
