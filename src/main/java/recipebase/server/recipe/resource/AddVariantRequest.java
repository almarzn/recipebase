package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.List;

public record AddVariantRequest(
        String name,
        @Nullable String description,
        List<ComponentRequest> components
) {
    public record ComponentRequest(
            String title,
            @Nullable String description,
            List<IngredientRequest> ingredients,
            List<StepRequest> steps
    ) {}

    public record IngredientRequest(
            String slug,
            String name,
            @Nullable String notes,
            RecipeResource.Ingredient.Quantity quantity
    ) {}

    public record StepRequest(
            String text,
            @Nullable String notes,
            RecipeResource.Step.@Nullable TimerAttachment attachment
    ) {}
}
