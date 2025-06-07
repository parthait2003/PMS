import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // store as MD5 hash
  usertype: { type: String, enum: ["admin", "staff"], required: true },
}, { timestamps: true });

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
