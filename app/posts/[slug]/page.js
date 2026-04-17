import { connectDB } from '@/lib/db';
import Post from '@/lib/models/Post';
import Ingredient from '@/lib/models/Ingredient';
import Comment from '@/lib/models/Comment';
import User from '@/lib/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Comments from '@/app/components/comments/Comments';
import classes from './post.module.css';

export default async function PostPage({ params }) {
    const session = await getServerSession(authOptions);
    const isActive = session?.user?.status === 'active' || session?.user?.role === 'admin';
    const currentUserId = session?.user?.id || null;
    const isAdmin = session?.user?.role === 'admin';

    await connectDB();
    const post = await Post.findOne({ slug: params.slug }).populate('ingredients.ingredient').lean();

    if (!post || post.status === 'draft') notFound();

    // Soft gate for subscriber-only content
    if (post.isSubscriberOnly && !isActive) {
        return (
            <main className={classes.main}>
                <article>
                    <header className={classes.header}>
                        <div className={classes.meta}>
                            <span className={post.isFoodPost ? classes.foodTag : classes.postTag}>
                                {post.isFoodPost ? 'Recipe' : 'Article'}
                            </span>
                            <span className={classes.subTag}>Subscribers Only</span>
                        </div>
                        <h1>{post.title}</h1>
                    </header>
                    {post.image && (
                        <div className={classes.imageWrap}>
                            <Image src={post.image} alt={post.title} fill sizes="100vw" style={{ objectFit: 'cover' }} />
                        </div>
                    )}
                    <div className={classes.gate}>
                        <p>🔒 This content is available to subscribers only.</p>
                        {!session
                            ? <Link href="/auth/signin" className={classes.gateBtn}>Sign in to access</Link>
                            : session.user?.status === 'pending'
                            ? <p className={classes.gateNote}>Your subscription is pending approval. You will be notified once access is granted.</p>
                            : <p className={classes.gateNote}>Your subscription is not active. <a href="mailto:admin@example.com">Contact us</a> to re-activate.</p>
                        }
                    </div>
                </article>
            </main>
        );
    }

    // Fetch comments with user details
    const rawComments = await Comment.find({ postId: post._id }).sort({ createdAt: 1 }).lean();
    const userIds = [...new Set(rawComments.map((c) => c.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const comments = rawComments.map((c) => ({
        _id:        c._id.toString(),
        parentId:   c.parentId?.toString() || null,
        body:       c.body,
        createdAt:  c.createdAt.toISOString(),
        userName:   userMap[c.userId.toString()]?.name || 'Unknown',
        userEmail:  userMap[c.userId.toString()]?.email || '',
        userId:     c.userId.toString(),
        userActive: ['active'].includes(userMap[c.userId.toString()]?.status) ||
                    userMap[c.userId.toString()]?.role === 'admin',
    }));

    const canComment = isActive;

    return (
        <main className={classes.main}>
            <article>
                <header className={classes.header}>
                    <div className={classes.meta}>
                        <span className={post.isFoodPost ? classes.foodTag : classes.postTag}>
                            {post.isFoodPost ? 'Recipe' : 'Article'}
                        </span>
                        {post.isSubscriberOnly && <span className={classes.subTag}>Subscribers Only</span>}
                    </div>
                    <h1>{post.title}</h1>
                    <p className={classes.date}>{new Date(post.createdAt).toLocaleDateString()}</p>
                </header>

                {post.image && (
                    <div className={classes.imageWrap}>
                        <Image src={post.image} alt={post.title} fill sizes="100vw" style={{ objectFit: 'cover' }} />
                    </div>
                )}

                {post.isFoodPost && (
                    <div className={classes.ingredients}>
                        <h2>Ingredients</h2>
                        {post.ingredientsText ? (
                            <div className={classes.ingredientsText}>
                                {post.ingredientsText.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        ) : post.ingredients?.length > 0 ? (
                            <ul>
                                {post.ingredients.map((item, i) => (
                                    <li key={i}>
                                        <strong>{item.qty}</strong> {item.ingredient?.name}
                                        {item.prepMethods?.length > 0 && (
                                            <span style={{ color: '#a09080', fontStyle: 'italic', marginLeft: '0.4rem', fontSize: '0.9em' }}>
                                                — {item.prepMethods.join(', ')}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                )}

                <div className={classes.body}>
                    {post.isFoodPost && <h2>Method</h2>}
                    <div dangerouslySetInnerHTML={{ __html: post.body.replace(/\n/g, '<br/>') }} />
                </div>

                {post.videoLink && (
                    <div className={classes.video}>
                        <h2>Video</h2>
                        <a href={post.videoLink} target="_blank" rel="noopener noreferrer">{post.videoLink}</a>
                    </div>
                )}
            </article>

            <Comments
                postId={post._id.toString()}
                postType="post"
                slug={post.slug}
                comments={comments}
                canComment={canComment}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
            />
        </main>
    );
}
