package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.AddComponentRequest;
import recipebase.server.recipe.resource.ReplaceComponentRequest;

import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class ReplaceComponentUseCase {

    private final DSLContext dsl;

    public ReplaceComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public boolean execute(String recipeSlug, String componentSlug, ReplaceComponentRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            var compId = c.select(RECIPE_COMPONENT.ID)
                .from(RECIPE_COMPONENT)
                .join(RECIPE).on(RECIPE.ID.eq(RECIPE_COMPONENT.RECIPE_ID))
                .join(ITEM).on(ITEM.ID.eq(RECIPE.ITEM_ID))
                .where(ITEM.SLUG.eq(recipeSlug)
                    .and(ITEM.TYPE.eq("recipe"))
                    .and(RECIPE_COMPONENT.SLUG.eq(componentSlug)))
                .fetchOptional(RECIPE_COMPONENT.ID);

            if (compId.isEmpty()) return false;

            c.update(RECIPE_COMPONENT)
                .set(RECIPE_COMPONENT.NAME, request.name())
                .where(RECIPE_COMPONENT.ID.eq(compId.get()))
                .execute();

            c.deleteFrom(RECIPE_INGREDIENT)
                .where(RECIPE_INGREDIENT.COMPONENT_ID.eq(compId.get()))
                .execute();
            c.deleteFrom(RECIPE_STEP)
                .where(RECIPE_STEP.COMPONENT_ID.eq(compId.get()))
                .execute();

            var ingRequests = request.ingredients().stream()
                .map(i -> new AddComponentRequest.IngredientRequest(i.slug(), i.name(), i.quantity(), i.notes()))
                .toList();
            var stepRequests = request.steps().stream()
                .map(s -> new AddComponentRequest.StepRequest(s.body(), s.timer()))
                .toList();

            AddComponentUseCase.insertIngredients(c, compId.get(), ingRequests);
            AddComponentUseCase.insertSteps(c, compId.get(), stepRequests);

            return true;
        });
    }
}
