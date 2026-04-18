package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.List;
import java.util.UUID;

public record ComponentResource(
    UUID id,
    String slug,
    @Nullable String name,
    int position,
    List<IngredientResource> ingredients,
    List<StepResource> steps
) {}
