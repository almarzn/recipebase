package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.ReplaceComponentRequest;
import java.util.Optional;

@Repository
public class ReplaceComponentUseCase {
    public ReplaceComponentUseCase(DSLContext dsl) {}
    /** Returns empty if recipe or component not found. */
    public Optional<Void> execute(String recipeSlug, String componentSlug, ReplaceComponentRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
