package recipebase.server.item.resource;

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
class ItemControllerIT {

    @Autowired MockMvc mockMvc;
    @Autowired DSLContext dsl;

    @BeforeEach
    void setUp() {
        dsl.execute("DELETE FROM assembly_component");
        dsl.execute("DELETE FROM assembly");
        dsl.execute("DELETE FROM recipe_step");
        dsl.execute("DELETE FROM recipe_ingredient");
        dsl.execute("DELETE FROM recipe_component");
        dsl.execute("DELETE FROM recipe");
        dsl.execute("DELETE FROM item");

        var recipeItemId = UUID.randomUUID();
        var assemblyItemId = UUID.randomUUID();

        dsl.execute(
            "INSERT INTO item (id, slug, type, name, tags) VALUES (?, ?, 'recipe', ?, '{}')",
            recipeItemId, "chocolate-cake", "Chocolate Cake"
        );
        dsl.execute(
            "INSERT INTO recipe (id, item_id) VALUES (?, ?)",
            UUID.randomUUID(), recipeItemId
        );
        dsl.execute(
            "INSERT INTO item (id, slug, type, name, tags) VALUES (?, ?, 'assembly', ?, '{dessert}')",
            assemblyItemId, "holiday-menu", "Holiday Menu"
        );
        dsl.execute(
            "INSERT INTO assembly (id, item_id) VALUES (?, ?)",
            UUID.randomUUID(), assemblyItemId
        );
    }

    @Test
    void list_returnsAllItems() throws Exception {
        mockMvc.perform(get("/items").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void list_filterByType_recipe() throws Exception {
        mockMvc.perform(get("/items?type=recipe").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].slug").value("chocolate-cake"))
            .andExpect(jsonPath("$[0].type").value("recipe"))
            .andExpect(jsonPath("$[0].name").value("Chocolate Cake"));
    }

    @Test
    void list_filterByType_assembly() throws Exception {
        mockMvc.perform(get("/items?type=assembly").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].slug").value("holiday-menu"))
            .andExpect(jsonPath("$[0].type").value("assembly"));
    }

    @Test
    void list_filterByQ_matchesName() throws Exception {
        mockMvc.perform(get("/items?q=chocolate").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].slug").value("chocolate-cake"));
    }

    @Test
    void list_filterByTags() throws Exception {
        mockMvc.perform(get("/items?tags=dessert").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].slug").value("holiday-menu"));
    }

    @Test
    void list_noMatch_returnsEmpty() throws Exception {
        mockMvc.perform(get("/items?q=nonexistent").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }
}
