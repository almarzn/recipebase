package recipebase.server.recipe.resource;

import java.util.UUID;

public record ComponentReference(
	UUID id,
	String slug
) {}
