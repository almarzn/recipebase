package recipebase.server.recipe.model;

import org.jspecify.annotations.Nullable;

public record Yield(
    @Nullable Quantity quantity,
    @Nullable String description
) {}
