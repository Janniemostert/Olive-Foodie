import { connectDB } from '@/lib/db';
import Ingredient from '@/lib/models/Ingredient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound, redirect } from 'next/navigation';
import IngredientForm from '../../IngredientForm';
import classes from '../../ingredient.module.css';

export default async function EditIngredientPage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') redirect('/');

    await connectDB();
    const ing = await Ingredient.findById(params.id).lean();
    if (!ing) notFound();

    const plain = {
        _id:           ing._id.toString(),
        name:          ing.name,
        unit:          ing.unit,
        defaultAmount: ing.defaultAmount ?? null,
    };

    return (
        <main className={classes.main}>
            <h1>Edit Ingredient</h1>
            <IngredientForm ingredient={plain} />
        </main>
    );
}
