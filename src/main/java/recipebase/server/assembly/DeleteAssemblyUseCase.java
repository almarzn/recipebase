package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class DeleteAssemblyUseCase {
    public DeleteAssemblyUseCase(DSLContext dsl) {}
    public boolean execute(String slug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
