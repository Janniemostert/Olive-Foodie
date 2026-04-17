"use server";

import { revalidatePath } from "next/cache";
import { saveMeal } from "./meals";
import { redirect } from "next/navigation";

function isValidText(text) {
    return !text || text.trim() === "";
}

export async function shareMeal(prevState, formData) {
    const meal = {
        title: formData.get("title"), 
        summary: formData.get("summary"), 
        instructions: formData.get("instructions"), 
        image: formData.get("image"), 
        creator: formData.get("name"), 
        creator_email: formData.get("email")
    }

    if (
        isValidText(meal.title) || 
        isValidText(meal.summary) || 
        isValidText(meal.instructions) ||
        isValidText(meal.creator) ||
        isValidText(meal.creator_email) ||
        !meal.creator_email.includes("@") ||
        !meal.image || meal.image.size === 0
    ) {
       return {
        message: "Invalid Input"
       }
    }

   await saveMeal(meal);
   revalidatePath("/meals")
   redirect("/meals");
}