import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import Image from 'next/image';
import classes from './posts.module.css';

export default async function PostsPage() {
    const session = await getServerSession(authOptions);
    const isActive = session?.user?.status === 'active' || session?.user?.role === 'admin';
    const userStatus = session?.user?.status || null;

    await connectDB();

    const query = isActive
        ? { isFoodPost: false, status: { $ne: 'draft' } }
        : { isFoodPost: false, status: { $ne: 'draft' }, isSubscriberOnly: { $ne: true } };

    const [posts, subscriberOnlyCount] = await Promise.all([
        Post.find(query).sort({ createdAt: -1 }).lean(),
        isActive ? 0 : Post.countDocuments({
            isFoodPost: false,
            status: { $ne: 'draft' },
            isSubscriberOnly: true,
        }),
    ]);

    return (
        <main className={classes.main}>
            <header className={classes.header}>
                <h1>Tips, Tricks &amp; News</h1>
                <p>Insights from our kitchen to yours.</p>
            </header>

            {!isActive && subscriberOnlyCount > 0 && (
                <div className={classes.banner}>
                    {!session
                        ? <>{'\uD83D\uDD12'} {subscriberOnlyCount} more {subscriberOnlyCount === 1 ? 'article is' : 'articles are'} available to subscribers. <Link href="/auth/signin">Sign in</Link> to access.</>
                        : userStatus === 'pending'
                        ? <>{'\u23F3'} {subscriberOnlyCount} more {subscriberOnlyCount === 1 ? 'article' : 'articles'} will be available once your subscription is approved.</>
                        : <>{'\uD83D\uDD12'} {subscriberOnlyCount} more {subscriberOnlyCount === 1 ? 'article is' : 'articles are'} for active subscribers. <a href="mailto:admin@example.com">Contact us</a> to re-activate.</>
                    }
                </div>
            )}

            <div className={classes.grid}>
                {posts.length === 0 && (
                    <p style={{ color: '#6a6060', fontStyle: 'italic', gridColumn: '1/-1' }}>No articles published yet.</p>
                )}
                {posts.map((post) => (
                    <Link key={post._id.toString()} href={`/posts/${post.slug}`} className={classes.card}>
                        {post.image && (
                            <div className={classes.imageWrap}>
                                <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                            </div>
                        )}
                        <div className={classes.cardBody}>
                            <div className={classes.meta}>
                                {post.isSubscriberOnly && (
                                    <span className={classes.subTag}>Subscribers</span>
                                )}
                            </div>
                            <h2>{post.title}</h2>
                            <p className={classes.date}>{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}
