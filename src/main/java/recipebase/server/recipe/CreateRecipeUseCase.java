package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.ComponentResource;
import recipebase.server.recipe.resource.CreateRecipeRequest;
import recipebase.server.recipe.resource.RecipeResource;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class CreateRecipeUseCase {

    private final DSLContext dsl;

    public CreateRecipeUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public RecipeResource execute(CreateRecipeRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();
            var now = OffsetDateTime.now();
            var itemId = UUID.randomUUID();
            var recipeId = UUID.randomUUID();
            var slug = SlugUtil.slugify(request.name());

            c.insertInto(ITEM)
                .set(ITEM.ID, itemId)
                .set(ITEM.SLUG, slug)
                .set(ITEM.TYPE, "recipe")
                .set(ITEM.NAME, request.name())
                .set(ITEM.TAGS, request.tags() != null
                    ? request.tags().toArray(String[]::new)
                    : new String[0])
                .set(ITEM.CREATED_AT, now)
                .set(ITEM.UPDATED_AT, now)
                .execute();

            c.insertInto(RECIPE)
                .set(RECIPE.ID, recipeId)
                .set(RECIPE.ITEM_ID, itemId)
                .set(RECIPE.SOURCE, request.source())
                .set(RECIPE.YIELD, request.yield())
                .set(RECIPE.NOTES, request.notes())
                .execute();

            return new RecipeResource(
                itemId, slug, request.name(),
                request.tags() != null ? request.tags() : List.of(),
                request.source(), request.yield(), request.notes(),
                now, now,
                List.of()
            );
        });
    }
}
