import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
  },
});

const Stage = mongoose.models.Stage || mongoose.model('Stage', stageSchema);
export default Stage;
