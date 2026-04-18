package recipebase.server.assembly.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Yield;
import java.util.List;

public record CreateAssemblyRequest(
    String name,
    List<String> tags,
    @Nullable Yield yield
) {}
