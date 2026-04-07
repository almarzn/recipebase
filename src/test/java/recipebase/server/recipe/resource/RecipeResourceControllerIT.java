package recipebase.server.recipe.resource;

import io.zonky.test.db.AutoConfigureEmbeddedDatabase;
import org.jooq.DSLContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.aot.DisabledInAotMode;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisabledInAotMode
@AutoConfigureEmbeddedDatabase(provider = AutoConfigureEmbeddedDatabase.DatabaseProvider.EMBEDDED)
class RecipeResourceControllerIT {

	@Autowired
	MockMvc mockMvc;

	@Autowired
	DSLContext dsl;

	UUID recipeId;
	UUID variant1Id;
	UUID variant2Id;

	@BeforeEach
	void setUp() {
		dsl.execute("DELETE FROM recipe");
		dsl.execute("DELETE FROM recipe_step");
		dsl.execute("DELETE FROM recipe_ingredient");
		dsl.execute("DELETE FROM recipe_component");
		dsl.execute("DELETE FROM recipe_variant");

		recipeId = UUID.randomUUID();
		variant1Id = UUID.randomUUID();
		variant2Id = UUID.randomUUID();

		dsl.transaction(cfg -> {
			var c = cfg.dsl();

			c.execute(
				"INSERT INTO recipe (id, slug, title, description) VALUES (?, ?, ?, ?)",
				recipeId, "chocolate-cake", "Chocolate Cake", "A rich chocolate cake"
			);

			c.execute(
				"INSERT INTO recipe_variant (id, recipe_id, slug, name, description) VALUES (?, ?, ?, ?, ?)",
				variant1Id, recipeId, "classic", "Classic", "Traditional chocolate cake"
			);

			c.execute(
				"INSERT INTO recipe_variant (id, recipe_id, slug, name, description) VALUES (?, ?, ?, ?, ?)",
				variant2Id, recipeId, "molten", "Molten Center", "Gooey molten center"
			);

			c.execute(
				"UPDATE recipe SET current_variant_id = ? WHERE id = ?",
				variant1Id, recipeId
			);

			var comp1Id = UUID.randomUUID();
			c.execute(
				"INSERT INTO recipe_component (id, variant_id, position, title, description, link) " +
				"VALUES (?, ?, 1, ?, ?, '{\"quality\":\"self\"}'::jsonb)",
				comp1Id, variant1Id, "Cake Batter", "The main batter"
			);

			c.execute(
				"INSERT INTO recipe_ingredient (id, component_id, position, slug, name, quantity) " +
				"VALUES (?, ?, 1, 'flour', 'All-purpose flour', '{\"unit\":\"gram\",\"amount\":250}'::jsonb)",
				UUID.randomUUID(), comp1Id
			);

			c.execute(
				"INSERT INTO recipe_ingredient (id, component_id, position, slug, name, quantity) " +
				"VALUES (?, ?, 2, 'sugar', 'Sugar', '{\"unit\":\"gram\",\"amount\":200}'::jsonb)",
				UUID.randomUUID(), comp1Id
			);

			c.execute(
				"INSERT INTO recipe_step (id, component_id, position, text) VALUES (?, ?, 1, ?)",
				UUID.randomUUID(), comp1Id, "Mix dry ingredients together."
			);

			c.execute(
				"INSERT INTO recipe_step (id, component_id, position, text, attachment) " +
				"VALUES (?, ?, 2, ?, '{\"duration\":\"PT30M\"}'::jsonb)",
				UUID.randomUUID(), comp1Id, "Bake at 180\u00B0C."
			);

			var comp2Id = UUID.randomUUID();
			c.execute(
				"INSERT INTO recipe_component (id, variant_id, position, title, link) " +
				"VALUES (?, ?, 1, ?, '{\"quality\":\"self\"}'::jsonb)",
				comp2Id, variant2Id, "Molten Batter"
			);

			c.execute(
				"INSERT INTO recipe_ingredient (id, component_id, position, slug, name, quantity) " +
				"VALUES (?, ?, 1, 'dark-chocolate', 'Dark chocolate', '{\"unit\":\"gram\",\"amount\":200}'::jsonb)",
				UUID.randomUUID(), comp2Id
			);

			c.execute(
				"INSERT INTO recipe_step (id, component_id, position, text, attachment) " +
				"VALUES (?, ?, 1, ?, '{\"duration\":\"PT12M\"}'::jsonb)",
				UUID.randomUUID(), comp2Id, "Bake for 12 minutes only."
			);
		});
	}

	@Test
	void list_returnsAllRecipesWithVariantSummaries() throws Exception {
		mockMvc.perform(get("/api/recipes").accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$").isArray())
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].slug").value("chocolate-cake"))
			.andExpect(jsonPath("$[0].title").value("Chocolate Cake"))
			.andExpect(jsonPath("$[0].description").value("A rich chocolate cake"))
			.andExpect(jsonPath("$[0].variants.length()").value(2))
			.andExpect(jsonPath("$[0].variants[?(@.slug=='classic')].name").value("Classic"))
			.andExpect(jsonPath("$[0].variants[?(@.slug=='molten')].name").value("Molten Center"));
	}

	@Test
	void findBySlug_returnsRecipeWithTwoVariants() throws Exception {
		mockMvc.perform(get("/api/recipes/chocolate-cake").accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.slug").value("chocolate-cake"))
			.andExpect(jsonPath("$.title").value("Chocolate Cake"))
			.andExpect(jsonPath("$.description").value("A rich chocolate cake"))
			.andExpect(jsonPath("$.variants.length()").value(2))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].name").value("Classic"))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].description").value("Traditional chocolate cake"))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components.length()").value(1))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].title").value("Cake Batter"))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].description").value("The main batter"))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].ingredients.length()").value(2))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].ingredients[?(@.slug=='flour')].name").value("All-purpose flour"))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].ingredients[?(@.slug=='flour')].quantity.unit").value("gram"))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].ingredients[?(@.slug=='flour')].quantity.amount").value(250))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].ingredients[?(@.slug=='sugar')].name").value("Sugar"))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].ingredients[?(@.slug=='sugar')].quantity.amount").value(200))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].steps.length()").value(2))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].steps[0].text").value("Mix dry ingredients together."))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].steps[0].attachment").doesNotExist())
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].steps[1].text").value("Bake at 180\u00B0C."))
			.andExpect(jsonPath("$.variants[?(@.slug=='classic')].components[0].steps[1].attachment.duration").value("PT30M"))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].name").value("Molten Center"))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].description").value("Gooey molten center"))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].components.length()").value(1))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].components[0].title").value("Molten Batter"))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].components[0].ingredients.length()").value(1))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].components[0].ingredients[0].slug").value("dark-chocolate"))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].components[0].ingredients[0].quantity.amount").value(200))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].components[0].steps.length()").value(1))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].components[0].steps[0].text").value("Bake for 12 minutes only."))
			.andExpect(jsonPath("$.variants[?(@.slug=='molten')].components[0].steps[0].attachment.duration").value("PT12M"));
	}

	@Test
	void findBySlug_returnsNotFoundForUnknownSlug() throws Exception {
		mockMvc.perform(get("/api/recipes/nonexistent").accept(MediaType.APPLICATION_JSON))
			.andExpect(status().isNotFound());
	}
}
