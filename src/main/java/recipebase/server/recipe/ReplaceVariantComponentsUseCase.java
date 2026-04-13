package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.ReplaceVariantComponentsRequest;

import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class ReplaceVariantComponentsUseCase {

	private final DSLContext dsl;

	public ReplaceVariantComponentsUseCase(DSLContext dsl) {
		this.dsl = dsl;
	}

	public boolean execute(String recipeSlug, String variantSlug, ReplaceVariantComponentsRequest request) {
		return dsl.transactionResult(cfg -> {
			var c = cfg.dsl();

			var variantId = c.select(RECIPE_VARIANT.ID)
				.from(RECIPE_VARIANT)
				.join(RECIPE).on(RECIPE.ID.eq(RECIPE_VARIANT.RECIPE_ID))
				.where(RECIPE.SLUG.eq(recipeSlug))
				.and(RECIPE_VARIANT.SLUG.eq(variantSlug))
				.fetchOptional(RECIPE_VARIANT.ID);

			if (variantId.isEmpty()) return false;

			// Delete all existing components (cascades to ingredients + steps)
			c.deleteFrom(RECIPE_COMPONENT)
				.where(RECIPE_COMPONENT.VARIANT_ID.eq(variantId.get()))
				.execute();

			// Re-insert from request
			AddVariantUseCase.insertComponents(c, variantId.get(), request.components());

			return true;
		});
	}
}
