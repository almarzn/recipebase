package recipebase.server.recipe.resource;

import java.util.List;

public record ReplaceVariantComponentsRequest(
	List<AddVariantRequest.ComponentRequest> components
) {}
