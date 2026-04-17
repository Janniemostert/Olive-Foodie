'use server';
import { connectDB } from '@/lib/db';
import Ingredient from '@/lib/models/Ingredient';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createIngredient(prevState, formData) {
    const name          = formData.get('name')?.trim();
    const unit          = formData.get('unit')?.trim() || '';
    const rawAmount = formData.get('defaultAmount');
    const defaultAmount = rawAmount !== '' && rawAmount != null ? parseFloat(rawAmount) : null;

    if (!name) return { message: 'Name is required.' };
    if (!unit) return { message: 'Unit is required.' };

    await connectDB();
    try {
        await Ingredient.create({ name, unit, defaultAmount });
    } catch (err) {
        if (err.code === 11000) {
            return { message: `An ingredient named "${name}" already exists.` };
        }
        return { message: 'Something went wrong. Please try again.' };
    }

    revalidatePath('/admin/ingredients');
    redirect('/admin/ingredients');
}

export async function updateIngredient(prevState, formData) {
    const id            = formData.get('id');
    const name          = formData.get('name')?.trim();
    const unit          = formData.get('unit')?.trim() || '';
    const rawAmount = formData.get('defaultAmount');
    const defaultAmount = rawAmount !== '' && rawAmount != null ? parseFloat(rawAmount) : null;

    if (!name) return { message: 'Name is required.' };
    if (!unit) return { message: 'Unit is required.' };

    await connectDB();
    try {
        await Ingredient.findByIdAndUpdate(id, { name, unit, defaultAmount });
    } catch (err) {
        if (err.code === 11000) {
            return { message: `An ingredient named "${name}" already exists.` };
        }
        return { message: 'Something went wrong. Please try again.' };
    }

    revalidatePath('/admin/ingredients');
    redirect('/admin/ingredients');
}

export async function deleteIngredient(formData) {
    const id = formData.get('id');
    await connectDB();
    await Ingredient.findByIdAndDelete(id);
    revalidatePath('/admin/ingredients');
}

export async function duplicateIngredient(formData) {
    const id = formData.get('id');
    await connectDB();
    const original = await Ingredient.findById(id).lean();
    if (!original) return;

    let newName = `${original.name} (copy)`;
    // If "copy" already exists keep incrementing
    let counter = 2;
    while (await Ingredient.findOne({ name: newName })) {
        newName = `${original.name} (copy ${counter++})`;
    }

    await Ingredient.create({
        name:          newName,
        unit:          original.unit,
        defaultAmount: original.defaultAmount,
    });

    revalidatePath('/admin/ingredients');
}
