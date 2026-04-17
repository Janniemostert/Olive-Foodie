'use client';
import { useFormState } from 'react-dom';
import { saveIngredient } from '@/lib/postActions';
import classes from './new-post.module.css';

const initialState = { message: null, success: false };

export default function AddIngredientForm() {
    const [state, formAction] = useFormState(saveIngredient, initialState);
    return (
        <form action={formAction} className={classes.ingredientLibForm}>
            {state?.message && (
                <p className={state.success ? classes.success : classes.error}>{state.message}</p>
            )}
            <input type="text" name="name" placeholder="Ingredient name *" required />
            <input type="text" name="unit" placeholder="Default unit (e.g. g, ml, cup)" />
            <button type="submit" className={classes.addBtn}>Save to Library</button>
        </form>
    );
}
