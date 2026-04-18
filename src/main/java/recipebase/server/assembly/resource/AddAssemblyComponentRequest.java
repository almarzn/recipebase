package recipebase.server.assembly.resource;

import java.math.BigDecimal;

public record AddAssemblyComponentRequest(
    String itemSlug,
    BigDecimal scaleFactor
) {}
