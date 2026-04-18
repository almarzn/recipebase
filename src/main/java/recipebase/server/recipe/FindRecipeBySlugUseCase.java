package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.ComponentResource;
import recipebase.server.recipe.resource.IngredientResource;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.StepResource;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;
import static recipebase.data.Tables.*;

@Repository
public class FindRecipeBySlugUseCase {

    private final DSLContext dsl;

    public FindRecipeBySlugUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<RecipeResource> execute(String slug) {
        var compsField = componentsField();

        return Optional.ofNullable(
            dsl.select(
                ITEM.ID, ITEM.SLUG, ITEM.NAME, ITEM.TAGS, ITEM.CREATED_AT, ITEM.UPDATED_AT,
                RECIPE.SOURCE, RECIPE.YIELD, RECIPE.NOTES,
                compsField
            )
            .from(ITEM)
            .join(RECIPE).on(RECIPE.ITEM_ID.eq(ITEM.ID))
            .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("recipe")))
            .fetchOne(r -> new RecipeResource(
                r.get(ITEM.ID),
                r.get(ITEM.SLUG),
                r.get(ITEM.NAME),
                Arrays.asList(r.get(ITEM.TAGS)),
                r.get(RECIPE.SOURCE),
                r.get(RECIPE.YIELD),
                r.get(RECIPE.NOTES),
                r.get(ITEM.CREATED_AT),
                r.get(ITEM.UPDATED_AT),
                r.get(compsField)
            ))
        );
    }

    private Field<List<ComponentResource>> componentsField() {
        var ingField = ingredientsField();
        var stepField = stepsField();

        return multiset(
            select(
                RECIPE_COMPONENT.ID, RECIPE_COMPONENT.SLUG, RECIPE_COMPONENT.NAME,
                RECIPE_COMPONENT.POSITION, ingField, stepField
            )
            .from(RECIPE_COMPONENT)
            .where(RECIPE_COMPONENT.RECIPE_ID.eq(RECIPE.ID))
            .orderBy(RECIPE_COMPONENT.POSITION)
        ).convertFrom(result -> result.map(row -> new ComponentResource(
            row.get(RECIPE_COMPONENT.ID),
            row.get(RECIPE_COMPONENT.SLUG),
            row.get(RECIPE_COMPONENT.NAME),
            row.get(RECIPE_COMPONENT.POSITION),
            row.get(ingField),
            row.get(stepField)
        )));
    }

    private Field<List<IngredientResource>> ingredientsField() {
        return multiset(
            select(
                RECIPE_INGREDIENT.ID, RECIPE_INGREDIENT.SLUG, RECIPE_INGREDIENT.NAME,
                RECIPE_INGREDIENT.QUANTITY, RECIPE_INGREDIENT.NOTES, RECIPE_INGREDIENT.POSITION
            )
            .from(RECIPE_INGREDIENT)
            .where(RECIPE_INGREDIENT.COMPONENT_ID.eq(RECIPE_COMPONENT.ID))
            .orderBy(RECIPE_INGREDIENT.POSITION)
        ).convertFrom(result -> result.map(row -> new IngredientResource(
            row.get(RECIPE_INGREDIENT.ID),
            row.get(RECIPE_INGREDIENT.SLUG),
            row.get(RECIPE_INGREDIENT.NAME),
            row.get(RECIPE_INGREDIENT.QUANTITY),
            row.get(RECIPE_INGREDIENT.NOTES),
            row.get(RECIPE_INGREDIENT.POSITION)
        )));
    }

    private Field<List<StepResource>> stepsField() {
        return multiset(
            select(
                RECIPE_STEP.ID, RECIPE_STEP.SLUG, RECIPE_STEP.STEP_ORDER,
                RECIPE_STEP.BODY, RECIPE_STEP.TIMER_SECONDS
            )
            .from(RECIPE_STEP)
            .where(RECIPE_STEP.COMPONENT_ID.eq(RECIPE_COMPONENT.ID))
            .orderBy(RECIPE_STEP.STEP_ORDER)
        ).convertFrom(result -> result.map(row -> new StepResource(
            row.get(RECIPE_STEP.ID),
            row.get(RECIPE_STEP.SLUG),
            row.get(RECIPE_STEP.STEP_ORDER),
            row.get(RECIPE_STEP.BODY),
            row.get(RECIPE_STEP.TIMER_SECONDS)
        )));
    }
}
