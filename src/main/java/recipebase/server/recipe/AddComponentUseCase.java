package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.AddComponentRequest;
import recipebase.server.recipe.resource.ComponentResource;
import java.util.Optional;

@Repository
public class AddComponentUseCase {
    public AddComponentUseCase(DSLContext dsl) {}
    public Optional<ComponentResource> execute(String recipeSlug, AddComponentRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
