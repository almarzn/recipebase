package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;

public record UpdateRecipeRequest(
        String title,
        @Nullable String description
) {}
