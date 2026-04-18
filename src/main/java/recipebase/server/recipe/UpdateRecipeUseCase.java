package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.UpdateRecipeRequest;
import java.util.Optional;

@Repository
public class UpdateRecipeUseCase {
    public UpdateRecipeUseCase(DSLContext dsl) {}
    public Optional<RecipeResource> execute(String slug, UpdateRecipeRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
