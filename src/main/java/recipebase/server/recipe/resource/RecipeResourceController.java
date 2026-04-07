package recipebase.server.recipe.resource;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import recipebase.server.recipe.FindAllRecipesUseCase;
import recipebase.server.recipe.FindRecipeBySlugUseCase;

@RestController
@RequestMapping("/api/recipes")
public class RecipeResourceController {

	private final FindAllRecipesUseCase findAllRecipesUseCase;
	private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;

	public RecipeResourceController(FindAllRecipesUseCase findAllRecipesUseCase, FindRecipeBySlugUseCase findRecipeBySlugUseCase) {
		this.findAllRecipesUseCase = findAllRecipesUseCase;
		this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
	}

	@GetMapping
	public List<RecipeSummaryResource> list() {
		return findAllRecipesUseCase.execute();
	}

	@GetMapping("{slug}")
	public ResponseEntity<RecipeResource> findBySlug(@PathVariable String slug) {
		return ResponseEntity.of(findRecipeBySlugUseCase.execute(slug));
	}
}
