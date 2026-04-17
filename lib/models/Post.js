import mongoose from 'mongoose';

const postIngredientSchema = new mongoose.Schema({
    ingredient:  { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    qty:         { type: String, required: true },
    prepMethods: { type: [String], default: [] },
}, { _id: false });

const postSchema = new mongoose.Schema({
    title:          { type: String, required: true },
    body:           { type: String, required: true },
    image:          { type: String, default: null },
    images:         { type: [String], default: [] },
    videoLink:      { type: String, default: null },
    isFoodPost:     { type: Boolean, default: false },
    isSubscriberOnly: { type: Boolean, default: false },
    status:           { type: String, enum: ['published', 'draft'], default: 'published' },
    ingredientsText:  { type: String, default: '' },
    ingredients:    { type: [postIngredientSchema], default: [] },
    slug:           { type: String, required: true, unique: true },
    createdAt:      { type: Date, default: Date.now },
    updatedAt:      { type: Date, default: Date.now },
});

postSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Post || mongoose.model('Post', postSchema);
