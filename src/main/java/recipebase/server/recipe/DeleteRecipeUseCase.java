package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class DeleteRecipeUseCase {
    public DeleteRecipeUseCase(DSLContext dsl) {}
    public boolean execute(String slug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
