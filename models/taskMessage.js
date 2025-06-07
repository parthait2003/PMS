// models/taskMessage.ts
import mongoose from "mongoose";

const taskMessageSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "projectTask" }, // MUST be ObjectId
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  files: [{ type: String }],
});

export default mongoose.models.taskMessage || mongoose.model("taskMessage", taskMessageSchema);
