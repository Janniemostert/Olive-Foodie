'use client';
import { useFormState } from 'react-dom';
import { createIngredient, updateIngredient } from '@/lib/ingredientActions';
import classes from './ingredient.module.css';
import Link from 'next/link';

const UNITS = [
    { value: 'kg',   label: 'Kilogram (kg)' },
    { value: 'g',    label: 'Gram (g)' },
    { value: 'litre',label: 'Litre (L)' },
    { value: 'ml',   label: 'Millilitre (ml)' },
    { value: 'tsp',  label: 'Teaspoon (tsp)' },
    { value: 'tbsp', label: 'Tablespoon (tbsp)' },
    { value: 'cup',  label: 'Cup' },
    { value: 'each', label: 'Each' },
];

const initialState = { message: null };

export default function IngredientForm({ ingredient }) {
    const action = ingredient ? updateIngredient : createIngredient;
    const [state, formAction] = useFormState(action, initialState);
    const isEdit = !!ingredient;

    return (
        <form action={formAction} className={classes.form}>
            {isEdit && <input type="hidden" name="id" value={ingredient._id} />}

            {state?.message && <p className={classes.error}>{state.message}</p>}

            <div className={classes.field}>
                <label htmlFor="name">Ingredient Name *</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    defaultValue={ingredient?.name || ''}
                    placeholder="e.g. Fresh Tomatoes"
                    required
                />
            </div>

            <div className={classes.field}>
                <label htmlFor="unit">Unit of Measurement *</label>
                <select id="unit" name="unit" defaultValue={ingredient?.unit || ''} required>
                    <option value="" disabled>Select a unit…</option>
                    {UNITS.map((u) => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                </select>
            </div>

            <div className={classes.field}>
                <label htmlFor="defaultAmount">Default Amount (optional)</label>
                <input
                    id="defaultAmount"
                    type="number"
                    name="defaultAmount"
                    min="0"
                    step="any"
                    defaultValue={ingredient?.defaultAmount ?? ''}
                    placeholder="e.g. 500"
                />
                <span className={classes.hint}>This is a suggested default — can be overridden per recipe.</span>
            </div>

            <div className={classes.btnRow}>
                <button type="submit" className={classes.submitBtn}>
                    {isEdit ? 'Save Changes' : 'Add Ingredient'}
                </button>
                <Link href="/admin/ingredients" className={classes.cancelBtn}>Cancel</Link>
            </div>
        </form>
    );
}
