package recipebase.server.recipe;

import java.util.Optional;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.UpdateVariantRequest;

import java.time.OffsetDateTime;

import static recipebase.data.Tables.*;

@Repository
public class UpdateVariantUseCase {

	private final DSLContext dsl;
	private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;

	public UpdateVariantUseCase(DSLContext dsl, FindRecipeBySlugUseCase findRecipeBySlugUseCase) {
		this.dsl = dsl;
		this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
	}

	public Optional<RecipeResource> execute(String recipeSlug, String variantSlug,
											 UpdateVariantRequest request) {
		return dsl.transactionResult(cfg -> {
			var c = cfg.dsl();

			var variantId = c.select(RECIPE_VARIANT.ID)
				.from(RECIPE_VARIANT)
				.join(RECIPE).on(RECIPE.ID.eq(RECIPE_VARIANT.RECIPE_ID))
				.where(RECIPE.SLUG.eq(recipeSlug))
				.and(RECIPE_VARIANT.SLUG.eq(variantSlug))
				.fetchOptional(RECIPE_VARIANT.ID);

			if (variantId.isEmpty()) return Optional.empty();

			var now = OffsetDateTime.now();

			c.update(RECIPE_VARIANT)
				.set(RECIPE_VARIANT.NAME, request.name())
				.set(RECIPE_VARIANT.DESCRIPTION, request.description())
				.set(RECIPE_VARIANT.UPDATED_AT, now)
				.where(RECIPE_VARIANT.ID.eq(variantId.get()))
				.execute();

			// delete all existing components (cascades to ingredients + steps)
			c.deleteFrom(RECIPE_COMPONENT)
				.where(RECIPE_COMPONENT.VARIANT_ID.eq(variantId.get()))
				.execute();

			// re-insert from request
			AddVariantUseCase.insertComponents(c, variantId.get(), request.components());

			return findRecipeBySlugUseCase.execute(recipeSlug);
		});
	}
}
