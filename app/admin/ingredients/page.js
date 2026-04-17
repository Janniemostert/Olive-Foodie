import { connectDB } from '@/lib/db';
import Ingredient from '@/lib/models/Ingredient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { deleteIngredient, duplicateIngredient } from '@/lib/ingredientActions';
import adminClasses from '../admin.module.css';
import classes from './ingredient.module.css';
import DeleteIngredientButton from './DeleteIngredientButton';

const UNIT_LABELS = {
    kg:   'Kilogram (kg)',
    g:    'Gram (g)',
    litre:'Litre (L)',
    ml:   'Millilitre (ml)',
    tsp:  'Teaspoon (tsp)',
    tbsp: 'Tablespoon (tbsp)',
    cup:  'Cup',
    each: 'Each',
};

export default async function IngredientsPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') redirect('/');

    await connectDB();
    const ingredients = await Ingredient.find({}).sort({ name: 1 }).lean();

    return (
        <main className={adminClasses.main}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Ingredients Library</h1>
                <Link href="/admin/ingredients/new" className={adminClasses.approveBtn} style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
                    + Add Ingredient
                </Link>
            </div>

            <table className={adminClasses.table}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Unit</th>
                        <th>Default Amount</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.length === 0 && (
                        <tr><td colSpan={4} style={{ color: '#6a6060', fontStyle: 'italic' }}>No ingredients yet. Add one above.</td></tr>
                    )}
                    {ingredients.map((ing) => (
                        <tr key={ing._id.toString()}>
                            <td>{ing.name}</td>
                            <td>
                                <span className={classes.unitBadge}>
                                    {UNIT_LABELS[ing.unit] || ing.unit || '—'}
                                </span>
                            </td>
                            <td style={{ color: '#a09080', fontSize: '0.9rem' }}>
                                {ing.defaultAmount != null ? `${ing.defaultAmount} ${ing.unit}` : '—'}
                            </td>
                            <td>
                                <div className={classes.actionCell}>
                                    <Link
                                        href={`/admin/ingredients/${ing._id}/edit`}
                                        className={adminClasses.approveBtn}
                                        style={{ textDecoration: 'none', fontSize: '0.8rem' }}
                                    >
                                        Edit
                                    </Link>

                                    <form action={duplicateIngredient} style={{ display: 'inline' }}>
                                        <input type="hidden" name="id" value={ing._id.toString()} />
                                        <button type="submit" className={adminClasses.approveBtn} style={{ fontSize: '0.8rem', background: '#1a2a3a', borderColor: '#507090', color: '#80b0d0' }}>
                                            Duplicate
                                        </button>
                                    </form>

                                    <DeleteIngredientButton id={ing._id.toString()} name={ing.name} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}
