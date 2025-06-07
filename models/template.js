import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
 
  template: {
    type: String,
    required: true,
  }
  
  
});

const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);
export default Template;
