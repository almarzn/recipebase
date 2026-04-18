package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static recipebase.data.Tables.ITEM;

@Repository
public class DeleteAssemblyUseCase {

    private final DSLContext dsl;

    public DeleteAssemblyUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public boolean execute(String slug) {
        int deleted = dsl.deleteFrom(ITEM)
            .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("assembly")))
            .execute();
        return deleted > 0;
    }
}
