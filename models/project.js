import mongoose from 'mongoose';

const TaskSubSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // <-- Important: string _id
    title: { type: String, required: true },
    stage: { type: String, required: true },
    status: { type: String, required: true },
    details: { type: String },
    startDate: { type: String, required: true },
    dueDate: { type: String, required: true },
  },
  { _id: false } // Disable Mongoose auto ObjectId for embedded subdocuments
);

const projectSchema = new mongoose.Schema({
  project: { type: String, required: true },
  assignees: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
  ],
  template: { type: String, required: true },
  tasks: {
    type: [TaskSubSchema],
    default: [],
  },

  assignedBy: { type: String, required: true }
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;
