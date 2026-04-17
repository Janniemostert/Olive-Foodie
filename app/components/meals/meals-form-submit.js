"use client"

import { useFormStatus } from 'react-dom'

export default function mealsFormSubmit() {
    const {pending} = useFormStatus()
    return (
        <button disabled={pending}>{pending ? 'Submitting ...' : 'Share meal'}</button>
    )
}