package recipebase.server.item.resource;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public record ItemSummaryResource(
    UUID id,
    String slug,
    String type,
    String name,
    List<String> tags
) {}
