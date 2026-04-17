import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import Image from 'next/image';
import classes from './page.module.css';

export default async function RecipesPage() {
    const session = await getServerSession(authOptions);
    const isActive = session?.user?.status === 'active' || session?.user?.role === 'admin';
    const userStatus = session?.user?.status || null;

    await connectDB();

    const query = isActive
        ? { isFoodPost: true, status: { $ne: 'draft' } }
        : { isFoodPost: true, status: { $ne: 'draft' }, isSubscriberOnly: { $ne: true } };

    const [recipes, subscriberOnlyCount] = await Promise.all([
        Post.find(query).sort({ createdAt: -1 }).lean(),
        isActive ? 0 : Post.countDocuments({
            isFoodPost: true,
            status: { $ne: 'draft' },
            isSubscriberOnly: true,
        }),
    ]);

    return (
        <main className={classes.main}>
            <header className={classes.header}>
                <h1>Browse Recipes</h1>
                <p>Frugal Family Meals!</p>
            </header>

            {!isActive && subscriberOnlyCount > 0 && (
                <div className={classes.banner}>
                    {!session
                        ? <>🔒 {subscriberOnlyCount} more {subscriberOnlyCount === 1 ? 'recipe is' : 'recipes are'} available to subscribers. <Link href="/auth/signin">Sign in</Link> to access.</>
                        : userStatus === 'pending'
                        ? <>⏳ {subscriberOnlyCount} more {subscriberOnlyCount === 1 ? 'recipe' : 'recipes'} will be available once your subscription is approved.</>
                        : <>🔒 {subscriberOnlyCount} more {subscriberOnlyCount === 1 ? 'recipe is' : 'recipes are'} for active subscribers. <a href="mailto:admin@example.com">Contact us</a> to re-activate.</>
                    }
                </div>
            )}

            <div className={classes.grid}>
                {recipes.length === 0 && (
                    <p className={classes.empty}>No recipes published yet.</p>
                )}
                {recipes.map((post) => (
                    <Link key={post._id.toString()} href={`/posts/${post.slug}`} className={classes.card}>
                        {post.image && (
                            <div className={classes.imageWrap}>
                                <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                            </div>
                        )}
                        <div className={classes.cardBody}>
                            {post.isSubscriberOnly && (
                                <span className={classes.subTag}>Subscribers</span>
                            )}
                            <h2>{post.title}</h2>
                            <p className={classes.date}>{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
