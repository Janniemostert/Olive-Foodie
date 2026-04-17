import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import Meal from '@/lib/models/Meal';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import classes from '../admin.module.css';
import DeletePostButton from './DeletePostButton';
import MigrateButton from './MigrateButton';
import ToggleStatusButton from './ToggleStatusButton';

function StatusBadge({ status }) {
    const style = status === 'published'
        ? { background: '#1a3a1a', color: '#6ecf6e', border: '1px solid #3a6a3a', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem' }
        : { background: '#3a3000', color: '#c8a040', border: '1px solid #6a5800', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem' };
    return <span style={style}>{status === 'published' ? 'Published' : 'Draft'}</span>;
}

function PostsTable({ posts, emptyMessage }) {
    return (
        <table className={classes.table} style={{ marginBottom: '2.5rem' }}>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {posts.length === 0 && (
                    <tr><td colSpan={5} style={{ color: '#6a6060', fontStyle: 'italic' }}>{emptyMessage}</td></tr>
                )}
                {posts.map((post) => {
                    const status = post.status || 'published';
                    return (
                        <tr key={post._id.toString()}>
                            <td>{post.title}</td>
                            <td>
                                <span className={`${classes.badge} ${post.isSubscriberOnly ? classes.suspended : classes.active}`}>
                                    {post.isSubscriberOnly ? 'Subscribers' : 'Free'}
                                </span>
                            </td>
                            <td>
                                <ToggleStatusButton id={post._id.toString()} status={status} />
                            </td>
                            <td style={{ fontSize: '0.85rem', color: '#a09080' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                            <td style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <Link href={`/admin/posts/${post._id}/edit`} className={classes.approveBtn} style={{ textDecoration: 'none', fontSize: '0.8rem' }}>
                                    Edit
                                </Link>
                                <DeletePostButton id={post._id.toString()} />
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default async function AdminPostsPage() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') redirect('/');

    await connectDB();
    const [posts, mealCount] = await Promise.all([
        Post.find({}).sort({ createdAt: -1 }).lean(),
        Meal.countDocuments(),
    ]);

    const tips    = posts.filter((p) => !p.isFoodPost);
    const recipes = posts.filter((p) => p.isFoodPost);

    return (
        <main className={classes.main}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Admin — Content</h1>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <Link href="/admin/posts/new?type=article" className={classes.approveBtn} style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
                        + Tip / Article
                    </Link>
                    <Link href="/admin/posts/new?type=recipe" className={classes.approveBtn} style={{ padding: '0.5rem 1rem', textDecoration: 'none', background: '#1a3a1a', border: '1px solid #3a6a3a' }}>
                        + Recipe
                    </Link>
                </div>
            </div>

            <h2 style={{ color: '#c8a96e', fontSize: '1rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tips, Tricks &amp; News
            </h2>
            <PostsTable posts={tips} emptyMessage="No tips or articles yet." />

            <h2 style={{ color: '#c8a96e', fontSize: '1rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recipes
            </h2>
            <PostsTable posts={recipes} emptyMessage="No recipes yet." />

            {mealCount > 0 && (
                <div style={{ marginTop: '1rem', padding: '1.2rem', background: '#1a1510', border: '1px solid #3a3020', borderRadius: 8 }}>
                    <h2 style={{ color: '#c8a96e', fontSize: '1rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Legacy Meals
                    </h2>
                    <MigrateButton hasMeals={mealCount} />
                </div>
            )}
        </main>
    );
}


