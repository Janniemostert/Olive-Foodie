'use client';
import { deletePost } from '@/lib/postActions';
import classes from '../admin.module.css';

export default function DeletePostButton({ id }) {
    async function handleSubmit(e) {
        e.preventDefault();
        if (!confirm('Delete this post? The image will also be removed from Cloudinary. This cannot be undone.')) return;
        e.target.requestSubmit();
    }
    return (
        <form action={deletePost} onSubmit={handleSubmit} style={{ display: 'inline' }}>
            <input type="hidden" name="id" value={id} />
            <button type="submit" className={classes.suspendBtn} style={{ fontSize: '0.8rem' }}>Delete</button>
        </form>
    );
}
