package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.List;

public record AddComponentRequest(
    @Nullable String name,
    List<IngredientRequest> ingredients,
    List<StepRequest> steps
) {
    public record IngredientRequest(
        String slug,
        String name,
        recipebase.server.recipe.model.Quantity quantity,
        @Nullable String notes
    ) {}

    public record StepRequest(
        String body,
        @Nullable Integer timerSeconds
    ) {}
}
