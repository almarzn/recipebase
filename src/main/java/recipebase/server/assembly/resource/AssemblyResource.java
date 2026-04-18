package recipebase.server.assembly.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Yield;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AssemblyResource(
    UUID id,
    String slug,
    String name,
    List<String> tags,
    @Nullable Yield yield,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<AssemblyComponentResource> components
) {}
