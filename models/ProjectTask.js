import mongoose from 'mongoose';

const projectTaskSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // <-- This is essential
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  stage: { type: String, required: true },
  status: { type: String, required: true },
  description: { type: String },
  startDate: { type: String },
  dueDate: { type: String },
  assigneeId: { type: String },
});

const ProjectTask = mongoose.models.ProjectTask || mongoose.model('ProjectTask', projectTaskSchema);
export default ProjectTask;
