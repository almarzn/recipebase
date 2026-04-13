package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;

public record UpdateVariantBasicRequest(
	String name,
	@Nullable String description
) {}
