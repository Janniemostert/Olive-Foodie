'use client';

export default function PostError({ error, reset }) {
    return (
        <main style={{ maxWidth: 800, margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
            <h1 style={{ color: '#c8a96e' }}>Something went wrong</h1>
            <p style={{ color: '#a09080', margin: '1rem 0' }}>
                {error?.message || 'An unexpected error occurred.'}
            </p>
            <button
                onClick={reset}
                style={{
                    background: '#3a2f10', color: '#c8a96e', border: '1px solid #c8a96e',
                    padding: '0.5rem 1.2rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem',
                }}
            >
                Try again
            </button>
        </main>
    );
}
