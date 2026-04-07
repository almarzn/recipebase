package recipebase.server.recipe;

import java.util.List;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.stereotype.Repository;

import recipebase.server.recipe.resource.RecipeSummaryResource;
import recipebase.server.recipe.resource.RecipeSummaryResource.VariantSummary;

import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;
import static recipebase.data.Tables.*;

@Repository
public class FindAllRecipesUseCase {

	private final DSLContext dsl;

	public FindAllRecipesUseCase(DSLContext dsl) {
		this.dsl = dsl;
	}

	public List<RecipeSummaryResource> execute() {
		var variantsField = variantsField();

		return dsl.select(
				RECIPE.ID, RECIPE.SLUG, RECIPE.TITLE, RECIPE.DESCRIPTION,
				RECIPE.CREATED_AT, RECIPE.UPDATED_AT,
				variantsField
			)
			.from(RECIPE)
			.orderBy(RECIPE.CREATED_AT)
			.fetch(r -> new RecipeSummaryResource(
				r.get(RECIPE.ID), r.get(RECIPE.SLUG), r.get(RECIPE.TITLE),
				r.get(RECIPE.DESCRIPTION), r.get(RECIPE.CREATED_AT), r.get(RECIPE.UPDATED_AT),
				r.get(variantsField)
			));
	}

	private Field<List<VariantSummary>> variantsField() {
		var rv = RECIPE_VARIANT;

		return multiset(
			select(rv.SLUG, rv.NAME)
			.from(rv)
			.where(rv.RECIPE_ID.eq(RECIPE.ID))
			.orderBy(rv.CREATED_AT)
		).convertFrom(result -> result.map(v -> new VariantSummary(
			v.get(rv.SLUG), v.get(rv.NAME)
		)));
	}
}
