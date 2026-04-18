package recipebase.server.item;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Repository;
import recipebase.server.item.resource.ItemSummaryResource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static recipebase.data.Tables.ITEM;

@Repository
public class FindItemsUseCase {

    private final DSLContext dsl;

    public FindItemsUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public List<ItemSummaryResource> execute(
            @Nullable String q,
            @Nullable String type,
            @Nullable List<String> tags) {

        var conditions = new ArrayList<Condition>();
        if (q != null && !q.isBlank()) {
            conditions.add(ITEM.NAME.containsIgnoreCase(q));
        }
        if (type != null && !type.isBlank()) {
            conditions.add(ITEM.TYPE.eq(type));
        }
        if (tags != null && !tags.isEmpty()) {
            conditions.add(DSL.condition("item.tags @> ?::text[]",
                (Object) tags.toArray(String[]::new)));
        }

        return dsl.select(ITEM.ID, ITEM.SLUG, ITEM.TYPE, ITEM.NAME, ITEM.TAGS)
            .from(ITEM)
            .where(conditions)
            .orderBy(ITEM.CREATED_AT.desc())
            .fetch(r -> new ItemSummaryResource(
                r.get(ITEM.ID),
                r.get(ITEM.SLUG),
                r.get(ITEM.TYPE),
                r.get(ITEM.NAME),
                Arrays.asList(r.get(ITEM.TAGS))
            ));
    }
}
