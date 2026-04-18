package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.AddComponentRequest;
import recipebase.server.recipe.resource.ComponentResource;
import recipebase.server.recipe.resource.IngredientResource;
import recipebase.server.recipe.resource.StepResource;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.jooq.impl.DSL.max;
import static recipebase.data.Tables.*;

@Repository
public class AddComponentUseCase {

    private final DSLContext dsl;

    public AddComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<ComponentResource> execute(String recipeSlug, AddComponentRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            var recipeId = c.select(RECIPE.ID)
                .from(RECIPE)
                .join(ITEM).on(ITEM.ID.eq(RECIPE.ITEM_ID))
                .where(ITEM.SLUG.eq(recipeSlug).and(ITEM.TYPE.eq("recipe")))
                .fetchOptional(RECIPE.ID);

            if (recipeId.isEmpty()) return Optional.empty();

            Integer maxPos = c.select(max(RECIPE_COMPONENT.POSITION))
                .from(RECIPE_COMPONENT)
                .where(RECIPE_COMPONENT.RECIPE_ID.eq(recipeId.get()))
                .fetchOne(0, Integer.class);
            int position = (maxPos != null ? maxPos : 0) + 1;

            var compId = UUID.randomUUID();
            String compSlug = request.name() != null
                ? SlugUtil.slugify(request.name())
                : "component-" + position;

            c.insertInto(RECIPE_COMPONENT)
                .set(RECIPE_COMPONENT.ID, compId)
                .set(RECIPE_COMPONENT.RECIPE_ID, recipeId.get())
                .set(RECIPE_COMPONENT.SLUG, compSlug)
                .set(RECIPE_COMPONENT.NAME, request.name())
                .set(RECIPE_COMPONENT.POSITION, position)
                .execute();

            var ingredients = insertIngredients(c, compId, request.ingredients());
            var steps = insertSteps(c, compId, request.steps());

            return Optional.of(new ComponentResource(compId, compSlug, request.name(), position, ingredients, steps));
        });
    }

    static List<IngredientResource> insertIngredients(
            DSLContext c, UUID compId, List<AddComponentRequest.IngredientRequest> ingredients) {
        var pos = new AtomicInteger(1);
        return ingredients.stream().map(ing -> {
            var id = UUID.randomUUID();
            int p = pos.getAndIncrement();
            c.insertInto(RECIPE_INGREDIENT)
                .set(RECIPE_INGREDIENT.ID, id)
                .set(RECIPE_INGREDIENT.COMPONENT_ID, compId)
                .set(RECIPE_INGREDIENT.SLUG, ing.slug())
                .set(RECIPE_INGREDIENT.NAME, ing.name())
                .set(RECIPE_INGREDIENT.QUANTITY, ing.quantity())
                .set(RECIPE_INGREDIENT.NOTES, ing.notes())
                .set(RECIPE_INGREDIENT.POSITION, p)
                .execute();
            return new IngredientResource(id, ing.slug(), ing.name(), ing.quantity(), ing.notes(), p);
        }).toList();
    }

    static List<StepResource> insertSteps(
            DSLContext c, UUID compId, List<AddComponentRequest.StepRequest> steps) {
        var order = new AtomicInteger(1);
        return steps.stream().map(step -> {
            var id = UUID.randomUUID();
            int o = order.getAndIncrement();
            String slug = SlugUtil.slugify(step.body().substring(0, Math.min(step.body().length(), 40)));
            c.insertInto(RECIPE_STEP)
                .set(RECIPE_STEP.ID, id)
                .set(RECIPE_STEP.COMPONENT_ID, compId)
                .set(RECIPE_STEP.SLUG, slug)
                .set(RECIPE_STEP.STEP_ORDER, o)
                .set(RECIPE_STEP.BODY, step.body())
                .set(RECIPE_STEP.TIMER_SECONDS, step.timerSeconds())
                .execute();
            return new StepResource(id, slug, o, step.body(), step.timerSeconds());
        }).toList();
    }
}
