package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.time.Duration;
import java.util.UUID;

public record StepResource(
    UUID id,
    String slug,
    int stepOrder,
    String body,
    @Nullable Duration timer
) {}
