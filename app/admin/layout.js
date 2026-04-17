import Link from 'next/link';
import classes from './layout.module.css';

export default function AdminLayout({ children }) {
    return (
        <div className={classes.layout}>
            <nav className={classes.sidebar}>
                <h2>Admin</h2>
                <Link href="/admin">Users</Link>
                <Link href="/admin/posts">Posts</Link>
                <Link href="/admin/posts/new?type=article">+ Tip / Article</Link>
                <Link href="/admin/posts/new?type=recipe">+ Recipe</Link>
                <Link href="/admin/ingredients">Ingredients</Link>
            </nav>
            <div className={classes.content}>{children}</div>
        </div>
    );
}
