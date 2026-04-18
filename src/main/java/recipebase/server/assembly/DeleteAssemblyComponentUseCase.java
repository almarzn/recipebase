package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class DeleteAssemblyComponentUseCase {
    public DeleteAssemblyComponentUseCase(DSLContext dsl) {}
    public boolean execute(String assemblySlug, String componentSlug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
