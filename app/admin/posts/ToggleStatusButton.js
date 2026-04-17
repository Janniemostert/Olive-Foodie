'use client';
import { togglePostStatus } from '@/lib/postActions';
import classes from '../admin.module.css';

const publishedStyle = {
    background: '#1a3a1a',
    color: '#6ecf6e',
    border: '1px solid #3a6a3a',
    padding: '2px 10px',
    borderRadius: 4,
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
};

const draftStyle = {
    background: '#3a3000',
    color: '#c8a040',
    border: '1px solid #6a5800',
    padding: '2px 10px',
    borderRadius: 4,
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
};

export default function ToggleStatusButton({ id, status }) {
    const isPublished = status === 'published';
    return (
        <form action={togglePostStatus} style={{ display: 'inline' }}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="current" value={status} />
            <button
                type="submit"
                style={isPublished ? publishedStyle : draftStyle}
                title={isPublished ? 'Click to set as Draft' : 'Click to Publish'}
            >
                {isPublished ? 'Published' : 'Draft'}
            </button>
        </form>
    );
}
