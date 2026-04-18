package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import recipebase.server.assembly.resource.UpdateAssemblyRequest;

import java.time.OffsetDateTime;
import java.util.Optional;

import static recipebase.data.Tables.*;

@Repository
public class UpdateAssemblyUseCase {

    private final DSLContext dsl;
    private final FindAssemblyBySlugUseCase findAssemblyBySlugUseCase;

    public UpdateAssemblyUseCase(DSLContext dsl, FindAssemblyBySlugUseCase findAssemblyBySlugUseCase) {
        this.dsl = dsl;
        this.findAssemblyBySlugUseCase = findAssemblyBySlugUseCase;
    }

    public Optional<AssemblyResource> execute(String slug, UpdateAssemblyRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            int itemUpdated = c.update(ITEM)
                .set(ITEM.NAME, request.name())
                .set(ITEM.TAGS, request.tags() != null
                    ? request.tags().toArray(String[]::new)
                    : new String[0])
                .set(ITEM.UPDATED_AT, OffsetDateTime.now())
                .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("assembly")))
                .execute();

            if (itemUpdated == 0) return Optional.empty();

            c.update(ASSEMBLY)
                .set(ASSEMBLY.YIELD, request.yield())
                .from(ITEM)
                .where(ASSEMBLY.ITEM_ID.eq(ITEM.ID).and(ITEM.SLUG.eq(slug)))
                .execute();

            return findAssemblyBySlugUseCase.execute(slug);
        });
    }
}
