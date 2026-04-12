package recipebase.server.recipe;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.model.Link;
import recipebase.server.recipe.model.Quantity;
import recipebase.server.recipe.model.TimerAttachment;
import recipebase.server.recipe.resource.AddVariantRequest;
import recipebase.server.recipe.resource.AddVariantRequest.ComponentRequest;
import recipebase.server.recipe.resource.AddVariantRequest.IngredientRequest;
import recipebase.server.recipe.resource.AddVariantRequest.StepRequest;
import recipebase.server.recipe.resource.AddVariantResponse;
import recipebase.server.recipe.resource.RecipeResource;

import java.time.OffsetDateTime;

import static recipebase.data.Tables.*;

@Repository
public class AddVariantUseCase {

	private final DSLContext dsl;

	public AddVariantUseCase(DSLContext dsl) {
		this.dsl = dsl;
	}

	/**
	 * Returns empty if the recipe is not found.
	 * Throws DuplicateKeyException (unchecked) if the variant slug already exists —
	 * the controller maps this to 409.
	 */
	public java.util.Optional<AddVariantResponse> execute(String recipeSlug, AddVariantRequest request) {
		return dsl.transactionResult(cfg -> {
			var c = cfg.dsl();

			var recipeId = c.select(RECIPE.ID)
				.from(RECIPE)
				.where(RECIPE.SLUG.eq(recipeSlug))
				.fetchOptional(RECIPE.ID);

			if (recipeId.isEmpty()) return java.util.Optional.empty();

			var variantId = UUID.randomUUID();
			var now = OffsetDateTime.now();

			c.insertInto(RECIPE_VARIANT)
				.set(RECIPE_VARIANT.ID, variantId)
				.set(RECIPE_VARIANT.RECIPE_ID, recipeId.get())
				.set(RECIPE_VARIANT.SLUG, request.slug())
				.set(RECIPE_VARIANT.NAME, request.name())
				.set(RECIPE_VARIANT.DESCRIPTION, request.description())
				.set(RECIPE_VARIANT.CREATED_AT, now)
				.set(RECIPE_VARIANT.UPDATED_AT, now)
				.execute();

			insertComponents(c, variantId, request.components());

			return java.util.Optional.of(new AddVariantResponse(variantId, request.slug()));
		});
	}

	static void insertComponents(DSLContext c, UUID variantId, List<ComponentRequest> components) {
		var position = new AtomicInteger(1);
		for (var comp : components) {
			var compId = UUID.randomUUID();
			c.insertInto(RECIPE_COMPONENT)
				.set(RECIPE_COMPONENT.ID, compId)
				.set(RECIPE_COMPONENT.VARIANT_ID, variantId)
				.set(RECIPE_COMPONENT.POSITION, position.getAndIncrement())
				.set(RECIPE_COMPONENT.TITLE, comp.title())
				.set(RECIPE_COMPONENT.DESCRIPTION, comp.description())
				.set(RECIPE_COMPONENT.LINK, new Link.Self())
				.execute();

			insertIngredients(c, compId, comp.ingredients());
			insertSteps(c, compId, comp.steps());
		}
	}

	private static void insertIngredients(DSLContext c, UUID compId, List<IngredientRequest> ingredients) {
		var pos = new AtomicInteger(1);
		for (var ing : ingredients) {
			c.insertInto(RECIPE_INGREDIENT)
				.set(RECIPE_INGREDIENT.ID, UUID.randomUUID())
				.set(RECIPE_INGREDIENT.COMPONENT_ID, compId)
				.set(RECIPE_INGREDIENT.POSITION, pos.getAndIncrement())
				.set(RECIPE_INGREDIENT.SLUG, ing.slug())
				.set(RECIPE_INGREDIENT.NAME, ing.name())
				.set(RECIPE_INGREDIENT.NOTES, ing.notes())
				.set(RECIPE_INGREDIENT.QUANTITY, toModelQuantity(ing.quantity()))
				.execute();
		}
	}

	private static void insertSteps(DSLContext c, UUID compId, List<StepRequest> steps) {
		var pos = new AtomicInteger(1);
		for (var step : steps) {
			c.insertInto(RECIPE_STEP)
				.set(RECIPE_STEP.ID, UUID.randomUUID())
				.set(RECIPE_STEP.COMPONENT_ID, compId)
				.set(RECIPE_STEP.POSITION, pos.getAndIncrement())
				.set(RECIPE_STEP.TEXT, step.text())
				.set(RECIPE_STEP.NOTES, step.notes())
				.set(RECIPE_STEP.ATTACHMENT, toModelAttachment(step.attachment()))
				.execute();
		}
	}

	private static Quantity toModelQuantity(RecipeResource.Ingredient.Quantity q) {
		return switch (q) {
			case RecipeResource.Ingredient.Quantity.DecimalAmount.Gram g ->
				new Quantity.DecimalAmount.Gram(g.amount());
			case RecipeResource.Ingredient.Quantity.DecimalAmount.Kilogram k ->
				new Quantity.DecimalAmount.Kilogram(k.amount());
			case RecipeResource.Ingredient.Quantity.DecimalAmount.Liter l ->
				new Quantity.DecimalAmount.Liter(l.amount());
			case RecipeResource.Ingredient.Quantity.DecimalAmount.Milliliter m ->
				new Quantity.DecimalAmount.Milliliter(m.amount());
			case RecipeResource.Ingredient.Quantity.Unspecified u ->
				new Quantity.Unspecified(u.notes());
		};
	}

	private static TimerAttachment toModelAttachment(RecipeResource.Step.@org.jspecify.annotations.Nullable TimerAttachment a) {
		return a == null ? null : new TimerAttachment(a.duration());
	}
}
