package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.UpdateRecipeRequest;

import java.time.OffsetDateTime;
import java.util.Optional;

import static recipebase.data.Tables.*;

@Repository
public class UpdateRecipeUseCase {

    private final DSLContext dsl;
    private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;

    public UpdateRecipeUseCase(DSLContext dsl, FindRecipeBySlugUseCase findRecipeBySlugUseCase) {
        this.dsl = dsl;
        this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
    }

    public Optional<RecipeResource> execute(String slug, UpdateRecipeRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            int itemUpdated = c.update(ITEM)
                .set(ITEM.NAME, request.name())
                .set(ITEM.TAGS, request.tags() != null
                    ? request.tags().toArray(String[]::new)
                    : new String[0])
                .set(ITEM.UPDATED_AT, OffsetDateTime.now())
                .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("recipe")))
                .execute();

            if (itemUpdated == 0) return Optional.empty();

            c.update(RECIPE)
                .set(RECIPE.SOURCE, request.source())
                .set(RECIPE.YIELD, request.yield())
                .set(RECIPE.NOTES, request.notes())
                .from(ITEM)
                .where(RECIPE.ITEM_ID.eq(ITEM.ID).and(ITEM.SLUG.eq(slug)))
                .execute();

            return findRecipeBySlugUseCase.execute(slug);
        });
    }
}
