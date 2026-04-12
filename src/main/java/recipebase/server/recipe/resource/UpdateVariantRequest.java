package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.List;

public record UpdateVariantRequest(
        String name,
        @Nullable String description,
        List<AddVariantRequest.ComponentRequest> components
) {}
