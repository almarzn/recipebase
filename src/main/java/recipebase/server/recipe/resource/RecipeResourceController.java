package recipebase.server.recipe.resource;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import recipebase.server.recipe.FindRecipeBySlugUseCase;

import java.util.List;

@Controller
@RestController
@RequestMapping("/api/recipes")
public class RecipeResourceController {
    private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;

    public RecipeResourceController(FindRecipeBySlugUseCase findRecipeBySlugUseCase) {
        this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
    }

    @GetMapping
    public List<RecipeResource> list() {
        return List.of();
    }

    @GetMapping("{slug}")
    public ResponseEntity<RecipeResource> findBySlug(@PathVariable String slug) {
        return ResponseEntity.of(findRecipeBySlugUseCase.execute(slug));
    }
}
