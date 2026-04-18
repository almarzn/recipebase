package recipebase.server.recipe.model;

import org.jspecify.annotations.Nullable;
import java.math.BigDecimal;

public record Yield(
    @Nullable BigDecimal quantity,
    @Nullable String unit,
    @Nullable String description
) {}
