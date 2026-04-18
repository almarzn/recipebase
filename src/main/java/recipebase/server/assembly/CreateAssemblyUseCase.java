package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import recipebase.server.assembly.resource.CreateAssemblyRequest;

@Repository
public class CreateAssemblyUseCase {
    public CreateAssemblyUseCase(DSLContext dsl) {}
    public AssemblyResource execute(CreateAssemblyRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
