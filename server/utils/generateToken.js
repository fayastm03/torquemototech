// utils/generateToken.js
// WHY: JWT (JSON Web Token) is how we identify logged-in users.
// After login, we sign a token with the user's ID.
// Every protected API request must send this token back to prove identity.

import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // Payload — what we store inside the token
    process.env.JWT_SECRET,   // Secret key — only the server knows this
    { expiresIn: process.env.JWT_EXPIRE || "30d" } // Token expiry
  );
};

export default generateToken;
