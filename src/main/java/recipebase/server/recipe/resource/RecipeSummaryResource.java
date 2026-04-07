package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record RecipeSummaryResource(
        UUID id,
        String slug,
        String title,
        @Nullable String description,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<VariantSummary> variants
) {
    public record VariantSummary(String slug, String name) {
    }
}
