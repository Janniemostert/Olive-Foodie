import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import classes from './pending.module.css';

export default async function PendingPage() {
    const session = await getServerSession(authOptions);

    // Active users / admins don't belong here
    if (!session || session.user?.status === 'active' || session.user?.role === 'admin') {
        redirect('/meals');
    }

    const status = session.user?.status;
    const isPending      = status === 'pending';
    const isSuspended    = status === 'suspended';
    const isUnsubscribed = status === 'unsubscribed';

    return (
        <main className={classes.main}>
            <div className={classes.card}>

                {isPending && (
                    <>
                        <div className={classes.badge}>⏳ Pending Approval</div>
                        <h1>Thanks for registering!</h1>
                        <p>Your account is currently <strong>awaiting approval</strong>. We will notify you by email once your subscription is confirmed and you have full access to all recipes and articles.</p>
                    </>
                )}
                {isSuspended && (
                    <>
                        <div className={`${classes.badge} ${classes.badgeSuspended}`}>⚠️ Account Suspended</div>
                        <h1>Account Suspended</h1>
                        <p>Your account has been suspended. Please contact us if you believe this is an error or to discuss re-activating your subscription.</p>
                    </>
                )}
                {isUnsubscribed && (
                    <>
                        <div className={`${classes.badge} ${classes.badgeInactive}`}>🔒 Subscription Inactive</div>
                        <h1>Subscription Inactive</h1>
                        <p>Your subscription is no longer active. Contact us to re-activate and regain full access to all content.</p>
                    </>
                )}

                <p className={classes.contact}>
                    Questions? <a href="mailto:admin@example.com">Contact us</a>
                </p>

                <div className={classes.termsBox}>
                    <h2>Terms &amp; Conditions</h2>
                    <p>By using this platform you agree to use all content for personal, non-commercial purposes only. Recipes and articles published here are the property of their respective authors. You may not reproduce, distribute, or sell any content without written permission. We reserve the right to suspend or revoke access at any time for violation of these terms. Subscription access is subject to approval and renewal at the discretion of the site administrators.</p>
                </div>

                <div className={classes.browseSection}>
                    <p>In the meantime, you can browse our free content:</p>
                    <div className={classes.browseLinks}>
                        <Link href="/meals" className={classes.browseBtn}>Free Recipes</Link>
                        <Link href="/posts" className={classes.browseBtn}>Free Articles</Link>
                    </div>
                </div>

            </div>
        </main>
    );
}

