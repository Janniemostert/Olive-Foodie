import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
    slug:          { type: String, required: true, unique: true },
    title:         { type: String, required: true },
    image:         { type: String, required: true },
    summary:       { type: String, required: true },
    instructions:  { type: String, required: true },
    creator:       { type: String, required: true },
    creator_email: { type: String, required: true },
});

export default mongoose.models.Meal || mongoose.model('Meal', mealSchema);
