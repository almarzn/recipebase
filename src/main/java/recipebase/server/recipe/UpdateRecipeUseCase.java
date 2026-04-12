package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.UpdateRecipeRequest;

import java.time.OffsetDateTime;
import java.util.Optional;

import static recipebase.data.Tables.RECIPE;

@Repository
public class UpdateRecipeUseCase {

	private final DSLContext dsl;
	private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;

	public UpdateRecipeUseCase(DSLContext dsl, FindRecipeBySlugUseCase findRecipeBySlugUseCase) {
		this.dsl = dsl;
		this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
	}

	public Optional<RecipeResource> execute(String slug, UpdateRecipeRequest request) {
		int updated = dsl.update(RECIPE)
			.set(RECIPE.TITLE, request.title())
			.set(RECIPE.DESCRIPTION, request.description())
			.set(RECIPE.UPDATED_AT, OffsetDateTime.now())
			.where(RECIPE.SLUG.eq(slug))
			.execute();

		if (updated == 0) return Optional.empty();
		return findRecipeBySlugUseCase.execute(slug);
	}
}
