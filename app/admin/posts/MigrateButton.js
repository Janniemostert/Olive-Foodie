'use client';
import { migrateMealsToPost } from '@/lib/postActions';
import classes from '../admin.module.css';

export default function MigrateButton({ hasMeals }) {
    if (!hasMeals) return null;
    return (
        <form action={migrateMealsToPost} style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#a09080', fontSize: '0.9rem', marginBottom: '0.6rem' }}>
                {hasMeals} legacy meal(s) found. Migrate them to Recipe posts (subscriber-only, published today)?
            </p>
            <button
                type="submit"
                className={classes.approveBtn}
                onClick={(e) => { if (!confirm('Migrate all legacy meals to posts? This cannot be undone.')) e.preventDefault(); }}
            >
                Migrate Legacy Meals → Posts
            </button>
        </form>
    );
}
