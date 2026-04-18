package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Source;
import recipebase.server.recipe.model.Yield;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record RecipeResource(
    UUID id,
    String slug,
    String name,
    List<String> tags,
    @Nullable Source source,
    @Nullable Yield yield,
    @Nullable String notes,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<ComponentResource> components
) {}
