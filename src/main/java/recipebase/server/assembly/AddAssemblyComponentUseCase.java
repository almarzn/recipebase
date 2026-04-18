package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AddAssemblyComponentRequest;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import recipebase.server.recipe.SlugUtil;

import java.util.Optional;
import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class AddAssemblyComponentUseCase {

    private final DSLContext dsl;

    public AddAssemblyComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<AssemblyComponentResource> execute(String assemblySlug, AddAssemblyComponentRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            var assemblyId = c.select(ASSEMBLY.ID)
                .from(ASSEMBLY)
                .join(ITEM).on(ITEM.ID.eq(ASSEMBLY.ITEM_ID))
                .where(ITEM.SLUG.eq(assemblySlug).and(ITEM.TYPE.eq("assembly")))
                .fetchOptional(ASSEMBLY.ID);

            if (assemblyId.isEmpty()) return Optional.empty();

            var refItem = c.select(ITEM.ID, ITEM.SLUG, ITEM.NAME, ITEM.TYPE)
                .from(ITEM)
                .where(ITEM.SLUG.eq(request.itemSlug()))
                .fetchOptional();

            if (refItem.isEmpty()) return Optional.empty();

            int maxOrder = c.select(ASSEMBLY_COMPONENT.COMP_ORDER.max())
                .from(ASSEMBLY_COMPONENT)
                .where(ASSEMBLY_COMPONENT.ASSEMBLY_ID.eq(assemblyId.get()))
                .fetchOne(0, int.class);
            int compOrder = maxOrder + 1;

            var compId = UUID.randomUUID();
            String compSlug = SlugUtil.slugify(refItem.get().get(ITEM.NAME));

            c.insertInto(ASSEMBLY_COMPONENT)
                .set(ASSEMBLY_COMPONENT.ID, compId)
                .set(ASSEMBLY_COMPONENT.ASSEMBLY_ID, assemblyId.get())
                .set(ASSEMBLY_COMPONENT.SLUG, compSlug)
                .set(ASSEMBLY_COMPONENT.COMP_ORDER, compOrder)
                .set(ASSEMBLY_COMPONENT.ITEM_ID, refItem.get().get(ITEM.ID))
                .set(ASSEMBLY_COMPONENT.SCALE_FACTOR, request.scaleFactor())
                .set(ASSEMBLY_COMPONENT.LOCKED, false)
                .execute();

            return Optional.of(new AssemblyComponentResource(
                compId,
                compSlug,
                compOrder,
                refItem.get().get(ITEM.ID),
                refItem.get().get(ITEM.SLUG),
                refItem.get().get(ITEM.NAME),
                refItem.get().get(ITEM.TYPE),
                request.scaleFactor(),
                false,
                null
            ));
        });
    }
}
