package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Quantity;
import java.util.UUID;

public record IngredientResource(
    UUID id,
    String slug,
    String name,
    Quantity quantity,
    @Nullable String notes,
    int position
) {}
