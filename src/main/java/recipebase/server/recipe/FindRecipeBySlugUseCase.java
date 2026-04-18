package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.RecipeResource;
import java.util.Optional;

@Repository
public class FindRecipeBySlugUseCase {
    public FindRecipeBySlugUseCase(DSLContext dsl) {}
    public Optional<RecipeResource> execute(String slug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
