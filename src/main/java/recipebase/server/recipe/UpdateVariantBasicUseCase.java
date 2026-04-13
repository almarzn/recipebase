package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.UpdateVariantBasicRequest;

import java.time.OffsetDateTime;

import static recipebase.data.Tables.*;

@Repository
public class UpdateVariantBasicUseCase {

	private final DSLContext dsl;

	public UpdateVariantBasicUseCase(DSLContext dsl) {
		this.dsl = dsl;
	}

	public boolean execute(String recipeSlug, String variantSlug, UpdateVariantBasicRequest request) {
		var now = OffsetDateTime.now();

		int updated = dsl.update(RECIPE_VARIANT)
			.set(RECIPE_VARIANT.NAME, request.name())
			.set(RECIPE_VARIANT.DESCRIPTION, request.description())
			.set(RECIPE_VARIANT.UPDATED_AT, now)
			.where(RECIPE_VARIANT.ID.in(
				dsl.select(RECIPE_VARIANT.ID)
					.from(RECIPE_VARIANT)
					.join(RECIPE).on(RECIPE.ID.eq(RECIPE_VARIANT.RECIPE_ID))
					.where(RECIPE.SLUG.eq(recipeSlug))
					.and(RECIPE_VARIANT.SLUG.eq(variantSlug))
			))
			.execute();

		return updated > 0;
	}
}
