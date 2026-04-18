package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.jooq.JSONB;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import recipebase.server.assembly.resource.UpdateAssemblyComponentRequest;

import java.util.Optional;

import static recipebase.data.Tables.*;

@Repository
public class UpdateAssemblyComponentUseCase {

    private final DSLContext dsl;

    public UpdateAssemblyComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<AssemblyComponentResource> execute(
            String assemblySlug, String componentSlug, UpdateAssemblyComponentRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            var comp = c.select(
                    ASSEMBLY_COMPONENT.ID, ASSEMBLY_COMPONENT.COMP_ORDER,
                    ASSEMBLY_COMPONENT.ITEM_ID)
                .from(ASSEMBLY_COMPONENT)
                .join(ASSEMBLY).on(ASSEMBLY.ID.eq(ASSEMBLY_COMPONENT.ASSEMBLY_ID))
                .join(ITEM).on(ITEM.ID.eq(ASSEMBLY.ITEM_ID))
                .where(ITEM.SLUG.eq(assemblySlug)
                    .and(ITEM.TYPE.eq("assembly"))
                    .and(ASSEMBLY_COMPONENT.SLUG.eq(componentSlug)))
                .fetchOptional();

            if (comp.isEmpty()) return Optional.empty();

            var refItem = c.select(ITEM.SLUG, ITEM.NAME, ITEM.TYPE)
                .from(ITEM)
                .where(ITEM.ID.eq(comp.get().get(ASSEMBLY_COMPONENT.ITEM_ID)))
                .fetchOne();

            boolean nowLocked = request.locked();
            JSONB snapshot = null;

            if (nowLocked) {
                String json = "{\"id\":\"" + comp.get().get(ASSEMBLY_COMPONENT.ITEM_ID)
                    + "\",\"slug\":\"" + refItem.get(ITEM.SLUG)
                    + "\",\"name\":\"" + refItem.get(ITEM.NAME)
                    + "\",\"type\":\"" + refItem.get(ITEM.TYPE) + "\"}";
                snapshot = JSONB.valueOf(json);
            }

            c.update(ASSEMBLY_COMPONENT)
                .set(ASSEMBLY_COMPONENT.SCALE_FACTOR, request.scaleFactor())
                .set(ASSEMBLY_COMPONENT.LOCKED, nowLocked)
                .set(ASSEMBLY_COMPONENT.LOCK_SNAPSHOT, snapshot)
                .where(ASSEMBLY_COMPONENT.ID.eq(comp.get().get(ASSEMBLY_COMPONENT.ID)))
                .execute();

            return Optional.of(new AssemblyComponentResource(
                comp.get().get(ASSEMBLY_COMPONENT.ID),
                componentSlug,
                comp.get().get(ASSEMBLY_COMPONENT.COMP_ORDER),
                comp.get().get(ASSEMBLY_COMPONENT.ITEM_ID),
                refItem.get(ITEM.SLUG),
                refItem.get(ITEM.NAME),
                refItem.get(ITEM.TYPE),
                request.scaleFactor(),
                nowLocked,
                snapshot != null ? snapshot.data() : null
            ));
        });
    }
}
