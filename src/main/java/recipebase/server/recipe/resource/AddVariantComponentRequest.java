package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.List;

public record AddVariantComponentRequest(
	String title,
	@Nullable String description,
	List<AddVariantRequest.IngredientRequest> ingredients,
	List<AddVariantRequest.StepRequest> steps
) {}
