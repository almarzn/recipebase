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
    // POST /api/assemblies
    // ============================================================

    @Test
    void create_returnsCreatedAssembly() throws Exception {
        mockMvc.perform(post("/api/assemblies")
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

    // ============================================================
    // GET /api/assemblies/:slug
    // ============================================================

    @Test
    void findBySlug_returnsAssemblyWithComponents() throws Exception {
        mockMvc.perform(get("/api/assemblies/holiday-menu").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slug").value("holiday-menu"))
            .andExpect(jsonPath("$.name").value("Holiday Menu"))
            .andExpect(jsonPath("$.tags[0]").value("dinner"))
            .andExpect(jsonPath("$.yield.unit").value("servings"))
            .andExpect(jsonPath("$.components.length()").value(1))
            .andExpect(jsonPath("$.components[0].slug").value("main-course"))
            .andExpect(jsonPath("$.components[0].itemSlug").value("chocolate-cake"))
            .andExpect(jsonPath("$.components[0].itemName").value("Chocolate Cake"))
            .andExpect(jsonPath("$.components[0].itemType").value("recipe"))
            .andExpect(jsonPath("$.components[0].scaleFactor").value(1.0))
            .andExpect(jsonPath("$.components[0].locked").value(false));
    }

    @Test
    void findBySlug_returnsNotFoundForUnknownSlug() throws Exception {
        mockMvc.perform(get("/api/assemblies/nonexistent").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
    }

    @Test
    void findComponents_returnsFlatList() throws Exception {
        mockMvc.perform(get("/api/assemblies/holiday-menu/components").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].slug").value("main-course"));
    }

    // ============================================================
    // PUT /api/assemblies/:slug
    // ============================================================

    @Test
    void update_returnsUpdatedAssembly() throws Exception {
        mockMvc.perform(put("/api/assemblies/holiday-menu")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "name": "Winter Feast",
                  "tags": ["dinner", "holiday"],
                  "yield": {"quantity": 8, "unit": "servings", "description": "Feeds a crowd"}
                }
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Winter Feast"))
            .andExpect(jsonPath("$.slug").value("holiday-menu"))
            .andExpect(jsonPath("$.tags.length()").value(2))
            .andExpect(jsonPath("$.yield.quantity").value(8))
            .andExpect(jsonPath("$.yield.description").value("Feeds a crowd"));
    }

    @Test
    void update_returnsNotFoundForUnknownSlug() throws Exception {
        mockMvc.perform(put("/api/assemblies/nonexistent")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name": "X", "tags": [], "yield": null}
                """))
            .andExpect(status().isNotFound());
    }

    // ============================================================
    // DELETE /api/assemblies/:slug
    // ============================================================

    @Test
    void delete_removes204() throws Exception {
        mockMvc.perform(delete("/api/assemblies/holiday-menu"))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/assemblies/holiday-menu"))
            .andExpect(status().isNotFound());
    }

    @Test
    void delete_returnsNotFoundForUnknownSlug() throws Exception {
        mockMvc.perform(delete("/api/assemblies/nonexistent"))
            .andExpect(status().isNotFound());
    }

    // ============================================================
    // POST /api/assemblies/:slug/components
    // ============================================================

    @Test
    void addComponent_addsComponentAndReturnsIt() throws Exception {
        mockMvc.perform(post("/api/assemblies/holiday-menu/components")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"itemSlug": "chocolate-cake", "scaleFactor": 2.0}
                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.slug").isNotEmpty())
            .andExpect(jsonPath("$.itemSlug").value("chocolate-cake"))
            .andExpect(jsonPath("$.scaleFactor").value(2.0))
            .andExpect(jsonPath("$.locked").value(false))
            .andExpect(jsonPath("$.compOrder").value(2));
    }

    @Test
    void addComponent_returnsNotFoundForUnknownAssembly() throws Exception {
        mockMvc.perform(post("/api/assemblies/nonexistent/components")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"itemSlug": "chocolate-cake", "scaleFactor": 1.0}
                """))
            .andExpect(status().isNotFound());
    }

    @Test
    void addComponent_returnsNotFoundForUnknownItem() throws Exception {
        mockMvc.perform(post("/api/assemblies/holiday-menu/components")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"itemSlug": "nonexistent-item", "scaleFactor": 1.0}
                """))
            .andExpect(status().isNotFound());
    }

    // ============================================================
    // PUT /api/assemblies/:slug/components/:componentSlug
    // ============================================================

    @Test
    void updateComponent_updatesScaleFactor() throws Exception {
        mockMvc.perform(put("/api/assemblies/holiday-menu/components/main-course")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"scaleFactor": 3.0, "locked": false}
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.scaleFactor").value(3.0))
            .andExpect(jsonPath("$.locked").value(false))
            .andExpect(jsonPath("$.lockSnapshot").doesNotExist());
    }

    @Test
    void updateComponent_lockCapturesSnapshot() throws Exception {
        mockMvc.perform(put("/api/assemblies/holiday-menu/components/main-course")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"scaleFactor": 1.0, "locked": true}
                """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.locked").value(true))
            .andExpect(jsonPath("$.lockSnapshot").isNotEmpty())
            .andExpect(jsonPath("$.lockSnapshot.slug").value("chocolate-cake"));
    }

    @Test
    void updateComponent_returnsNotFoundForUnknownComponent() throws Exception {
        mockMvc.perform(put("/api/assemblies/holiday-menu/components/nonexistent")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"scaleFactor": 1.0, "locked": false}
                """))
            .andExpect(status().isNotFound());
    }

    // ============================================================
    // DELETE /api/assemblies/:slug/components/:componentSlug
    // ============================================================

    @Test
    void deleteComponent_removesComponent() throws Exception {
        mockMvc.perform(delete("/api/assemblies/holiday-menu/components/main-course"))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/assemblies/holiday-menu"))
            .andExpect(jsonPath("$.components.length()").value(0));
    }

    @Test
    void deleteComponent_returnsNotFoundForUnknownComponent() throws Exception {
        mockMvc.perform(delete("/api/assemblies/holiday-menu/components/nonexistent"))
            .andExpect(status().isNotFound());
    }
}
