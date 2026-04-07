package recipebase.server.recipe;

import java.util.List;
import java.util.Optional;

import org.jspecify.annotations.Nullable;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.stereotype.Repository;

import recipebase.server.recipe.model.Link;
import recipebase.server.recipe.model.Quantity;
import recipebase.server.recipe.model.TimerAttachment;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.RecipeResource.Component;
import recipebase.server.recipe.resource.RecipeResource.Ingredient;
import recipebase.server.recipe.resource.RecipeResource.Step;
import recipebase.server.recipe.resource.RecipeResource.Variant;

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
		return Optional.ofNullable(
			dsl.select(
				RECIPE.ID, RECIPE.SLUG, RECIPE.TITLE, RECIPE.DESCRIPTION,
				RECIPE.CREATED_AT, RECIPE.UPDATED_AT,
				variantsField()
			)
			.from(RECIPE)
			.where(RECIPE.SLUG.eq(slug))
			.fetchOne(r -> mapRecipe(r, r.get(variantsField())))
		);
	}

	private RecipeResource mapRecipe(org.jooq.Record r, @Nullable List<Variant> variants) {
		return new RecipeResource(
			r.get(RECIPE.ID), r.get(RECIPE.SLUG), r.get(RECIPE.TITLE),
			r.get(RECIPE.DESCRIPTION), r.get(RECIPE.CREATED_AT), r.get(RECIPE.UPDATED_AT),
			variants != null ? variants : List.of()
		);
	}

	private Field<List<Variant>> variantsField() {
		var rv = RECIPE_VARIANT;
		var componentsField = componentsField();

		return multiset(
			select(rv.SLUG, rv.NAME, rv.DESCRIPTION, rv.CREATED_AT, rv.UPDATED_AT, componentsField)
			.from(rv)
			.where(rv.RECIPE_ID.eq(RECIPE.ID))
			.orderBy(rv.CREATED_AT)
		).convertFrom(result -> result.map(v -> new Variant(
			v.get(rv.SLUG), v.get(rv.NAME), v.get(rv.DESCRIPTION),
			v.get(rv.CREATED_AT), v.get(rv.UPDATED_AT),
			v.get(componentsField)
		)));
	}

	private  Field<List<Component>> componentsField() {
		var rc = RECIPE_COMPONENT;
		var ingredientsField = ingredientsField();
		var stepsField = stepsField();

		return multiset(
			select(rc.ID, rc.TITLE, rc.DESCRIPTION, rc.LINK, ingredientsField, stepsField)
			.from(rc)
			.where(rc.VARIANT_ID.eq(RECIPE_VARIANT.ID))
			.orderBy(rc.POSITION)
		).convertFrom(result -> result.map(c -> new Component(
			c.get(rc.ID), c.get(rc.TITLE), toLink(c.get(rc.LINK)), c.get(rc.DESCRIPTION),
			c.get(ingredientsField), c.get(stepsField)
		)));
	}

	private Field<List<Ingredient>> ingredientsField() {
		var ri = RECIPE_INGREDIENT;

		return multiset(
			select(ri.SLUG, ri.NAME, ri.NOTES, ri.QUANTITY)
			.from(ri)
			.where(ri.COMPONENT_ID.eq(RECIPE_COMPONENT.ID))
			.orderBy(ri.POSITION)
		).convertFrom(result -> result.map(i -> new Ingredient(
			i.get(ri.SLUG), i.get(ri.NAME), i.get(ri.NOTES), toQuantity(i.get(ri.QUANTITY))
		)));
	}

	private Field<List<Step>> stepsField() {
		var rs = RECIPE_STEP;

		return multiset(
			select(rs.ID, rs.TEXT, rs.NOTES, rs.ATTACHMENT)
			.from(rs)
			.where(rs.COMPONENT_ID.eq(RECIPE_COMPONENT.ID))
			.orderBy(rs.POSITION)
		).convertFrom(result -> result.map(s -> new Step(
			s.get(rs.ID), s.get(rs.TEXT), s.get(rs.NOTES), toAttachment(s.get(rs.ATTACHMENT))
		)));
	}

	private static Component.Link toLink(Link link) {
		return switch (link) {
			case Link.Self ignored     -> new Component.Link.Self();
			case Link.ExternalRecipe e -> new Component.Link.ExternalRecipe(
				e.slug(), e.title(),
				switch (e.link()) {
					case SNAPSHOT -> Component.ExternalLinkMode.SNAPSHOT;
					case LINKED   -> Component.ExternalLinkMode.LINKED;
				}
			);
		};
	}

	private static Ingredient.Quantity toQuantity(Quantity q) {
		return switch (q) {
			case Quantity.DecimalAmount.Gram g      -> new Ingredient.Quantity.DecimalAmount.Gram(g.amount());
			case Quantity.DecimalAmount.Kilogram k  -> new Ingredient.Quantity.DecimalAmount.Kilogram(k.amount());
			case Quantity.DecimalAmount.Liter l     -> new Ingredient.Quantity.DecimalAmount.Liter(l.amount());
			case Quantity.DecimalAmount.Milliliter m-> new Ingredient.Quantity.DecimalAmount.Milliliter(m.amount());
			case Quantity.Unspecified u             -> new Ingredient.Quantity.Unspecified(u.notes());
		};
	}

	private static Step.@Nullable TimerAttachment toAttachment(@Nullable TimerAttachment a) {
		return a == null ? null : new Step.TimerAttachment(a.duration());
	}
}
