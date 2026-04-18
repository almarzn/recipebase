package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Source;
import recipebase.server.recipe.model.Yield;
import java.util.List;

public record UpdateRecipeRequest(
    String name,
    List<String> tags,
    @Nullable Source source,
    @Nullable Yield yield,
    @Nullable String notes
) {}
