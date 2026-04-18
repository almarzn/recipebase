package recipebase.server.assembly.resource;

import com.fasterxml.jackson.annotation.JsonRawValue;
import org.jspecify.annotations.Nullable;
import java.math.BigDecimal;
import java.util.UUID;

public record AssemblyComponentResource(
    UUID id,
    String slug,
    int compOrder,
    UUID itemId,
    String itemSlug,
    String itemName,
    String itemType,
    BigDecimal scaleFactor,
    boolean locked,
    @JsonRawValue @Nullable String lockSnapshot
) {}
