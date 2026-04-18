# Schema Migration — Part 2: Recipe API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full CRUD for recipes and their components (ingredients + steps managed atomically via component PUT).

**Architecture:** `recipe/` package with use-case-per-operation pattern. Controller wired with stub use cases first, then each use case implemented and tested incrementally via `RecipeControllerIT`. Routing by `item.slug` (JOIN item → recipe). `POST /recipes` creates item + recipe atomically. `PUT /recipes/:slug/components/:slug` replaces all ingredients and steps for that component.

**Tech Stack:** Spring Boot 4, jOOQ 3.21, JUnit 6, MockMvc, Zonky EmbeddedPostgres

**Prerequisite:** Part 1 complete (DB schema, jOOQ types, old code deleted).

**Spec:** `docs/superpowers/specs/2026-04-18-schema-migration-design.md`

---

### Task 1: Resource types (records only — no logic)

**Files:**
- Create: `src/main/java/recipebase/server/recipe/resource/StepResource.java`
- Create: `src/main/java/recipebase/server/recipe/resource/IngredientResource.java`
- Create: `src/main/java/recipebase/server/recipe/resource/ComponentResource.java`
- Create: `src/main/java/recipebase/server/recipe/resource/RecipeResource.java`
- Create: `src/main/java/recipebase/server/recipe/resource/CreateRecipeRequest.java`
- Create: `src/main/java/recipebase/server/recipe/resource/UpdateRecipeRequest.java`
- Create: `src/main/java/recipebase/server/recipe/resource/AddComponentRequest.java`
- Create: `src/main/java/recipebase/server/recipe/resource/ReplaceComponentRequest.java`

- [ ] **Step 1: Create `StepResource.java`**

```java
package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.UUID;

public record StepResource(
    UUID id,
    String slug,
    int stepOrder,
    String body,
    @Nullable Integer timerSeconds
) {}
```

- [ ] **Step 2: Create `IngredientResource.java`**

```java
package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Quantity;
import java.util.UUID;

public record IngredientResource(
    UUID id,
    String slug,
    String name,
    Quantity quantity,
    @Nullable String notes,
    int position
) {}
```

- [ ] **Step 3: Create `ComponentResource.java`**

```java
package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.List;
import java.util.UUID;

public record ComponentResource(
    UUID id,
    String slug,
    @Nullable String name,
    int position,
    List<IngredientResource> ingredients,
    List<StepResource> steps
) {}
```

- [ ] **Step 4: Create `RecipeResource.java`**

```java
package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Source;
import recipebase.server.recipe.model.Yield;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record RecipeResource(
    UUID id,
    String slug,
    String name,
    List<String> tags,
    @Nullable Source source,
    @Nullable Yield yield,
    @Nullable String notes,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<ComponentResource> components
) {}
```

- [ ] **Step 5: Create `CreateRecipeRequest.java`**

```java
package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Source;
import recipebase.server.recipe.model.Yield;
import java.util.List;

public record CreateRecipeRequest(
    String name,
    List<String> tags,
    @Nullable Source source,
    @Nullable Yield yield,
    @Nullable String notes
) {}
```

- [ ] **Step 6: Create `UpdateRecipeRequest.java`**

```java
package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Source;
import recipebase.server.recipe.model.Yield;
import java.util.List;

public record UpdateRecipeRequest(
    String name,
    List<String> tags,
    @Nullable Source source,
    @Nullable Yield yield,
    @Nullable String notes
) {}
```

- [ ] **Step 7: Create `AddComponentRequest.java`**

```java
package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.List;

public record AddComponentRequest(
    @Nullable String name,
    List<IngredientRequest> ingredients,
    List<StepRequest> steps
) {
    public record IngredientRequest(
        String slug,
        String name,
        recipebase.server.recipe.model.Quantity quantity,
        @Nullable String notes
    ) {}

    public record StepRequest(
        String body,
        @Nullable Integer timerSeconds
    ) {}
}
```

- [ ] **Step 8: Create `ReplaceComponentRequest.java`**

```java
package recipebase.server.recipe.resource;

import org.jspecify.annotations.Nullable;
import java.util.List;

public record ReplaceComponentRequest(
    @Nullable String name,
    List<IngredientRequest> ingredients,
    List<StepRequest> steps
) {
    public record IngredientRequest(
        String slug,
        String name,
        recipebase.server.recipe.model.Quantity quantity,
        @Nullable String notes
    ) {}

    public record StepRequest(
        String body,
        @Nullable Integer timerSeconds
    ) {}
}
```

- [ ] **Step 9: Verify compilation**

```bash
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL.

- [ ] **Step 10: Commit**

```bash
git add src/main/java/recipebase/server/recipe/resource/
git commit -m "feat: recipe resource types"
```

---

### Task 2: Use case stubs + RecipeController

**Files:**
- Create: `src/main/java/recipebase/server/recipe/CreateRecipeUseCase.java`
- Create: `src/main/java/recipebase/server/recipe/FindRecipeBySlugUseCase.java`
- Create: `src/main/java/recipebase/server/recipe/UpdateRecipeUseCase.java`
- Create: `src/main/java/recipebase/server/recipe/DeleteRecipeUseCase.java`
- Create: `src/main/java/recipebase/server/recipe/AddComponentUseCase.java`
- Create: `src/main/java/recipebase/server/recipe/ReplaceComponentUseCase.java`
- Create: `src/main/java/recipebase/server/recipe/DeleteComponentUseCase.java`
- Create: `src/main/java/recipebase/server/recipe/resource/RecipeController.java`

- [ ] **Step 1: Create stub use cases**

`CreateRecipeUseCase.java`:
```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.CreateRecipeRequest;
import recipebase.server.recipe.resource.RecipeResource;

@Repository
public class CreateRecipeUseCase {
    public CreateRecipeUseCase(DSLContext dsl) {}
    public RecipeResource execute(CreateRecipeRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`FindRecipeBySlugUseCase.java`:
```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.RecipeResource;
import java.util.Optional;

@Repository
public class FindRecipeBySlugUseCase {
    public FindRecipeBySlugUseCase(DSLContext dsl) {}
    public Optional<RecipeResource> execute(String slug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`UpdateRecipeUseCase.java`:
```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.UpdateRecipeRequest;
import java.util.Optional;

@Repository
public class UpdateRecipeUseCase {
    public UpdateRecipeUseCase(DSLContext dsl) {}
    public Optional<RecipeResource> execute(String slug, UpdateRecipeRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`DeleteRecipeUseCase.java`:
```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class DeleteRecipeUseCase {
    public DeleteRecipeUseCase(DSLContext dsl) {}
    public boolean execute(String slug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`AddComponentUseCase.java`:
```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.AddComponentRequest;
import recipebase.server.recipe.resource.ComponentResource;
import java.util.Optional;

@Repository
public class AddComponentUseCase {
    public AddComponentUseCase(DSLContext dsl) {}
    public Optional<ComponentResource> execute(String recipeSlug, AddComponentRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`ReplaceComponentUseCase.java`:
```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.ReplaceComponentRequest;
import java.util.Optional;

@Repository
public class ReplaceComponentUseCase {
    public ReplaceComponentUseCase(DSLContext dsl) {}
    /** Returns empty if recipe or component not found. */
    public Optional<Void> execute(String recipeSlug, String componentSlug, ReplaceComponentRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`DeleteComponentUseCase.java`:
```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class DeleteComponentUseCase {
    public DeleteComponentUseCase(DSLContext dsl) {}
    public boolean execute(String recipeSlug, String componentSlug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

- [ ] **Step 2: Create `RecipeController.java`**

```java
package recipebase.server.recipe.resource;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import recipebase.server.recipe.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/recipes")
public class RecipeController {

    private final CreateRecipeUseCase createRecipeUseCase;
    private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;
    private final UpdateRecipeUseCase updateRecipeUseCase;
    private final DeleteRecipeUseCase deleteRecipeUseCase;
    private final AddComponentUseCase addComponentUseCase;
    private final ReplaceComponentUseCase replaceComponentUseCase;
    private final DeleteComponentUseCase deleteComponentUseCase;

    public RecipeController(
            CreateRecipeUseCase createRecipeUseCase,
            FindRecipeBySlugUseCase findRecipeBySlugUseCase,
            UpdateRecipeUseCase updateRecipeUseCase,
            DeleteRecipeUseCase deleteRecipeUseCase,
            AddComponentUseCase addComponentUseCase,
            ReplaceComponentUseCase replaceComponentUseCase,
            DeleteComponentUseCase deleteComponentUseCase) {
        this.createRecipeUseCase = createRecipeUseCase;
        this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
        this.updateRecipeUseCase = updateRecipeUseCase;
        this.deleteRecipeUseCase = deleteRecipeUseCase;
        this.addComponentUseCase = addComponentUseCase;
        this.replaceComponentUseCase = replaceComponentUseCase;
        this.deleteComponentUseCase = deleteComponentUseCase;
    }

    @PostMapping
    public ResponseEntity<RecipeResource> create(@RequestBody CreateRecipeRequest request) {
        var recipe = createRecipeUseCase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(recipe);
    }

    @GetMapping("{slug}")
    public ResponseEntity<RecipeResource> findBySlug(@PathVariable String slug) {
        return ResponseEntity.of(findRecipeBySlugUseCase.execute(slug));
    }

    @GetMapping("{slug}/components")
    public ResponseEntity<List<ComponentResource>> findComponents(@PathVariable String slug) {
        return findRecipeBySlugUseCase.execute(slug)
            .map(r -> ResponseEntity.ok(r.components()))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{slug}")
    public ResponseEntity<RecipeResource> update(
            @PathVariable String slug,
            @RequestBody UpdateRecipeRequest request) {
        return ResponseEntity.of(updateRecipeUseCase.execute(slug, request));
    }

    @DeleteMapping("{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        return deleteRecipeUseCase.execute(slug)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }

    @PostMapping("{slug}/components")
    public ResponseEntity<ComponentResource> addComponent(
            @PathVariable String slug,
            @RequestBody AddComponentRequest request) {
        return addComponentUseCase.execute(slug, request)
            .map(c -> ResponseEntity.status(HttpStatus.CREATED).<ComponentResource>body(c))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{slug}/components/{componentSlug}")
    public ResponseEntity<Void> replaceComponent(
            @PathVariable String slug,
            @PathVariable String componentSlug,
            @RequestBody ReplaceComponentRequest request) {
        return replaceComponentUseCase.execute(slug, componentSlug, request)
            .map(ignored -> ResponseEntity.<Void>noContent().build())
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("{slug}/components/{componentSlug}")
    public ResponseEntity<Void> deleteComponent(
            @PathVariable String slug,
            @PathVariable String componentSlug) {
        return deleteComponentUseCase.execute(slug, componentSlug)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }
}
```

- [ ] **Step 3: Verify compilation**

```bash
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL.

- [ ] **Step 4: Commit**

```bash
git add src/main/java/recipebase/server/recipe/
git commit -m "feat: recipe use case stubs + controller"
```

---

### Task 3: RecipeControllerIT setup + CreateRecipeUseCase

**Files:**
- Create: `src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java`
- Modify: `src/main/java/recipebase/server/recipe/CreateRecipeUseCase.java`

- [ ] **Step 1: Create test class with setup + create test**

```java
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
```

- [ ] **Step 2: Run to see it fail**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.create_returnsCreatedRecipe"
```

Expected: FAIL — 500 (stub throws UnsupportedOperationException).

- [ ] **Step 3: Implement `CreateRecipeUseCase`**

```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.ComponentResource;
import recipebase.server.recipe.resource.CreateRecipeRequest;
import recipebase.server.recipe.resource.RecipeResource;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class CreateRecipeUseCase {

    private final DSLContext dsl;

    public CreateRecipeUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public RecipeResource execute(CreateRecipeRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();
            var now = OffsetDateTime.now();
            var itemId = UUID.randomUUID();
            var recipeId = UUID.randomUUID();
            var slug = SlugUtil.slugify(request.name());

            c.insertInto(ITEM)
                .set(ITEM.ID, itemId)
                .set(ITEM.SLUG, slug)
                .set(ITEM.TYPE, "recipe")
                .set(ITEM.NAME, request.name())
                .set(ITEM.TAGS, request.tags() != null
                    ? request.tags().toArray(String[]::new)
                    : new String[0])
                .set(ITEM.CREATED_AT, now)
                .set(ITEM.UPDATED_AT, now)
                .execute();

            c.insertInto(RECIPE)
                .set(RECIPE.ID, recipeId)
                .set(RECIPE.ITEM_ID, itemId)
                .set(RECIPE.SOURCE, request.source())
                .set(RECIPE.YIELD, request.yield())
                .set(RECIPE.NOTES, request.notes())
                .execute();

            return new RecipeResource(
                itemId, slug, request.name(),
                request.tags() != null ? request.tags() : List.of(),
                request.source(), request.yield(), request.notes(),
                now, now,
                List.of()
            );
        });
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.create_returnsCreatedRecipe"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/recipe/CreateRecipeUseCase.java \
        src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java
git commit -m "feat: POST /recipes — CreateRecipeUseCase"
```

---

### Task 4: FindRecipeBySlugUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/recipe/FindRecipeBySlugUseCase.java`
- Modify: `src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java`

- [ ] **Step 1: Add failing tests**

Add to `RecipeControllerIT`:

```java
// ============================================================
// GET /recipes/:slug
// ============================================================

@Test
void findBySlug_returnsRecipeWithComponents() throws Exception {
    mockMvc.perform(get("/recipes/chocolate-cake").accept(MediaType.APPLICATION_JSON))
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
        .andExpect(jsonPath("$.components[0].ingredients[0].quantity.unit").value("gram"))
        .andExpect(jsonPath("$.components[0].ingredients[0].quantity.amount").value(250))
        .andExpect(jsonPath("$.components[0].steps.length()").value(1))
        .andExpect(jsonPath("$.components[0].steps[0].body").value("Mix dry ingredients."));
}

@Test
void findBySlug_returnsNotFoundForUnknownSlug() throws Exception {
    mockMvc.perform(get("/recipes/nonexistent").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
}

@Test
void findComponents_returnsFlatList() throws Exception {
    mockMvc.perform(get("/recipes/chocolate-cake/components").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].slug").value("main"));
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.findBySlug_returnsRecipeWithComponents"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `FindRecipeBySlugUseCase`**

```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.ComponentResource;
import recipebase.server.recipe.resource.IngredientResource;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.StepResource;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

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
        var compsField = componentsField();

        return Optional.ofNullable(
            dsl.select(
                ITEM.ID, ITEM.SLUG, ITEM.NAME, ITEM.TAGS, ITEM.CREATED_AT, ITEM.UPDATED_AT,
                RECIPE.SOURCE, RECIPE.YIELD, RECIPE.NOTES,
                compsField
            )
            .from(ITEM)
            .join(RECIPE).on(RECIPE.ITEM_ID.eq(ITEM.ID))
            .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("recipe")))
            .fetchOne(r -> new RecipeResource(
                r.get(ITEM.ID),
                r.get(ITEM.SLUG),
                r.get(ITEM.NAME),
                Arrays.asList(r.get(ITEM.TAGS)),
                r.get(RECIPE.SOURCE),
                r.get(RECIPE.YIELD),
                r.get(RECIPE.NOTES),
                r.get(ITEM.CREATED_AT),
                r.get(ITEM.UPDATED_AT),
                r.get(compsField)
            ))
        );
    }

    private Field<List<ComponentResource>> componentsField() {
        var ingField = ingredientsField();
        var stepField = stepsField();

        return multiset(
            select(
                RECIPE_COMPONENT.ID, RECIPE_COMPONENT.SLUG, RECIPE_COMPONENT.NAME,
                RECIPE_COMPONENT.POSITION, ingField, stepField
            )
            .from(RECIPE_COMPONENT)
            .where(RECIPE_COMPONENT.RECIPE_ID.eq(RECIPE.ID))
            .orderBy(RECIPE_COMPONENT.POSITION)
        ).convertFrom(result -> result.map(row -> new ComponentResource(
            row.get(RECIPE_COMPONENT.ID),
            row.get(RECIPE_COMPONENT.SLUG),
            row.get(RECIPE_COMPONENT.NAME),
            row.get(RECIPE_COMPONENT.POSITION),
            row.get(ingField),
            row.get(stepField)
        )));
    }

    private Field<List<IngredientResource>> ingredientsField() {
        return multiset(
            select(
                RECIPE_INGREDIENT.ID, RECIPE_INGREDIENT.SLUG, RECIPE_INGREDIENT.NAME,
                RECIPE_INGREDIENT.QUANTITY, RECIPE_INGREDIENT.NOTES, RECIPE_INGREDIENT.POSITION
            )
            .from(RECIPE_INGREDIENT)
            .where(RECIPE_INGREDIENT.COMPONENT_ID.eq(RECIPE_COMPONENT.ID))
            .orderBy(RECIPE_INGREDIENT.POSITION)
        ).convertFrom(result -> result.map(row -> new IngredientResource(
            row.get(RECIPE_INGREDIENT.ID),
            row.get(RECIPE_INGREDIENT.SLUG),
            row.get(RECIPE_INGREDIENT.NAME),
            row.get(RECIPE_INGREDIENT.QUANTITY),
            row.get(RECIPE_INGREDIENT.NOTES),
            row.get(RECIPE_INGREDIENT.POSITION)
        )));
    }

    private Field<List<StepResource>> stepsField() {
        return multiset(
            select(
                RECIPE_STEP.ID, RECIPE_STEP.SLUG, RECIPE_STEP.STEP_ORDER,
                RECIPE_STEP.BODY, RECIPE_STEP.TIMER_SECONDS
            )
            .from(RECIPE_STEP)
            .where(RECIPE_STEP.COMPONENT_ID.eq(RECIPE_COMPONENT.ID))
            .orderBy(RECIPE_STEP.STEP_ORDER)
        ).convertFrom(result -> result.map(row -> new StepResource(
            row.get(RECIPE_STEP.ID),
            row.get(RECIPE_STEP.SLUG),
            row.get(RECIPE_STEP.STEP_ORDER),
            row.get(RECIPE_STEP.BODY),
            row.get(RECIPE_STEP.TIMER_SECONDS)
        )));
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.findBySlug_*" \
               --tests "recipebase.server.recipe.resource.RecipeControllerIT.findComponents_*"
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/recipe/FindRecipeBySlugUseCase.java \
        src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java
git commit -m "feat: GET /recipes/:slug — FindRecipeBySlugUseCase"
```

---

### Task 5: UpdateRecipeUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/recipe/UpdateRecipeUseCase.java`
- Modify: `src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java`

- [ ] **Step 1: Add failing test**

Add to `RecipeControllerIT`:

```java
// ============================================================
// PUT /recipes/:slug
// ============================================================

@Test
void update_returnsUpdatedRecipe() throws Exception {
    mockMvc.perform(put("/recipes/chocolate-cake")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "name": "Dark Chocolate Cake",
              "tags": ["dessert", "chocolate"],
              "source": {"type": "url", "url": "https://example.com"},
              "yield": {"quantity": 8, "unit": "slices", "description": null},
              "notes": "Extra dark"
            }
            """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Dark Chocolate Cake"))
        .andExpect(jsonPath("$.slug").value("chocolate-cake"))
        .andExpect(jsonPath("$.tags.length()").value(2))
        .andExpect(jsonPath("$.source.type").value("url"))
        .andExpect(jsonPath("$.source.url").value("https://example.com"))
        .andExpect(jsonPath("$.yield.unit").value("slices"))
        .andExpect(jsonPath("$.notes").value("Extra dark"));
}

@Test
void update_returnsNotFoundForUnknownSlug() throws Exception {
    mockMvc.perform(put("/recipes/nonexistent")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"name": "X", "tags": [], "source": null, "yield": null, "notes": null}
            """))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.update_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `UpdateRecipeUseCase`**

```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.RecipeResource;
import recipebase.server.recipe.resource.UpdateRecipeRequest;

import java.time.OffsetDateTime;
import java.util.Optional;

import static recipebase.data.Tables.*;

@Repository
public class UpdateRecipeUseCase {

    private final DSLContext dsl;
    private final FindRecipeBySlugUseCase findRecipeBySlugUseCase;

    public UpdateRecipeUseCase(DSLContext dsl, FindRecipeBySlugUseCase findRecipeBySlugUseCase) {
        this.dsl = dsl;
        this.findRecipeBySlugUseCase = findRecipeBySlugUseCase;
    }

    public Optional<RecipeResource> execute(String slug, UpdateRecipeRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            int itemUpdated = c.update(ITEM)
                .set(ITEM.NAME, request.name())
                .set(ITEM.TAGS, request.tags() != null
                    ? request.tags().toArray(String[]::new)
                    : new String[0])
                .set(ITEM.UPDATED_AT, OffsetDateTime.now())
                .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("recipe")))
                .execute();

            if (itemUpdated == 0) return Optional.empty();

            c.update(RECIPE)
                .set(RECIPE.SOURCE, request.source())
                .set(RECIPE.YIELD, request.yield())
                .set(RECIPE.NOTES, request.notes())
                .from(ITEM)
                .where(RECIPE.ITEM_ID.eq(ITEM.ID).and(ITEM.SLUG.eq(slug)))
                .execute();

            return findRecipeBySlugUseCase.execute(slug);
        });
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.update_*"
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/recipe/UpdateRecipeUseCase.java \
        src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java
git commit -m "feat: PUT /recipes/:slug — UpdateRecipeUseCase"
```

---

### Task 6: DeleteRecipeUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/recipe/DeleteRecipeUseCase.java`
- Modify: `src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java`

- [ ] **Step 1: Add failing test**

Add to `RecipeControllerIT`:

```java
// ============================================================
// DELETE /recipes/:slug
// ============================================================

@Test
void delete_removes204() throws Exception {
    mockMvc.perform(delete("/recipes/chocolate-cake"))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/recipes/chocolate-cake"))
        .andExpect(status().isNotFound());
}

@Test
void delete_returnsNotFoundForUnknownSlug() throws Exception {
    mockMvc.perform(delete("/recipes/nonexistent"))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.delete_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `DeleteRecipeUseCase`**

```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static recipebase.data.Tables.ITEM;

@Repository
public class DeleteRecipeUseCase {

    private final DSLContext dsl;

    public DeleteRecipeUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public boolean execute(String slug) {
        int deleted = dsl.deleteFrom(ITEM)
            .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("recipe")))
            .execute();
        return deleted > 0;
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.delete_*"
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/recipe/DeleteRecipeUseCase.java \
        src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java
git commit -m "feat: DELETE /recipes/:slug — DeleteRecipeUseCase"
```

---

### Task 7: AddComponentUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/recipe/AddComponentUseCase.java`
- Modify: `src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java`

- [ ] **Step 1: Add failing test**

Add to `RecipeControllerIT`:

```java
// ============================================================
// POST /recipes/:slug/components
// ============================================================

@Test
void addComponent_addsComponentAtEnd() throws Exception {
    mockMvc.perform(post("/recipes/chocolate-cake/components")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "name": "Frosting",
              "ingredients": [
                {"slug": "cocoa", "name": "Cocoa powder",
                 "quantity": {"unit": "gram", "amount": 50}, "notes": null}
              ],
              "steps": [
                {"body": "Melt chocolate.", "timerSeconds": null}
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
    mockMvc.perform(post("/recipes/nonexistent/components")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"name": null, "ingredients": [], "steps": []}
            """))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.addComponent_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `AddComponentUseCase`**

```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.AddComponentRequest;
import recipebase.server.recipe.resource.ComponentResource;
import recipebase.server.recipe.resource.IngredientResource;
import recipebase.server.recipe.resource.StepResource;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static recipebase.data.Tables.*;

@Repository
public class AddComponentUseCase {

    private final DSLContext dsl;

    public AddComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<ComponentResource> execute(String recipeSlug, AddComponentRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            var recipeId = c.select(RECIPE.ID)
                .from(RECIPE)
                .join(ITEM).on(ITEM.ID.eq(RECIPE.ITEM_ID))
                .where(ITEM.SLUG.eq(recipeSlug).and(ITEM.TYPE.eq("recipe")))
                .fetchOptional(RECIPE.ID);

            if (recipeId.isEmpty()) return Optional.empty();

            int maxPos = c.select(RECIPE_COMPONENT.POSITION.max())
                .from(RECIPE_COMPONENT)
                .where(RECIPE_COMPONENT.RECIPE_ID.eq(recipeId.get()))
                .fetchOne(0, int.class);
            int position = maxPos + 1;

            var compId = UUID.randomUUID();
            String compSlug = request.name() != null
                ? SlugUtil.slugify(request.name())
                : "component-" + position;

            c.insertInto(RECIPE_COMPONENT)
                .set(RECIPE_COMPONENT.ID, compId)
                .set(RECIPE_COMPONENT.RECIPE_ID, recipeId.get())
                .set(RECIPE_COMPONENT.SLUG, compSlug)
                .set(RECIPE_COMPONENT.NAME, request.name())
                .set(RECIPE_COMPONENT.POSITION, position)
                .execute();

            var ingredients = insertIngredients(c, compId, request.ingredients());
            var steps = insertSteps(c, compId, request.steps());

            return Optional.of(new ComponentResource(compId, compSlug, request.name(), position, ingredients, steps));
        });
    }

    static List<IngredientResource> insertIngredients(
            DSLContext c, UUID compId, List<AddComponentRequest.IngredientRequest> ingredients) {
        var pos = new AtomicInteger(1);
        return ingredients.stream().map(ing -> {
            var id = UUID.randomUUID();
            int p = pos.getAndIncrement();
            c.insertInto(RECIPE_INGREDIENT)
                .set(RECIPE_INGREDIENT.ID, id)
                .set(RECIPE_INGREDIENT.COMPONENT_ID, compId)
                .set(RECIPE_INGREDIENT.SLUG, ing.slug())
                .set(RECIPE_INGREDIENT.NAME, ing.name())
                .set(RECIPE_INGREDIENT.QUANTITY, ing.quantity())
                .set(RECIPE_INGREDIENT.NOTES, ing.notes())
                .set(RECIPE_INGREDIENT.POSITION, p)
                .execute();
            return new IngredientResource(id, ing.slug(), ing.name(), ing.quantity(), ing.notes(), p);
        }).toList();
    }

    static List<StepResource> insertSteps(
            DSLContext c, UUID compId, List<AddComponentRequest.StepRequest> steps) {
        var order = new AtomicInteger(1);
        return steps.stream().map(step -> {
            var id = UUID.randomUUID();
            int o = order.getAndIncrement();
            String slug = SlugUtil.slugify(step.body().substring(0, Math.min(step.body().length(), 40)));
            c.insertInto(RECIPE_STEP)
                .set(RECIPE_STEP.ID, id)
                .set(RECIPE_STEP.COMPONENT_ID, compId)
                .set(RECIPE_STEP.SLUG, slug)
                .set(RECIPE_STEP.STEP_ORDER, o)
                .set(RECIPE_STEP.BODY, step.body())
                .set(RECIPE_STEP.TIMER_SECONDS, step.timerSeconds())
                .execute();
            return new StepResource(id, slug, o, step.body(), step.timerSeconds());
        }).toList();
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.addComponent_*"
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/recipe/AddComponentUseCase.java \
        src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java
git commit -m "feat: POST /recipes/:slug/components — AddComponentUseCase"
```

---

### Task 8: ReplaceComponentUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/recipe/ReplaceComponentUseCase.java`
- Modify: `src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java`

- [ ] **Step 1: Add failing test**

Add to `RecipeControllerIT`:

```java
// ============================================================
// PUT /recipes/:slug/components/:componentSlug
// ============================================================

@Test
void replaceComponent_replacesIngredientsAndSteps() throws Exception {
    mockMvc.perform(put("/recipes/chocolate-cake/components/main")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {
              "name": "Revised Batter",
              "ingredients": [
                {"slug": "cake-flour", "name": "Cake flour",
                 "quantity": {"unit": "gram", "amount": 220}, "notes": null}
              ],
              "steps": [
                {"body": "Sift flour.", "timerSeconds": 60}
              ]
            }
            """))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/recipes/chocolate-cake"))
        .andExpect(jsonPath("$.components[0].name").value("Revised Batter"))
        .andExpect(jsonPath("$.components[0].ingredients.length()").value(1))
        .andExpect(jsonPath("$.components[0].ingredients[0].slug").value("cake-flour"))
        .andExpect(jsonPath("$.components[0].steps.length()").value(1))
        .andExpect(jsonPath("$.components[0].steps[0].body").value("Sift flour."))
        .andExpect(jsonPath("$.components[0].steps[0].timerSeconds").value(60));
}

@Test
void replaceComponent_returnsNotFoundForUnknownComponent() throws Exception {
    mockMvc.perform(put("/recipes/chocolate-cake/components/nonexistent")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"name": null, "ingredients": [], "steps": []}
            """))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.replaceComponent_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `ReplaceComponentUseCase`**

```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.recipe.resource.AddComponentRequest;
import recipebase.server.recipe.resource.ReplaceComponentRequest;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static recipebase.data.Tables.*;

@Repository
public class ReplaceComponentUseCase {

    private final DSLContext dsl;

    public ReplaceComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<Void> execute(String recipeSlug, String componentSlug, ReplaceComponentRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            var compId = c.select(RECIPE_COMPONENT.ID)
                .from(RECIPE_COMPONENT)
                .join(RECIPE).on(RECIPE.ID.eq(RECIPE_COMPONENT.RECIPE_ID))
                .join(ITEM).on(ITEM.ID.eq(RECIPE.ITEM_ID))
                .where(ITEM.SLUG.eq(recipeSlug)
                    .and(ITEM.TYPE.eq("recipe"))
                    .and(RECIPE_COMPONENT.SLUG.eq(componentSlug)))
                .fetchOptional(RECIPE_COMPONENT.ID);

            if (compId.isEmpty()) return Optional.empty();

            c.update(RECIPE_COMPONENT)
                .set(RECIPE_COMPONENT.NAME, request.name())
                .where(RECIPE_COMPONENT.ID.eq(compId.get()))
                .execute();

            c.deleteFrom(RECIPE_INGREDIENT)
                .where(RECIPE_INGREDIENT.COMPONENT_ID.eq(compId.get()))
                .execute();
            c.deleteFrom(RECIPE_STEP)
                .where(RECIPE_STEP.COMPONENT_ID.eq(compId.get()))
                .execute();

            var ingRequests = request.ingredients().stream()
                .map(i -> new AddComponentRequest.IngredientRequest(i.slug(), i.name(), i.quantity(), i.notes()))
                .toList();
            var stepRequests = request.steps().stream()
                .map(s -> new AddComponentRequest.StepRequest(s.body(), s.timerSeconds()))
                .toList();

            AddComponentUseCase.insertIngredients(c, compId.get(), ingRequests);
            AddComponentUseCase.insertSteps(c, compId.get(), stepRequests);

            return Optional.of(null);
        });
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.replaceComponent_*"
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/recipe/ReplaceComponentUseCase.java \
        src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java
git commit -m "feat: PUT /recipes/:slug/components/:slug — ReplaceComponentUseCase"
```

---

### Task 9: DeleteComponentUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/recipe/DeleteComponentUseCase.java`
- Modify: `src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java`

- [ ] **Step 1: Add failing test**

Add to `RecipeControllerIT`:

```java
// ============================================================
// DELETE /recipes/:slug/components/:componentSlug
// ============================================================

@Test
void deleteComponent_removesComponent() throws Exception {
    mockMvc.perform(delete("/recipes/chocolate-cake/components/main"))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/recipes/chocolate-cake"))
        .andExpect(jsonPath("$.components.length()").value(0));
}

@Test
void deleteComponent_returnsNotFoundForUnknownComponent() throws Exception {
    mockMvc.perform(delete("/recipes/chocolate-cake/components/nonexistent"))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.deleteComponent_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `DeleteComponentUseCase`**

```java
package recipebase.server.recipe;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static recipebase.data.Tables.*;

@Repository
public class DeleteComponentUseCase {

    private final DSLContext dsl;

    public DeleteComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public boolean execute(String recipeSlug, String componentSlug) {
        int deleted = dsl.deleteFrom(RECIPE_COMPONENT)
            .using(RECIPE, ITEM)
            .where(RECIPE_COMPONENT.RECIPE_ID.eq(RECIPE.ID)
                .and(RECIPE.ITEM_ID.eq(ITEM.ID))
                .and(ITEM.SLUG.eq(recipeSlug))
                .and(ITEM.TYPE.eq("recipe"))
                .and(RECIPE_COMPONENT.SLUG.eq(componentSlug)))
            .execute();
        return deleted > 0;
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT.deleteComponent_*"
```

Expected: both pass.

- [ ] **Step 5: Run the full recipe test suite**

```bash
./gradlew test --tests "recipebase.server.recipe.resource.RecipeControllerIT"
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/recipebase/server/recipe/DeleteComponentUseCase.java \
        src/test/java/recipebase/server/recipe/resource/RecipeControllerIT.java
git commit -m "feat: DELETE /recipes/:slug/components/:slug — DeleteComponentUseCase"
```

---

### Task 10: Full Part 2 build verification

- [ ] **Step 1: Run the full build**

```bash
./gradlew build
```

Expected: BUILD SUCCESSFUL. All tests pass including `RecipeControllerIT`, `ItemControllerIT`, and `ServerApplicationTests`.

- [ ] **Step 2: Spot-check with curl (optional, requires `./gradlew bootRun` running)**

```bash
# Create a recipe
curl -s -X POST http://localhost:8080/recipes \
  -H "Content-Type: application/json" \
  -d '{"name":"Banana Bread","tags":["baking"],"source":{"type":"original"},"yield":null,"notes":null}' | jq .

# List items
curl -s http://localhost:8080/items | jq .
```
