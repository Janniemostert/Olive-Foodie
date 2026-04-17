import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import IngredientForm from '../IngredientForm';
import classes from '../ingredient.module.css';

export default async function NewIngredientPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') redirect('/');

    return (
        <main className={classes.main}>
            <h1>Add Ingredient</h1>
            <IngredientForm />
        </main>
    );
}
