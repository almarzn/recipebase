package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.AddVariantComponentRequest;
import recipebase.server.recipe.resource.ComponentReference;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static recipebase.data.Tables.*;

@Repository
public class AddVariantComponentUseCase {

	private final DSLContext dsl;

	public AddVariantComponentUseCase(DSLContext dsl) {
		this.dsl = dsl;
	}

	public Optional<ComponentReference> execute(String recipeSlug, String variantSlug, AddVariantComponentRequest request) {
		return dsl.transactionResult(cfg -> {
			var c = cfg.dsl();

			var variantId = c.select(RECIPE_VARIANT.ID)
				.from(RECIPE_VARIANT)
				.join(RECIPE).on(RECIPE.ID.eq(RECIPE_VARIANT.RECIPE_ID))
				.where(RECIPE.SLUG.eq(recipeSlug))
				.and(RECIPE_VARIANT.SLUG.eq(variantSlug))
				.fetchOptional(RECIPE_VARIANT.ID);

			if (variantId.isEmpty()) return Optional.empty();

			// Find max position
			var maxPosition = c.selectCount()
				.from(RECIPE_COMPONENT)
				.where(RECIPE_COMPONENT.VARIANT_ID.eq(variantId.get()))
				.fetchOne(0, int.class);

			var position = maxPosition != null ? maxPosition + 1 : 1;

			var compId = UUID.randomUUID();
			var slug = SlugUtil.slugify(request.title());

			c.insertInto(RECIPE_COMPONENT)
				.set(RECIPE_COMPONENT.ID, compId)
				.set(RECIPE_COMPONENT.VARIANT_ID, variantId.get())
				.set(RECIPE_COMPONENT.POSITION, position)
				.set(RECIPE_COMPONENT.TITLE, request.title())
				.set(RECIPE_COMPONENT.DESCRIPTION, request.description())
				.set(RECIPE_COMPONENT.LINK, new recipebase.server.recipe.model.Link.Self())
				.execute();

			// Insert ingredients and steps
			AddVariantUseCase.insertIngredients(c, compId, request.ingredients());
			AddVariantUseCase.insertSteps(c, compId, request.steps());

			return Optional.of(new ComponentReference(compId, slug));
		});
	}
}
