// models/User.js
// WHY: Defines the structure of every user in our database.
// Mongoose Schema = the blueprint, Mongoose Model = the tool to query the DB.
//
// Key decisions:
//  - Password is hashed using bcryptjs BEFORE saving (pre-save hook)
//  - We never return the password in API responses (select: false)
//  - role field controls whether someone is a regular user or admin

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,                    // Removes accidental spaces
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,                  // No two users can share an email
      lowercase: true,               // Always stored in lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,  // IMPORTANT: password is NEVER returned in queries by default
    },

    role: {
      type: String,
      enum: ["user", "admin"],  // Only these two values are allowed
      default: "user",          // New signups are always regular users
    },

    // Optional profile picture URL
    avatar: {
      type: String,
      default: "",
    },

    // Wishlist — array of Product IDs the user saved
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",  // Reference to Product model (for .populate())
      },
    ],

    // For password reset functionality (future use)
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// ─── Pre-Save Hook: Hash Password ────────────────────────────────────────────
// WHY: Before saving to DB, if the password field was changed, hash it.
// bcrypt adds a "salt" and hashes — even if two users have the same password,
// their hashed versions will be DIFFERENT (that's the salt's job).
userSchema.pre("save", async function (next) {
  // Only hash if password was actually changed (skip on profile updates)
  if (!this.isModified("password")) {
    return next();
  }

  // saltRounds = 12 means bcrypt runs 2^12 = 4096 hashing iterations
  // Higher = more secure but slower. 10-12 is the industry standard.
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
// WHY: During login, we compare the plain text password with the stored hash.
// bcrypt.compare() handles this — returns true if they match.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
