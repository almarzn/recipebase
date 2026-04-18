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
            "VALUES (?, ?, 'flour', 'All-purpose flour', '{\"unit\":\"gram\",\"amount\":250}', 1)",
            UUID.randomUUID(), compId
        );
        dsl.execute(
            "INSERT INTO recipe_step (id, component_id, slug, step_order, body) VALUES (?, ?, 'mix-dry', 1, 'Mix dry ingredients.')",
            UUID.randomUUID(), compId
        );
    }

    // ============================================================
    // POST /recipes
    // ============================================================

    @Test
    void create_returnsCreatedRecipe() throws Exception {
        mockMvc.perform(post("/recipes")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "Banana Bread",
                  "tags": ["baking"],
                  "source": {"type": "original"},
                  "yield": {"quantity": 1, "unit": "loaf", "description": null},
                  "notes": null
                }
                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.slug").isNotEmpty())
            .andExpect(jsonPath("$.name").value("Banana Bread"))
            .andExpect(jsonPath("$.tags[0]").value("baking"))
            .andExpect(jsonPath("$.source.type").value("original"))
            .andExpect(jsonPath("$.yield.unit").value("loaf"))
            .andExpect(jsonPath("$.components").isArray())
            .andExpect(jsonPath("$.components.length()").value(0));
    }
}
