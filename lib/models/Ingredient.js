import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
    name:          { type: String, required: true, unique: true, trim: true },
    unit:          { type: String, default: '' },
    defaultAmount: { type: Number, default: null },
});

export default mongoose.models.Ingredient || mongoose.model('Ingredient', ingredientSchema);
