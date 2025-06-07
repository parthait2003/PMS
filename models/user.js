import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true }, // optional if using email only
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // stored as MD5 hash
  usertype: { type: String, enum: ["user", "client", "guest", "staff", "admin"], required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
