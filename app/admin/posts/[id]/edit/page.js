import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import Ingredient from '@/lib/models/Ingredient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import EditPostForm from '../EditPostForm';
import classes from '../../new/new-post.module.css';

export default async function EditPostPage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') redirect('/');

    await connectDB();
    const [post, ingredients] = await Promise.all([
        Post.findById(params.id).populate('ingredients.ingredient').lean(),
        Ingredient.find({}).sort({ name: 1 }).lean(),
    ]);

    if (!post) notFound();

    // Serialize for client component
    const plainPost = {
        _id:             post._id.toString(),
        title:           post.title,
        body:            post.body,
        image:           post.image,
        videoLink:       post.videoLink,
        isFoodPost:      post.isFoodPost,
        isSubscriberOnly: post.isSubscriberOnly,
        status:          post.status,
        ingredientsText: post.ingredientsText || '',
        ingredients:     post.ingredients.map((item) => ({
            ingredient: { _id: item.ingredient?._id?.toString(), name: item.ingredient?.name },
            qty: item.qty,
            prepMethods: item.prepMethods || [],
        })),
    };

    const plainIngredients = ingredients.map((i) => ({
        _id: i._id.toString(),
        name: i.name,
        unit: i.unit,
    }));

    return (
        <main className={classes.main}>
            <h1>Edit Post</h1>
            <EditPostForm post={plainPost} ingredients={plainIngredients} />
        </main>
    );
}
