'use client';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { updatePost, deletePost } from '@/lib/postActions';
import classes from '../new/new-post.module.css';

const initialState = { message: null };

const PREP_METHODS = [
    'Whole','Raw','Rinsed','Peeled','Sliced','Chopped','Diced','Minced',
    'Grated','Crushed','Julienned','Shredded','Torn','Rings','Cubed',
    'Quartered','Halved','Separated','Whipped','Beaten','Whisked',
    'Scrambled','Fried','Blanched','Roasted','Grilled','Steamed',
    'Boiled','Melted','Sifted',
];

export default function EditPostForm({ post, ingredients }) {
    const [state, formAction] = useFormState(updatePost, initialState);
    const isRecipe = post.isFoodPost;
    const [selectedIngredients, setSelectedIngredients] = useState(
        post.ingredients?.map((item) => ({
            ingredientId: item.ingredient?._id?.toString() || item.ingredient?.toString() || '',
            qty:          item.qty,
            prepMethods:  item.prepMethods || [],
        })) || []
    );
    const [ingredientMode, setIngredientMode] = useState(post.ingredientsText ? 'text' : 'library');
    const [ingredientsTextValue, setIngredientsTextValue] = useState(post.ingredientsText || '');

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
        <>
            <form action={formAction} className={classes.form}>
                <input type="hidden" name="id" value={post._id} />
                <input type="hidden" name="isFoodPost" value={isRecipe ? 'on' : 'off'} />
                {state?.message && <p className={classes.error}>{state.message}</p>}

                <div className={classes.field}>
                    <label>Title *</label>
                    <input type="text" name="title" defaultValue={post.title} required />
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
                                value={ingredientsTextValue}
                                onChange={(e) => setIngredientsTextValue(e.target.value)}
                                placeholder={"List your ingredients here, one per line.\ne.g.\n500g Onions\n2 cloves Garlic, minced"}
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
                    <textarea name="body" rows={10} defaultValue={post.body} placeholder={isRecipe ? 'Describe the cooking method / steps…' : ''} required />
                </div>

                <div className={classes.field}>
                    <label>Replace Image (optional)</label>
                    {post.image && <img src={post.image} alt="current" style={{ width: 120, borderRadius: 6, marginBottom: 8 }} />}
                    <input type="file" name="image" accept="image/*" />
                </div>

                <div className={classes.field}>
                    <label>Video Link (optional)</label>
                    <input type="url" name="videoLink" defaultValue={post.videoLink || ''} placeholder="https://youtube.com/..." />
                </div>

                <div className={classes.switchRow}>
                    <span className={classes.switchLabel}>Subscribers Only</span>
                    <label className={classes.toggle}>
                        <input type="checkbox" name="isSubscriberOnly" defaultChecked={post.isSubscriberOnly} />
                        <span className={classes.toggleSlider}></span>
                    </label>
                </div>

                <div className={classes.submitRow}>
                    <button type="submit" name="status" value="published" className={classes.submitBtn}>
                        Save &amp; Publish
                    </button>
                    <button type="submit" name="status" value="draft" className={`${classes.submitBtn} ${classes.draftBtn}`}>
                        Save as Draft
                    </button>
                </div>
            </form>

            <hr style={{ border: 'none', borderTop: '1px solid #3a3530', margin: '2rem 0' }} />

            <form action={deletePost}>
                <input type="hidden" name="id" value={post._id} />
                <button
                    type="submit"
                    className={classes.submitBtn}
                    style={{ background: '#3a2020', color: '#e06060', border: '1px solid #e06060' }}
                    onClick={(e) => { if (!confirm('Delete this post? This cannot be undone.')) e.preventDefault(); }}
                >
                    Delete Post
                </button>
            </form>
        </>
    );
}
