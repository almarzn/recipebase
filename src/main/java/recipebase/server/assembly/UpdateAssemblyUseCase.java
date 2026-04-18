package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import recipebase.server.assembly.resource.UpdateAssemblyRequest;
import java.util.Optional;

@Repository
public class UpdateAssemblyUseCase {
    public UpdateAssemblyUseCase(DSLContext dsl) {}
    public Optional<AssemblyResource> execute(String slug, UpdateAssemblyRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
