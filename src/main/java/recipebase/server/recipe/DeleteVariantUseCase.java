package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static recipebase.data.Tables.RECIPE;
import static recipebase.data.Tables.RECIPE_VARIANT;

@Repository
public class DeleteVariantUseCase {

	private final DSLContext dsl;

	public DeleteVariantUseCase(DSLContext dsl) {
		this.dsl = dsl;
	}

	public boolean execute(String recipeSlug, String variantSlug) {
		return dsl.transactionResult(cfg -> {
			var c = cfg.dsl();

			// look up variant ID
			var variantId = c.select(RECIPE_VARIANT.ID)
				.from(RECIPE_VARIANT)
				.join(RECIPE).on(RECIPE.ID.eq(RECIPE_VARIANT.RECIPE_ID))
				.where(RECIPE.SLUG.eq(recipeSlug))
				.and(RECIPE_VARIANT.SLUG.eq(variantSlug))
				.fetchOptional(RECIPE_VARIANT.ID);

			if (variantId.isEmpty()) return false;

			// delete the variant
			c.deleteFrom(RECIPE_VARIANT)
				.where(RECIPE_VARIANT.ID.eq(variantId.get()))
				.execute();

			return true;
		});
	}
}
