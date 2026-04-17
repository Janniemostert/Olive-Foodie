'use server';
import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import Meal from '@/lib/models/Meal';
import Ingredient from '@/lib/models/Ingredient';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';
import xss from 'xss';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key:    process.env.CLOUDAPIKEY,
    api_secret: process.env.CLOUDINARYSECRET,
});

function extractCloudinaryPublicId(url) {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    let path = url.substring(uploadIndex + 8);
    path = path.replace(/^v\d+\//, '');   // strip version
    path = path.replace(/\.[^/.]+$/, ''); // strip extension
    return path;
}

export async function createPost(prevState, formData) {
    const title            = formData.get('title')?.trim();
    const body             = formData.get('body')?.trim();
    const videoLink        = formData.get('videoLink')?.trim() || null;
    const isFoodPost       = formData.get('isFoodPost') === 'on';
    const isSubscriberOnly = formData.get('isSubscriberOnly') === 'on';
    const status           = formData.get('status') === 'draft' ? 'draft' : 'published';
    const image            = formData.get('image');

    if (!title || !body) {
        return { message: 'Title and body are required.' };
    }

    const slug = slugify(title, { lower: true, strict: true });
    const safeBody = xss(body);

    let imageUrl = null;
    if (image && image.size > 0) {
        const bufferedImage = await image.arrayBuffer();
        const buffer = Buffer.from(bufferedImage);
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'foodies/posts', public_id: slug },
                (error, result) => {
                    if (error) reject(new Error('Image upload failed'));
                    else resolve(result);
                }
            ).end(buffer);
        });
        imageUrl = uploadResult.secure_url;
    }

    // Ingredients: pairs of ingredientId + qty + prepMethods
    const ingredientMode  = formData.get('ingredientMode') || 'library';
    const ingredientsText = formData.get('ingredientsText')?.trim() || '';
    const ingredientIds   = formData.getAll('ingredientId');
    const qtys            = formData.getAll('qty');
    const prepMethodsList = formData.getAll('prepMethodsJson').map((j) => {
        try { return JSON.parse(j); } catch { return []; }
    });
    const ingredients = ingredientIds
        .map((id, i) => ({
            ingredient:  id,
            qty:         qtys[i],
            prepMethods: prepMethodsList[i] || [],
        }))
        .filter((item) => item.ingredient && item.qty);

    await connectDB();

    try {
        await Post.create({
            title,
            body: safeBody,
            image: imageUrl,
            images: imageUrl ? [imageUrl] : [],
            videoLink: videoLink || null,
            isFoodPost,
            isSubscriberOnly,
            status,
            ingredientsText: isFoodPost && ingredientMode === 'text' ? ingredientsText : '',
            ingredients: (isFoodPost && ingredientMode === 'library') ? ingredients : [],
            slug,
        });
    } catch (err) {
        if (err.code === 11000) {
            return { message: `A post with the title "${title}" already exists. Please use a different title.` };
        }
        return { message: 'Something went wrong saving the post. Please try again.' };
    }

    revalidatePath('/posts');
    revalidatePath('/meals');
    redirect('/admin/posts');
}

export async function updatePost(prevState, formData) {
    const id               = formData.get('id');
    const title            = formData.get('title')?.trim();
    const body             = formData.get('body')?.trim();
    const videoLink        = formData.get('videoLink')?.trim() || null;
    const isFoodPost       = formData.get('isFoodPost') === 'on';
    const isSubscriberOnly = formData.get('isSubscriberOnly') === 'on';
    const status           = formData.get('status') === 'draft' ? 'draft' : 'published';
    const image            = formData.get('image');

    if (!title || !body) {
        return { message: 'Title and body are required.' };
    }

    const safeBody = xss(body);
    const updates = { title, body: safeBody, videoLink, isFoodPost, isSubscriberOnly, status, updatedAt: new Date() };

    if (image && image.size > 0) {
        const bufferedImage = await image.arrayBuffer();
        const buffer = Buffer.from(bufferedImage);
        const slug = slugify(title, { lower: true, strict: true });
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'foodies/posts', public_id: `${slug}-${Date.now()}` },
                (error, result) => {
                    if (error) reject(new Error('Image upload failed'));
                    else resolve(result);
                }
            ).end(buffer);
        });
        updates.image = uploadResult.secure_url;
    }

    const ingredientMode  = formData.get('ingredientMode') || 'library';
    const ingredientsText = formData.get('ingredientsText')?.trim() || '';
    const ingredientIds   = formData.getAll('ingredientId');
    const qtys            = formData.getAll('qty');
    const prepMethodsList = formData.getAll('prepMethodsJson').map((j) => {
        try { return JSON.parse(j); } catch { return []; }
    });
    if (isFoodPost && ingredientMode === 'library') {
        updates.ingredients = ingredientIds
            .map((ingId, i) => ({
                ingredient:  ingId,
                qty:         qtys[i],
                prepMethods: prepMethodsList[i] || [],
            }))
            .filter((item) => item.ingredient && item.qty);
        updates.ingredientsText = '';
    } else if (isFoodPost && ingredientMode === 'text') {
        updates.ingredients = [];
        updates.ingredientsText = ingredientsText;
    } else {
        updates.ingredients = [];
        updates.ingredientsText = '';
    }
    await connectDB();

    try {
        await Post.findByIdAndUpdate(id, updates);
    } catch (err) {
        if (err.code === 11000) {
            return { message: `A post with a similar title already exists. Please use a different title.` };
        }
        return { message: 'Something went wrong saving the post. Please try again.' };
    }

    revalidatePath('/posts');
    revalidatePath('/posts/[slug]', 'page');
    revalidatePath('/meals');
    revalidatePath('/admin/posts');
    redirect('/admin/posts');
}

export async function togglePostStatus(formData) {
    const id = formData.get('id');
    const current = formData.get('current');
    const next = current === 'published' ? 'draft' : 'published';
    await connectDB();
    await Post.findByIdAndUpdate(id, { status: next });
    revalidatePath('/posts');
    revalidatePath('/posts/[slug]', 'page');
    revalidatePath('/meals');
    revalidatePath('/admin/posts');
}

export async function deletePost(formData) {
    const id = formData.get('id');
    await connectDB();
    const post = await Post.findById(id);
    if (post) {
        if (post.image) {
            const publicId = extractCloudinaryPublicId(post.image);
            if (publicId) {
                try { await cloudinary.uploader.destroy(publicId); } catch (_) {}
            }
        }
        await post.deleteOne();
    }
    revalidatePath('/posts');
    revalidatePath('/posts/[slug]', 'page');
    revalidatePath('/meals');
    revalidatePath('/admin/posts');
    redirect('/admin/posts');
}

export async function migrateMealsToPost() {
    await connectDB();
    const meals = await Meal.find({}).lean();
    let migrated = 0;

    for (const meal of meals) {
        const existing = await Post.findOne({ slug: meal.slug });
        if (existing) continue;
        await Post.create({
            title:           meal.title,
            body:            `${meal.summary}\n\n${meal.instructions}`,
            image:           meal.image || null,
            isFoodPost:      true,
            isSubscriberOnly: true,
            status:          'published',
            slug:            meal.slug,
            createdAt:       new Date(),
        });
        migrated++;
    }

    await Meal.deleteMany({});
    revalidatePath('/admin/posts');
    redirect('/admin/posts');
}

export async function saveIngredient(prevState, formData) {
    const name = formData.get('name')?.trim();
    const unit = formData.get('unit')?.trim() || '';
    if (!name) return { message: 'Name is required.', success: false };
    await connectDB();
    await Ingredient.findOneAndUpdate({ name }, { name, unit }, { upsert: true });
    revalidatePath('/admin/posts/new');
    return { message: `"${name}" saved to library.`, success: true };
}
