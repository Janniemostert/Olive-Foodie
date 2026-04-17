'use client';
import { deleteIngredient } from '@/lib/ingredientActions';
import adminClasses from '../admin.module.css';

export default function DeleteIngredientButton({ id, name }) {
    function handleSubmit(e) {
        e.preventDefault();
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        e.target.requestSubmit();
    }
    return (
        <form action={deleteIngredient} onSubmit={handleSubmit} style={{ display: 'inline' }}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={adminClasses.suspendBtn} style={{ fontSize: '0.8rem' }}>
                Delete
            </button>
        </form>
    );
}
