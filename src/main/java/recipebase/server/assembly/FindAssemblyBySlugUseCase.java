package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.JSONB;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import recipebase.server.assembly.resource.AssemblyResource;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;
import static recipebase.data.Tables.*;

@Repository
public class FindAssemblyBySlugUseCase {

    private final DSLContext dsl;

    public FindAssemblyBySlugUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<AssemblyResource> execute(String slug) {
        var compsField = componentsField();

        return Optional.ofNullable(
            dsl.select(
                ITEM.ID, ITEM.SLUG, ITEM.NAME, ITEM.TAGS, ITEM.CREATED_AT, ITEM.UPDATED_AT,
                ASSEMBLY.YIELD,
                compsField
            )
            .from(ITEM)
            .join(ASSEMBLY).on(ASSEMBLY.ITEM_ID.eq(ITEM.ID))
            .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("assembly")))
            .fetchOne(r -> new AssemblyResource(
                r.get(ITEM.ID),
                r.get(ITEM.SLUG),
                r.get(ITEM.NAME),
                Arrays.asList(r.get(ITEM.TAGS)),
                r.get(ASSEMBLY.YIELD),
                r.get(ITEM.CREATED_AT),
                r.get(ITEM.UPDATED_AT),
                r.get(compsField)
            ))
        );
    }

    private Field<List<AssemblyComponentResource>> componentsField() {
        var refItem = ITEM.as("ref_item");
        var refSlug = refItem.SLUG.as("ref_slug");
        var refName = refItem.NAME.as("ref_name");
        var refType = refItem.TYPE.as("ref_type");

        return multiset(
            select(
                ASSEMBLY_COMPONENT.ID, ASSEMBLY_COMPONENT.SLUG, ASSEMBLY_COMPONENT.COMP_ORDER,
                ASSEMBLY_COMPONENT.ITEM_ID, ASSEMBLY_COMPONENT.SCALE_FACTOR,
                ASSEMBLY_COMPONENT.LOCKED, ASSEMBLY_COMPONENT.LOCK_SNAPSHOT,
                refSlug, refName, refType
            )
            .from(ASSEMBLY_COMPONENT)
            .join(refItem).on(refItem.ID.eq(ASSEMBLY_COMPONENT.ITEM_ID))
            .where(ASSEMBLY_COMPONENT.ASSEMBLY_ID.eq(ASSEMBLY.ID))
            .orderBy(ASSEMBLY_COMPONENT.COMP_ORDER)
        ).convertFrom(result -> result.map(row -> new AssemblyComponentResource(
            row.get(ASSEMBLY_COMPONENT.ID),
            row.get(ASSEMBLY_COMPONENT.SLUG),
            row.get(ASSEMBLY_COMPONENT.COMP_ORDER),
            row.get(ASSEMBLY_COMPONENT.ITEM_ID),
            row.get(refSlug),
            row.get(refName),
            row.get(refType),
            row.get(ASSEMBLY_COMPONENT.SCALE_FACTOR),
            row.get(ASSEMBLY_COMPONENT.LOCKED),
            toJsonString(row.get(ASSEMBLY_COMPONENT.LOCK_SNAPSHOT))
        )));
    }

    private static String toJsonString(JSONB jsonb) {
        return jsonb == null ? null : jsonb.data();
    }
}
