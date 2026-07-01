// middleware/adminMiddleware.js
// WHY: The admin check is already defined inside authMiddleware.js (named export).
// This file is kept for clarity and can be used as a standalone import.
// Usage: import { admin } from "../middleware/adminMiddleware.js"

export { admin } from "./authMiddleware.js";
