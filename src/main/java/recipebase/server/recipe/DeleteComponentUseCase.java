package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class DeleteComponentUseCase {
    public DeleteComponentUseCase(DSLContext dsl) {}
    public boolean execute(String recipeSlug, String componentSlug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
