package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AddAssemblyComponentRequest;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import java.util.Optional;

@Repository
public class AddAssemblyComponentUseCase {
    public AddAssemblyComponentUseCase(DSLContext dsl) {}
    public Optional<AssemblyComponentResource> execute(String assemblySlug, AddAssemblyComponentRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
