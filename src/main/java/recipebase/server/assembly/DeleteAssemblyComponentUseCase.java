package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static recipebase.data.Tables.*;

@Repository
public class DeleteAssemblyComponentUseCase {

    private final DSLContext dsl;

    public DeleteAssemblyComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public boolean execute(String assemblySlug, String componentSlug) {
        int deleted = dsl.deleteFrom(ASSEMBLY_COMPONENT)
            .using(ASSEMBLY, ITEM)
            .where(ASSEMBLY_COMPONENT.ASSEMBLY_ID.eq(ASSEMBLY.ID)
                .and(ASSEMBLY.ITEM_ID.eq(ITEM.ID))
                .and(ITEM.SLUG.eq(assemblySlug))
                .and(ITEM.TYPE.eq("assembly"))
                .and(ASSEMBLY_COMPONENT.SLUG.eq(componentSlug)))
            .execute();
        return deleted > 0;
    }
}
