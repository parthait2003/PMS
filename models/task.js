import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
 
  title: {
    type: String,
    required: true,
  },

  stage: {
    type: String,
    required: false,       
  },

  status: {
    type: String,
    required: true,    
  },
 
  details: {
    type: String,
    required: true,  
  },

  startDate: { 
    type: String, 
    required: true 
  },
  
  dueDate: { 
    type: String, 
    required: true 
  },

  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: false,
  },

  image: {
    type: String,
    required: false,
  }
  
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;
