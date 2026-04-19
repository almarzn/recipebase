package recipebase.server.recipe.resource;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import recipebase.server.recipe.*;

@RestController
@CrossOrigin
@RequestMapping("/api/recipes")
public class RecipeController {

    private final CreateRecipeUseCase createRecipeUseCase;
    private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;
    private final UpdateRecipeUseCase updateRecipeUseCase;
    private final DeleteRecipeUseCase deleteRecipeUseCase;
    private final AddComponentUseCase addComponentUseCase;
    private final ReplaceComponentUseCase replaceComponentUseCase;
    private final DeleteComponentUseCase deleteComponentUseCase;

    public RecipeController(
        CreateRecipeUseCase createRecipeUseCase,
        FindRecipeBySlugUseCase findRecipeBySlugUseCase,
        UpdateRecipeUseCase updateRecipeUseCase,
        DeleteRecipeUseCase deleteRecipeUseCase,
        AddComponentUseCase addComponentUseCase,
        ReplaceComponentUseCase replaceComponentUseCase,
        DeleteComponentUseCase deleteComponentUseCase
    ) {
        this.createRecipeUseCase = createRecipeUseCase;
        this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
        this.updateRecipeUseCase = updateRecipeUseCase;
        this.deleteRecipeUseCase = deleteRecipeUseCase;
        this.addComponentUseCase = addComponentUseCase;
        this.replaceComponentUseCase = replaceComponentUseCase;
        this.deleteComponentUseCase = deleteComponentUseCase;
    }

    @PostMapping
    public ResponseEntity<RecipeResource> create(
        @RequestBody CreateRecipeRequest request
    ) {
        var recipe = createRecipeUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(recipe);
    }

    @GetMapping("{slug}")
    public ResponseEntity<RecipeResource> findBySlug(
        @PathVariable String slug
    ) {
        return ResponseEntity.of(findRecipeBySlugUseCase.execute(slug));
    }

    @GetMapping("{slug}/components")
    public ResponseEntity<List<ComponentResource>> findComponents(
        @PathVariable String slug
    ) {
        return findRecipeBySlugUseCase
            .execute(slug)
            .map(r -> ResponseEntity.ok(r.components()))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{slug}")
    public ResponseEntity<RecipeResource> update(
        @PathVariable String slug,
        @RequestBody UpdateRecipeRequest request
    ) {
        return ResponseEntity.of(updateRecipeUseCase.execute(slug, request));
    }

    @DeleteMapping("{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        return deleteRecipeUseCase.execute(slug)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }

    @PostMapping("{slug}/components")
    public ResponseEntity<ComponentResource> addComponent(
        @PathVariable String slug,
        @RequestBody AddComponentRequest request
    ) {
        return addComponentUseCase
            .execute(slug, request)
            .map(c ->
                ResponseEntity.status(HttpStatus.CREATED).<
                    ComponentResource
                >body(c)
            )
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{slug}/components/{componentSlug}")
    public ResponseEntity<Void> replaceComponent(
        @PathVariable String slug,
        @PathVariable String componentSlug,
        @RequestBody ReplaceComponentRequest request
    ) {
        return replaceComponentUseCase.execute(slug, componentSlug, request)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }

    @DeleteMapping("{slug}/components/{componentSlug}")
    public ResponseEntity<Void> deleteComponent(
        @PathVariable String slug,
        @PathVariable String componentSlug
    ) {
        return deleteComponentUseCase.execute(slug, componentSlug)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }
}
