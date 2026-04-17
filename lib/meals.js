import slugify from 'slugify';
import xss from 'xss';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from './db';
import Meal from './models/Meal';

cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key:    process.env.CLOUDAPIKEY,
    api_secret: process.env.CLOUDINARYSECRET,
});

export async function getMeals() {
    await connectDB();
    return Meal.find({}).lean();
}

export async function getMeal(slug) {
    await connectDB();
    return Meal.findOne({ slug }).lean();
}

export async function saveMeal(meal) {
    meal.slug = slugify(meal.title, { lower: true });
    meal.instructions = xss(meal.instructions);

    const bufferedImage = await meal.image.arrayBuffer();
    const buffer = Buffer.from(bufferedImage);

    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'foodies', public_id: meal.slug },
            (error, result) => {
                if (error) reject(new Error('Image upload failed'));
                else resolve(result);
            }
        ).end(buffer);
    });

    meal.image = uploadResult.secure_url;

    await connectDB();
    await Meal.create({
        slug:          meal.slug,
        title:         meal.title,
        image:         meal.image,
        summary:       meal.summary,
        instructions:  meal.instructions,
        creator:       meal.creator,
        creator_email: meal.creator_email,
    });
}