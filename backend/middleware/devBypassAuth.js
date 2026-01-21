export const devBypassAuth = (req, res, next) => {
  req.user = {
    userId: "dev-user",
    role: "ADMIN",
  };
  next();
};
