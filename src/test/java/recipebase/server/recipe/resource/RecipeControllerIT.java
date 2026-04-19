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

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisabledInAotMode
@AutoConfigureEmbeddedDatabase(provider = AutoConfigureEmbeddedDatabase.DatabaseProvider.EMBEDDED)
class RecipeControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired DSLContext dsl;

    UUID itemId;
    UUID recipeId;
    UUID compId;

    @BeforeEach
    void setUp() {
        dsl.execute("DELETE FROM assembly_component");
        dsl.execute("DELETE FROM assembly");
        dsl.execute("DELETE FROM recipe_step");
        dsl.execute("DELETE FROM recipe_ingredient");
        dsl.execute("DELETE FROM recipe_component");
        dsl.execute("DELETE FROM recipe");
        dsl.execute("DELETE FROM item");

        itemId  = UUID.randomUUID();
        recipeId = UUID.randomUUID();
        compId  = UUID.randomUUID();

        dsl.execute(
            "INSERT INTO item (id, slug, type, name, tags) VALUES (?, 'chocolate-cake', 'recipe', 'Chocolate Cake', '{dessert}')",
            itemId
        );
        dsl.execute(
            "INSERT INTO recipe (id, item_id, notes) VALUES (?, ?, 'Very rich')",
            recipeId, itemId
        );
        dsl.execute(
            "INSERT INTO recipe_component (id, recipe_id, slug, name, position) VALUES (?, ?, 'main', 'Main Batter', 1)",
            compId, recipeId
        );
        dsl.execute(
            "INSERT INTO recipe_ingredient (id, component_id, slug, name, quantity, position) " +
            "VALUES (?, ?, 'flour', 'All-purpose flour', '{\"type\":\"decimal\",\"unit\":{\"type\":\"gram\"},\"amount\":250}', 1)",
            UUID.randomUUID(), compId
        );
        dsl.execute(
            "INSERT INTO recipe_step (id, component_id, slug, step_order, body) VALUES (?, ?, 'mix-dry', 1, 'Mix dry ingredients.')",
            UUID.randomUUID(), compId
        );
    }

    // ============================================================
    // POST /api/recipes
    // ============================================================

    @Test
    void create_returnsCreatedRecipe() throws Exception {
        mockMvc.perform(post("/api/recipes")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "Banana Bread",
                  "tags": ["baking"],
                  "source": {"type": "original"},
                  "yield": {"quantity": {"type": "decimal", "unit": {"type": "custom", "name": "loaf"}, "amount": 1}, "description": null},
                  "notes": null
                }
                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.slug").isNotEmpty())
            .andExpect(jsonPath("$.name").value("Banana Bread"))
            .andExpect(jsonPath("$.tags[0]").value("baking"))
            .andExpect(jsonPath("$.source.type").value("original"))
            .andExpect(jsonPath("$.yield.quantity.type").value("decimal"))
            .andExpect(jsonPath("$.yield.quantity.unit.type").value("custom"))
            .andExpect(jsonPath("$.yield.quantity.unit.name").value("loaf"))
            .andExpect(jsonPath("$.components").isArray())
            .andExpect(jsonPath("$.components.length()").value(0));
    }

    // ============================================================
    // GET /api/recipes/:slug
    // ============================================================

    @Test
    void findBySlug_returnsRecipeWithComponents() throws Exception {
        mockMvc.perform(get("/api/recipes/chocolate-cake").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slug").value("chocolate-cake"))
            .andExpect(jsonPath("$.name").value("Chocolate Cake"))
            .andExpect(jsonPath("$.tags[0]").value("dessert"))
            .andExpect(jsonPath("$.notes").value("Very rich"))
            .andExpect(jsonPath("$.components.length()").value(1))
            .andExpect(jsonPath("$.components[0].slug").value("main"))
            .andExpect(jsonPath("$.components[0].name").value("Main Batter"))
            .andExpect(jsonPath("$.components[0].ingredients.length()").value(1))
            .andExpect(jsonPath("$.components[0].ingredients[0].slug").value("flour"))
            .andExpect(jsonPath("$.components[0].ingredients[0].quantity.type").value("decimal"))
            .andExpect(jsonPath("$.components[0].ingredients[0].quantity.unit.type").value("gram"))
            .andExpect(jsonPath("$.components[0].ingredients[0].quantity.amount").value(250))
            .andExpect(jsonPath("$.components[0].steps.length()").value(1))
            .andExpect(jsonPath("$.components[0].steps[0].body").value("Mix dry ingredients."));
    }

    @Test
    void findBySlug_returnsNotFoundForUnknownSlug() throws Exception {
        mockMvc.perform(get("/api/recipes/nonexistent").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
    }

    @Test
    void findComponents_returnsFlatList() throws Exception {
        mockMvc.perform(get("/api/recipes/chocolate-cake/components").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].slug").value("main"));
    }

    // ============================================================
    // PUT /api/recipes/:slug
    // ============================================================

    @Test
    void update_returnsUpdatedRecipe() throws Exception {
        mockMvc.perform(put("/api/recipes/chocolate-cake")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "Dark Chocolate Cake",
                  "tags": ["dessert", "chocolate"],
                  "source": {"type": "url", "url": "https://example.com"},
                  "yield": {"quantity": {"type": "decimal", "unit": {"type": "custom", "name": "slices"}, "amount": 8}, "description": null},
                  "notes": "Extra dark"
                }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Dark Chocolate Cake"))
            .andExpect(jsonPath("$.slug").value("chocolate-cake"))
            .andExpect(jsonPath("$.tags.length()").value(2))
            .andExpect(jsonPath("$.source.type").value("url"))
            .andExpect(jsonPath("$.source.url").value("https://example.com"))
            .andExpect(jsonPath("$.yield.quantity.type").value("decimal"))
            .andExpect(jsonPath("$.yield.quantity.unit.type").value("custom"))
            .andExpect(jsonPath("$.yield.quantity.unit.name").value("slices"))
            .andExpect(jsonPath("$.notes").value("Extra dark"));
    }

    @Test
    void update_returnsNotFoundForUnknownSlug() throws Exception {
        mockMvc.perform(put("/api/recipes/nonexistent")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name": "X", "tags": [], "source": null, "yield": null, "notes": null}
                """))
            .andExpect(status().isNotFound());
    }

    // ============================================================
    // DELETE /api/recipes/:slug
    // ============================================================

    @Test
    void delete_removes204() throws Exception {
        mockMvc.perform(delete("/api/recipes/chocolate-cake"))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/recipes/chocolate-cake"))
            .andExpect(status().isNotFound());
    }

    @Test
    void delete_returnsNotFoundForUnknownSlug() throws Exception {
        mockMvc.perform(delete("/api/recipes/nonexistent"))
            .andExpect(status().isNotFound());
    }

    // ============================================================
    // POST /api/recipes/:slug/components
    // ============================================================

    @Test
    void addComponent_addsComponentAtEnd() throws Exception {
        mockMvc.perform(post("/api/recipes/chocolate-cake/components")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "Frosting",
                  "ingredients": [
                    {"slug": "cocoa", "name": "Cocoa powder",
                     "quantity": {"type": "decimal", "unit": {"type": "gram"}, "amount": 50}, "notes": null}
                  ],
                  "steps": [
                    {"body": "Melt chocolate.", "timer": null}
                  ]
                }
                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.slug").isNotEmpty())
            .andExpect(jsonPath("$.name").value("Frosting"))
            .andExpect(jsonPath("$.position").value(2))
            .andExpect(jsonPath("$.ingredients.length()").value(1))
            .andExpect(jsonPath("$.ingredients[0].slug").value("cocoa"))
            .andExpect(jsonPath("$.steps.length()").value(1))
            .andExpect(jsonPath("$.steps[0].body").value("Melt chocolate."));
    }

    @Test
    void addComponent_returnsNotFoundForUnknownRecipe() throws Exception {
        mockMvc.perform(post("/api/recipes/nonexistent/components")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name": null, "ingredients": [], "steps": []}
                """))
            .andExpect(status().isNotFound());
    }

    // ============================================================
    // PUT /api/recipes/:slug/components/:componentSlug
    // ============================================================

    @Test
    void replaceComponent_replacesIngredientsAndSteps() throws Exception {
        mockMvc.perform(put("/api/recipes/chocolate-cake/components/main")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "Revised Batter",
                  "ingredients": [
                    {"slug": "cake-flour", "name": "Cake flour",
                     "quantity": {"type": "decimal", "unit": {"type": "gram"}, "amount": 220}, "notes": null}
                  ],
                  "steps": [
                    {"body": "Sift flour.", "timer": "PT1M"}
                  ]
                }
                """))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/recipes/chocolate-cake"))
            .andExpect(jsonPath("$.components[0].name").value("Revised Batter"))
            .andExpect(jsonPath("$.components[0].ingredients.length()").value(1))
            .andExpect(jsonPath("$.components[0].ingredients[0].slug").value("cake-flour"))
            .andExpect(jsonPath("$.components[0].steps.length()").value(1))
            .andExpect(jsonPath("$.components[0].steps[0].body").value("Sift flour."))
            .andExpect(jsonPath("$.components[0].steps[0].timer").value("PT1M"));
    }

    @Test
    void replaceComponent_returnsNotFoundForUnknownComponent() throws Exception {
        mockMvc.perform(put("/api/recipes/chocolate-cake/components/nonexistent")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name": null, "ingredients": [], "steps": []}
                """))
            .andExpect(status().isNotFound());
    }

    // ============================================================
    // DELETE /api/recipes/:slug/components/:componentSlug
    // ============================================================

    @Test
    void deleteComponent_removesComponent() throws Exception {
        mockMvc.perform(delete("/api/recipes/chocolate-cake/components/main"))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/recipes/chocolate-cake"))
            .andExpect(jsonPath("$.components.length()").value(0));
    }

    @Test
    void deleteComponent_returnsNotFoundForUnknownComponent() throws Exception {
        mockMvc.perform(delete("/api/recipes/chocolate-cake/components/nonexistent"))
            .andExpect(status().isNotFound());
    }
}
