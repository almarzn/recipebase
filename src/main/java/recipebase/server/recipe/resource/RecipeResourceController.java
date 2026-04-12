package recipebase.server.recipe.resource;

import java.util.List;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import recipebase.server.recipe.AddVariantUseCase;
import recipebase.server.recipe.DeleteVariantUseCase;
import recipebase.server.recipe.FindAllRecipesUseCase;
import recipebase.server.recipe.FindRecipeBySlugUseCase;
import recipebase.server.recipe.UpdateRecipeUseCase;
import recipebase.server.recipe.UpdateVariantUseCase;

@RestController
@RequestMapping("/api/recipes")
public class RecipeResourceController {

	private final FindAllRecipesUseCase findAllRecipesUseCase;
	private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;
	private final UpdateRecipeUseCase updateRecipeUseCase;
	private final AddVariantUseCase addVariantUseCase;
	private final UpdateVariantUseCase updateVariantUseCase;
	private final DeleteVariantUseCase deleteVariantUseCase;

	public RecipeResourceController(
			FindAllRecipesUseCase findAllRecipesUseCase,
			FindRecipeBySlugUseCase findRecipeBySlugUseCase,
			UpdateRecipeUseCase updateRecipeUseCase,
			AddVariantUseCase addVariantUseCase,
			UpdateVariantUseCase updateVariantUseCase,
			DeleteVariantUseCase deleteVariantUseCase) {
		this.findAllRecipesUseCase = findAllRecipesUseCase;
		this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
		this.updateRecipeUseCase = updateRecipeUseCase;
		this.addVariantUseCase = addVariantUseCase;
		this.updateVariantUseCase = updateVariantUseCase;
		this.deleteVariantUseCase = deleteVariantUseCase;
	}

	@GetMapping
	public List<RecipeSummaryResource> list() {
		return findAllRecipesUseCase.execute();
	}

	@GetMapping("{slug}")
	public ResponseEntity<RecipeResource> findBySlug(@PathVariable String slug) {
		return ResponseEntity.of(findRecipeBySlugUseCase.execute(slug));
	}

	@PatchMapping("{slug}")
	public ResponseEntity<RecipeResource> updateRecipe(
			@PathVariable String slug,
			@RequestBody UpdateRecipeRequest request) {
		return ResponseEntity.of(updateRecipeUseCase.execute(slug, request));
	}

	@PostMapping("{slug}/variants")
	public ResponseEntity<AddVariantResponse> addVariant(
			@PathVariable String slug,
			@RequestBody AddVariantRequest request) {
		return addVariantUseCase.execute(slug, request)
			.map(r -> ResponseEntity.status(HttpStatus.CREATED).<AddVariantResponse>body(r))
			.orElse(ResponseEntity.notFound().build());
	}

	@PutMapping("{slug}/variants/{variantSlug}")
	public ResponseEntity<RecipeResource> updateVariant(
			@PathVariable String slug,
			@PathVariable String variantSlug,
			@RequestBody UpdateVariantRequest request) {
		return ResponseEntity.of(updateVariantUseCase.execute(slug, variantSlug, request));
	}

	@DeleteMapping("{slug}/variants/{variantSlug}")
	public ResponseEntity<Void> deleteVariant(
			@PathVariable String slug,
			@PathVariable String variantSlug) {
		boolean found = deleteVariantUseCase.execute(slug, variantSlug);
		return found ? ResponseEntity.noContent().build()
					 : ResponseEntity.notFound().build();
	}

	@ExceptionHandler(DuplicateKeyException.class)
	@ResponseStatus(HttpStatus.CONFLICT)
	void handleDuplicate() {}
}
