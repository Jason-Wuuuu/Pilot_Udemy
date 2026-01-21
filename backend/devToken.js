// devToken.js
import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    userId: "82f852d2-e34c-4dc5-9bdc-656edbd82fa6",
    role: "ADMIN",
  },
  "super_secret_jwt_key_here",
  { expiresIn: "1d" }
);

console.log(token);
