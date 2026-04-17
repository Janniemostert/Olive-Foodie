'use client';
import { signIn } from 'next-auth/react';
import classes from './signin.module.css';

export default function SignInPage() {
    return (
        <main className={classes.main}>
            <div className={classes.card}>
                <h1>Sign In</h1>
                <p>Sign in to access recipes, tips and more.</p>
                <button onClick={() => signIn('google', { callbackUrl: '/pending' })} className={classes.googleBtn}>
                    Sign in with Google
                </button>
            </div>
        </main>
    );
}
