package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.CreateRecipeRequest;
import recipebase.server.recipe.resource.RecipeResource;

@Repository
public class CreateRecipeUseCase {
    public CreateRecipeUseCase(DSLContext dsl) {}
    public RecipeResource execute(CreateRecipeRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
