package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import recipebase.server.assembly.resource.CreateAssemblyRequest;
import recipebase.server.recipe.SlugUtil;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class CreateAssemblyUseCase {

    private final DSLContext dsl;

    public CreateAssemblyUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public AssemblyResource execute(CreateAssemblyRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();
            var now = OffsetDateTime.now();
            var itemId = UUID.randomUUID();
            var assemblyId = UUID.randomUUID();
            var slug = SlugUtil.slugify(request.name());

            c.insertInto(ITEM)
                .set(ITEM.ID, itemId)
                .set(ITEM.SLUG, slug)
                .set(ITEM.TYPE, "assembly")
                .set(ITEM.NAME, request.name())
                .set(ITEM.TAGS, request.tags() != null
                    ? request.tags().toArray(String[]::new)
                    : new String[0])
                .set(ITEM.CREATED_AT, now)
                .set(ITEM.UPDATED_AT, now)
                .execute();

            c.insertInto(ASSEMBLY)
                .set(ASSEMBLY.ID, assemblyId)
                .set(ASSEMBLY.ITEM_ID, itemId)
                .set(ASSEMBLY.YIELD, request.yield())
                .execute();

            return new AssemblyResource(
                itemId, slug, request.name(),
                request.tags() != null ? request.tags() : List.of(),
                request.yield(),
                now, now,
                List.of()
            );
        });
    }
}
