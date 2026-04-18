package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import recipebase.server.assembly.resource.UpdateAssemblyComponentRequest;
import java.util.Optional;

@Repository
public class UpdateAssemblyComponentUseCase {
    public UpdateAssemblyComponentUseCase(DSLContext dsl) {}
    public Optional<AssemblyComponentResource> execute(
            String assemblySlug, String componentSlug, UpdateAssemblyComponentRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
