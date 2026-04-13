package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class DeleteVariantComponentUseCase {

	private final DSLContext dsl;

	public DeleteVariantComponentUseCase(DSLContext dsl) {
		this.dsl = dsl;
	}

	public boolean execute(String recipeSlug, String variantSlug, UUID componentId) {
		int deleted = dsl.deleteFrom(RECIPE_COMPONENT)
			.where(RECIPE_COMPONENT.ID.eq(componentId))
			.and(RECIPE_COMPONENT.VARIANT_ID.in(
				dsl.select(RECIPE_VARIANT.ID)
					.from(RECIPE_VARIANT)
					.join(RECIPE).on(RECIPE.ID.eq(RECIPE_VARIANT.RECIPE_ID))
					.where(RECIPE.SLUG.eq(recipeSlug))
					.and(RECIPE_VARIANT.SLUG.eq(variantSlug))
			))
			.execute();

		return deleted > 0;
	}
}
