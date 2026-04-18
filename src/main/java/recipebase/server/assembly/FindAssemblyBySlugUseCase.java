package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import java.util.Optional;

@Repository
public class FindAssemblyBySlugUseCase {
    public FindAssemblyBySlugUseCase(DSLContext dsl) {}
    public Optional<AssemblyResource> execute(String slug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
