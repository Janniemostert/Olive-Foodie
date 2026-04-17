'use client';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { createPost } from '@/lib/postActions';
import classes from './new-post.module.css';

const initialState = { message: null };

const PREP_METHODS = [
    'Whole','Raw','Rinsed','Peeled','Sliced','Chopped','Diced','Minced',
    'Grated','Crushed','Julienned','Shredded','Torn','Rings','Cubed',
    'Quartered','Halved','Separated','Whipped','Beaten','Whisked',
    'Scrambled','Fried','Blanched','Roasted','Grilled','Steamed',
    'Boiled','Melted','Sifted',
];

export default function NewPostForm({ ingredients, isRecipe }) {
    const [state, formAction] = useFormState(createPost, initialState);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [ingredientMode, setIngredientMode] = useState('library');

    function addIngredient() {
        setSelectedIngredients((prev) => [...prev, { ingredientId: '', qty: '', prepMethods: [] }]);
    }

    function removeIngredient(index) {
        setSelectedIngredients((prev) => prev.filter((_, i) => i !== index));
    }

    function updateIngredient(index, field, value) {
        setSelectedIngredients((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );
    }

    function togglePrepMethod(index, method) {
        setSelectedIngredients((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;
                const has = item.prepMethods.includes(method);
                return {
                    ...item,
                    prepMethods: has
                        ? item.prepMethods.filter((m) => m !== method)
                        : [...item.prepMethods, method],
                };
            })
        );
    }

    return (
        <form action={formAction} className={classes.form}>
            <input type="hidden" name="isFoodPost" value={isRecipe ? 'on' : 'off'} />

            {state?.message && <p className={classes.error}>{state.message}</p>}

            <div className={classes.field}>
                <label>Title *</label>
                <input type="text" name="title" required />
            </div>

            {isRecipe && (
                <div className={classes.ingredients}>
                    <div className={classes.modeToggle}>
                        <span>Ingredients:</span>
                        <button type="button" onClick={() => setIngredientMode('library')} className={`${classes.modeBtn} ${ingredientMode === 'library' ? classes.modeBtnActive : ''}`}>Use Library</button>
                        <button type="button" onClick={() => setIngredientMode('text')} className={`${classes.modeBtn} ${ingredientMode === 'text' ? classes.modeBtnActive : ''}`}>Free Text</button>
                    </div>
                    <input type="hidden" name="ingredientMode" value={ingredientMode} />

                    {ingredientMode === 'text' ? (
                        <textarea
                            name="ingredientsText"
                            rows={6}
                            placeholder={"List your ingredients here, one per line.\ne.g.\n500g Onions\n2 cloves Garlic, minced\n1 cup Tomatoes, diced"}
                            className={classes.ingredientsTextarea}
                        />
                    ) : (
                        <>
                            {selectedIngredients.map((item, index) => (
                        <div key={index} className={classes.ingredientCard}>
                            <div className={classes.ingredientRow}>
                                <select
                                    name="ingredientId"
                                    value={item.ingredientId}
                                    onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                                    required
                                >
                                    <option value="">Select ingredient</option>
                                    {ingredients.map((ing) => (
                                        <option key={ing._id} value={ing._id}>
                                            {ing.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    name="qty"
                                    placeholder="Qty e.g. 500g"
                                    value={item.qty}
                                    onChange={(e) => updateIngredient(index, 'qty', e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => removeIngredient(index)} className={classes.removeBtn}>✕</button>
                            </div>
                            <details className={classes.prepDetails}>
                                <summary className={classes.prepSummary}>
                                    {item.prepMethods.length > 0
                                        ? `Preparation: ${item.prepMethods.join(', ')}`
                                        : 'Preparation methods (optional)'}
                                </summary>
                                <div className={classes.prepMethods}>
                                    {PREP_METHODS.map((method) => (
                                        <label key={method} className={`${classes.prepChip} ${item.prepMethods.includes(method) ? classes.prepChipActive : ''}`}>
                                            <input
                                                type="checkbox"
                                                style={{ display: 'none' }}
                                                checked={item.prepMethods.includes(method)}
                                                onChange={() => togglePrepMethod(index, method)}
                                            />
                                            {method}
                                        </label>
                                    ))}
                                </div>
                            </details>
                            <input type="hidden" name="prepMethodsJson" value={JSON.stringify(item.prepMethods)} />
                        </div>
                    ))}
                    <button type="button" onClick={addIngredient} className={classes.addBtn}>+ Add Ingredient</button>
                        </>
                    )}
                </div>
            )}

            <div className={classes.field}>
                <label>{isRecipe ? 'Method *' : 'Body *'}</label>
                <textarea name="body" rows={10} placeholder={isRecipe ? 'Describe the cooking method / steps…' : ''} required />
            </div>

            <div className={classes.field}>
                <label>Image (optional)</label>
                <input type="file" name="image" accept="image/*" />
            </div>

            <div className={classes.field}>
                <label>Video Link (optional)</label>
                <input type="url" name="videoLink" placeholder="https://youtube.com/..." />
            </div>

            <div className={classes.switchRow}>
                <span className={classes.switchLabel}>Subscribers Only</span>
                <label className={classes.toggle}>
                    <input type="checkbox" name="isSubscriberOnly" />
                    <span className={classes.toggleSlider}></span>
                </label>
            </div>

            <div className={classes.submitRow}>
                <button type="submit" name="status" value="published" className={classes.submitBtn}>
                    Publish
                </button>
                <button type="submit" name="status" value="draft" className={`${classes.submitBtn} ${classes.draftBtn}`}>
                    Save as Draft
                </button>
            </div>
        </form>
    );
}
