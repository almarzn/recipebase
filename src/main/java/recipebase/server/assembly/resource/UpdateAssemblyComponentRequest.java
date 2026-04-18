package recipebase.server.assembly.resource;

import java.math.BigDecimal;

public record UpdateAssemblyComponentRequest(
    BigDecimal scaleFactor,
    boolean locked
) {}
