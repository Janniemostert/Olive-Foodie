import { connectDB } from '@/lib/db';
import Ingredient from '@/lib/models/Ingredient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import NewPostForm from './NewPostForm';
import classes from './new-post.module.css';

export default async function NewPostPage({ searchParams }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') redirect('/');

    const type = searchParams?.type === 'recipe' ? 'recipe' : 'article';
    const isRecipe = type === 'recipe';

    await connectDB();
    const ingredients = isRecipe
        ? (await Ingredient.find({}).sort({ name: 1 }).lean()).map((i) => ({
              _id: i._id.toString(),
              name: i.name,
              unit: i.unit,
          }))
        : [];

    return (
        <main className={classes.main}>
            <h1>{isRecipe ? 'New Recipe' : 'New Tip / Article'}</h1>
            <NewPostForm ingredients={ingredients} isRecipe={isRecipe} />
        </main>
    );
}
