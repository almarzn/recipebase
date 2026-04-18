package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static recipebase.data.Tables.*;

@Repository
public class DeleteComponentUseCase {

    private final DSLContext dsl;

    public DeleteComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public boolean execute(String recipeSlug, String componentSlug) {
        int deleted = dsl.deleteFrom(RECIPE_COMPONENT)
            .using(RECIPE, ITEM)
            .where(RECIPE_COMPONENT.RECIPE_ID.eq(RECIPE.ID)
                .and(RECIPE.ITEM_ID.eq(ITEM.ID))
                .and(ITEM.SLUG.eq(recipeSlug))
                .and(ITEM.TYPE.eq("recipe"))
                .and(RECIPE_COMPONENT.SLUG.eq(componentSlug)))
            .execute();
        return deleted > 0;
    }
}
