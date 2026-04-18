package recipebase.server.assembly.resource;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisabledInAotMode
@AutoConfigureEmbeddedDatabase(provider = AutoConfigureEmbeddedDatabase.DatabaseProvider.EMBEDDED)
class AssemblyControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired DSLContext dsl;

    UUID assemblyItemId;
    UUID assemblyId;
    UUID recipeItemId;
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

        assemblyItemId = UUID.randomUUID();
        assemblyId     = UUID.randomUUID();
        recipeItemId   = UUID.randomUUID();
        recipeId       = UUID.randomUUID();
        compId         = UUID.randomUUID();

        // A recipe item to reference from assembly components
        dsl.execute(
            "INSERT INTO item (id, slug, type, name, tags) VALUES (?, 'chocolate-cake', 'recipe', 'Chocolate Cake', '{}')",
            recipeItemId
        );
        dsl.execute(
            "INSERT INTO recipe (id, item_id) VALUES (?, ?)",
            recipeId, recipeItemId
        );

        // The assembly
        dsl.execute(
            "INSERT INTO item (id, slug, type, name, tags) VALUES (?, 'holiday-menu', 'assembly', 'Holiday Menu', '{dinner}')",
            assemblyItemId
        );
        dsl.execute(
            "INSERT INTO assembly (id, item_id, yield) VALUES (?, ?, '{\"quantity\":4,\"unit\":\"servings\",\"description\":null}'::jsonb)",
            assemblyId, assemblyItemId
        );

        // An assembly component referencing the recipe
        dsl.execute(
            "INSERT INTO assembly_component (id, assembly_id, slug, comp_order, item_id, scale_factor, locked) " +
            "VALUES (?, ?, 'main-course', 1, ?, 1.0, false)",
            compId, assemblyId, recipeItemId
        );
    }

    // ============================================================
    // POST /assemblies
    // ============================================================

    @Test
    void create_returnsCreatedAssembly() throws Exception {
        mockMvc.perform(post("/assemblies")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "Summer BBQ",
                  "tags": ["outdoor"],
                  "yield": {"quantity": 6, "unit": "servings", "description": null}
                }
                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.slug").isNotEmpty())
            .andExpect(jsonPath("$.name").value("Summer BBQ"))
            .andExpect(jsonPath("$.tags[0]").value("outdoor"))
            .andExpect(jsonPath("$.yield.unit").value("servings"))
            .andExpect(jsonPath("$.components").isArray())
            .andExpect(jsonPath("$.components.length()").value(0));
    }
}
