# Schema Migration — Part 1: DB, jOOQ, Models, Item API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drop the old schema, create the new one, regenerate jOOQ types, add new model types (Source, Yield), and implement `GET /items`.

**Architecture:** Two Liquibase changesets replace the schema. `build.gradle.kts` forcedTypes updated for new JSONB columns. New `item/` package provides the search endpoint. Old `recipe/` code deleted after jOOQ codegen succeeds.

**Tech Stack:** Spring Boot 4, jOOQ 3.21, Liquibase, JUnit 6, MockMvc, Zonky EmbeddedPostgres

**Spec:** `docs/superpowers/specs/2026-04-18-schema-migration-design.md`

**Part 2 prerequisite:** This plan must be complete before starting Part 2 (Recipe) or Part 3 (Assembly).

---

### Task 1: Drop old schema

**Files:**
- Create: `src/main/resources/db/changelog/002-drop-old-schema.sql`
- Modify: `src/main/resources/db/changelog/db.changelog-master.yaml`

- [ ] **Step 1: Create the drop migration**

```sql
--liquibase formatted sql

--changeset recipebase:002-drop-old-schema
DROP TABLE IF EXISTS recipe_step;
DROP TABLE IF EXISTS recipe_ingredient;
DROP TABLE IF EXISTS recipe_component;
DROP TABLE IF EXISTS recipe_variant;
DROP TABLE IF EXISTS recipe;
--rollback -- no rollback; clean slate assumed
```

- [ ] **Step 2: Add to master changelog**

Edit `src/main/resources/db/changelog/db.changelog-master.yaml`:

```yaml
databaseChangeLog:
  - include:
      file: db/changelog/001-initial-schema.sql
  - include:
      file: db/changelog/002-drop-old-schema.sql
```

- [ ] **Step 3: Commit**

```bash
git add src/main/resources/db/changelog/002-drop-old-schema.sql \
        src/main/resources/db/changelog/db.changelog-master.yaml
git commit -m "db: drop old recipe/variant schema"
```

---

### Task 2: Create new schema

**Files:**
- Create: `src/main/resources/db/changelog/003-new-schema.sql`
- Modify: `src/main/resources/db/changelog/db.changelog-master.yaml`

- [ ] **Step 1: Create the new schema migration**

```sql
--liquibase formatted sql

-- ============================================================
-- 001 — item
-- ============================================================
--changeset recipebase:003-item
CREATE TABLE item (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT        NOT NULL UNIQUE,
    type        TEXT        NOT NULL CHECK (type IN ('recipe', 'assembly')),
    name        TEXT        NOT NULL,
    tags        TEXT[]      NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
--rollback DROP TABLE item;

-- ============================================================
-- 002 — recipe
-- ============================================================
--changeset recipebase:003-recipe
CREATE TABLE recipe (
    id       UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id  UUID  NOT NULL REFERENCES item(id) ON DELETE CASCADE,
    source   JSONB,
    yield    JSONB,
    notes    TEXT
);

CREATE INDEX idx_recipe_item_id ON recipe(item_id);
--rollback DROP TABLE recipe;

-- ============================================================
-- 003 — recipe_component
-- ============================================================
--changeset recipebase:003-recipe-component
CREATE TABLE recipe_component (
    id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id  UUID  NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    slug       TEXT  NOT NULL,
    name       TEXT,
    position   INT   NOT NULL,
    UNIQUE (recipe_id, slug),
    UNIQUE (recipe_id, position)
);

CREATE INDEX idx_recipe_component_recipe_id ON recipe_component(recipe_id);
--rollback DROP TABLE recipe_component;

-- ============================================================
-- 004 — recipe_ingredient
-- ============================================================
--changeset recipebase:003-recipe-ingredient
CREATE TABLE recipe_ingredient (
    id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id UUID  NOT NULL REFERENCES recipe_component(id) ON DELETE CASCADE,
    slug         TEXT  NOT NULL,
    name         TEXT  NOT NULL,
    quantity     JSONB NOT NULL,
    notes        TEXT,
    position     INT   NOT NULL,
    UNIQUE (component_id, slug),
    UNIQUE (component_id, position)
);

CREATE INDEX idx_recipe_ingredient_component_id ON recipe_ingredient(component_id);
--rollback DROP TABLE recipe_ingredient;

-- ============================================================
-- 005 — recipe_step
-- ============================================================
--changeset recipebase:003-recipe-step
CREATE TABLE recipe_step (
    id            UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    component_id  UUID  NOT NULL REFERENCES recipe_component(id) ON DELETE CASCADE,
    slug          TEXT  NOT NULL,
    step_order    INT   NOT NULL,
    body          TEXT  NOT NULL,
    timer_seconds INT,
    UNIQUE (component_id, slug),
    UNIQUE (component_id, step_order)
);

CREATE INDEX idx_recipe_step_component_id ON recipe_step(component_id);
--rollback DROP TABLE recipe_step;

-- ============================================================
-- 006 — assembly
-- ============================================================
--changeset recipebase:003-assembly
CREATE TABLE assembly (
    id       UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id  UUID  NOT NULL REFERENCES item(id) ON DELETE CASCADE,
    yield    JSONB
);

CREATE INDEX idx_assembly_item_id ON assembly(item_id);
--rollback DROP TABLE assembly;

-- ============================================================
-- 007 — assembly_component
-- ============================================================
--changeset recipebase:003-assembly-component
CREATE TABLE assembly_component (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    assembly_id    UUID    NOT NULL REFERENCES assembly(id) ON DELETE CASCADE,
    slug           TEXT    NOT NULL,
    comp_order     INT     NOT NULL,
    item_id        UUID    NOT NULL REFERENCES item(id),
    scale_factor   NUMERIC NOT NULL DEFAULT 1,
    locked         BOOLEAN NOT NULL DEFAULT false,
    lock_snapshot  JSONB,
    UNIQUE (assembly_id, slug),
    UNIQUE (assembly_id, comp_order)
);

CREATE INDEX idx_assembly_component_assembly_id ON assembly_component(assembly_id);
--rollback DROP TABLE assembly_component;
```

Note: columns named `order` would require quoting in every query, so we use `step_order` and `comp_order` instead.

- [ ] **Step 2: Add to master changelog**

```yaml
databaseChangeLog:
  - include:
      file: db/changelog/001-initial-schema.sql
  - include:
      file: db/changelog/002-drop-old-schema.sql
  - include:
      file: db/changelog/003-new-schema.sql
```

- [ ] **Step 3: Commit**

```bash
git add src/main/resources/db/changelog/003-new-schema.sql \
        src/main/resources/db/changelog/db.changelog-master.yaml
git commit -m "db: create new item/recipe/assembly schema"
```

---

### Task 3: Update jOOQ forcedTypes + create model types

**Files:**
- Modify: `build.gradle.kts` (lines 199–218 — forcedTypes block)
- Create: `src/main/java/recipebase/server/recipe/model/Source.java`
- Create: `src/main/java/recipebase/server/recipe/model/Yield.java`
- Delete: `src/main/java/recipebase/server/recipe/model/Link.java`
- Delete: `src/main/java/recipebase/server/recipe/model/TimerAttachment.java`

- [ ] **Step 1: Create `Source.java`**

```java
package recipebase.server.recipe.model;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
public sealed interface Source {
    @JsonTypeName("url")
    record Url(String url) implements Source {}

    @JsonTypeName("book")
    record Book(String reference) implements Source {}

    @JsonTypeName("original")
    record Original() implements Source {}
}
```

- [ ] **Step 2: Create `Yield.java`**

```java
package recipebase.server.recipe.model;

import org.jspecify.annotations.Nullable;
import java.math.BigDecimal;

public record Yield(
    @Nullable BigDecimal quantity,
    @Nullable String unit,
    @Nullable String description
) {}
```

- [ ] **Step 3: Delete old model files**

```bash
rm src/main/java/recipebase/server/recipe/model/Link.java
rm src/main/java/recipebase/server/recipe/model/TimerAttachment.java
```

- [ ] **Step 4: Replace forcedTypes block in `build.gradle.kts`**

Replace the `forcedTypes { ... }` block (lines 199–218) with:

```kotlin
forcedTypes {
    forcedType {
        userType = "recipebase.server.recipe.model.Quantity"
        jsonConverter = true
        jsonConverterImplementation = JSONConverterImplementation.JACKSON_3
        includeExpression = "RECIPE_INGREDIENT\\.QUANTITY"
    }
    forcedType {
        userType = "recipebase.server.recipe.model.Source"
        jsonConverter = true
        jsonConverterImplementation = JSONConverterImplementation.JACKSON_3
        includeExpression = "RECIPE\\.SOURCE"
    }
    forcedType {
        userType = "recipebase.server.recipe.model.Yield"
        jsonConverter = true
        jsonConverterImplementation = JSONConverterImplementation.JACKSON_3
        includeExpression = "(RECIPE|ASSEMBLY)\\.YIELD"
    }
}
```

- [ ] **Step 5: Run jooqCodegen to verify new types generate cleanly**

```bash
./gradlew jooqCodegen
```

Expected: BUILD SUCCESSFUL. Generated classes include `recipebase.data.tables.Item`, `recipebase.data.tables.Recipe`, `recipebase.data.tables.Assembly`, etc. No errors about missing types.

- [ ] **Step 6: Commit**

```bash
git add build.gradle.kts \
        src/main/java/recipebase/server/recipe/model/Source.java \
        src/main/java/recipebase/server/recipe/model/Yield.java
git rm src/main/java/recipebase/server/recipe/model/Link.java \
       src/main/java/recipebase/server/recipe/model/TimerAttachment.java
git commit -m "feat: add Source/Yield models, update jOOQ forcedTypes"
```

---

### Task 4: Delete old recipe/ Java code

**Files to delete** (all in `src/main/java/recipebase/server/recipe/`):
- `AddVariantUseCase.java`
- `AddVariantComponentUseCase.java`
- `DeleteVariantComponentUseCase.java`
- `DeleteVariantUseCase.java`
- `FindAllRecipesUseCase.java`
- `FindRecipeBySlugUseCase.java`
- `ReplaceVariantComponentsUseCase.java`
- `UpdateRecipeUseCase.java`
- `UpdateVariantBasicUseCase.java`
- `resource/RecipeResourceController.java`
- `resource/AddVariantComponentRequest.java`
- `resource/AddVariantRequest.java`
- `resource/AddVariantResponse.java`
- `resource/ComponentReference.java`
- `resource/RecipeResource.java`
- `resource/RecipeSummaryResource.java`
- `resource/ReplaceVariantComponentsRequest.java`
- `resource/UpdateRecipeRequest.java`
- `resource/UpdateVariantBasicRequest.java`
- `resource/package-info.java`
- `package-info.java`

**Files to keep** (in `src/main/java/recipebase/server/recipe/`):
- `SlugUtil.java`
- `model/Quantity.java`

**Files to delete** (tests):
- `src/test/java/recipebase/server/recipe/resource/RecipeResourceControllerIT.java`

- [ ] **Step 1: Delete old recipe source files**

```bash
git rm src/main/java/recipebase/server/recipe/AddVariantUseCase.java \
       src/main/java/recipebase/server/recipe/AddVariantComponentUseCase.java \
       src/main/java/recipebase/server/recipe/DeleteVariantComponentUseCase.java \
       src/main/java/recipebase/server/recipe/DeleteVariantUseCase.java \
       src/main/java/recipebase/server/recipe/FindAllRecipesUseCase.java \
       src/main/java/recipebase/server/recipe/FindRecipeBySlugUseCase.java \
       src/main/java/recipebase/server/recipe/ReplaceVariantComponentsUseCase.java \
       src/main/java/recipebase/server/recipe/UpdateRecipeUseCase.java \
       src/main/java/recipebase/server/recipe/UpdateVariantBasicUseCase.java \
       src/main/java/recipebase/server/recipe/resource/RecipeResourceController.java \
       src/main/java/recipebase/server/recipe/resource/AddVariantComponentRequest.java \
       src/main/java/recipebase/server/recipe/resource/AddVariantRequest.java \
       src/main/java/recipebase/server/recipe/resource/AddVariantResponse.java \
       src/main/java/recipebase/server/recipe/resource/ComponentReference.java \
       src/main/java/recipebase/server/recipe/resource/RecipeResource.java \
       src/main/java/recipebase/server/recipe/resource/RecipeSummaryResource.java \
       src/main/java/recipebase/server/recipe/resource/ReplaceVariantComponentsRequest.java \
       src/main/java/recipebase/server/recipe/resource/UpdateRecipeRequest.java \
       src/main/java/recipebase/server/recipe/resource/UpdateVariantBasicRequest.java \
       src/main/java/recipebase/server/recipe/resource/package-info.java \
       src/main/java/recipebase/server/recipe/package-info.java \
       src/test/java/recipebase/server/recipe/resource/RecipeResourceControllerIT.java
```

- [ ] **Step 2: Verify the project still compiles (only SlugUtil + Quantity remain)**

```bash
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL. No compilation errors.

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: delete old variant-based recipe code"
```

---

### Task 5: item/ package — FindItemsUseCase + ItemController + test

**Files:**
- Create: `src/main/java/recipebase/server/item/FindItemsUseCase.java`
- Create: `src/main/java/recipebase/server/item/resource/ItemSummaryResource.java`
- Create: `src/main/java/recipebase/server/item/resource/ItemController.java`
- Create: `src/test/java/recipebase/server/item/resource/ItemControllerIT.java`

- [ ] **Step 1: Write the failing test**

```java
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
```

- [ ] **Step 2: Run test to verify it fails (no controller yet)**

```bash
./gradlew test --tests "recipebase.server.item.resource.ItemControllerIT"
```

Expected: FAIL — context fails to load or 404s.

- [ ] **Step 3: Create `ItemSummaryResource.java`**

```java
package recipebase.server.item.resource;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public record ItemSummaryResource(
    UUID id,
    String slug,
    String type,
    String name,
    List<String> tags
) {}
```

- [ ] **Step 4: Create `FindItemsUseCase.java`**

```java
package recipebase.server.item;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Repository;
import recipebase.server.item.resource.ItemSummaryResource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static recipebase.data.Tables.ITEM;

@Repository
public class FindItemsUseCase {

    private final DSLContext dsl;

    public FindItemsUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public List<ItemSummaryResource> execute(
            @Nullable String q,
            @Nullable String type,
            @Nullable List<String> tags) {

        var conditions = new ArrayList<Condition>();
        if (q != null && !q.isBlank()) {
            conditions.add(ITEM.NAME.containsIgnoreCase(q));
        }
        if (type != null && !type.isBlank()) {
            conditions.add(ITEM.TYPE.eq(type));
        }
        if (tags != null && !tags.isEmpty()) {
            conditions.add(DSL.condition("item.tags @> ?::text[]",
                (Object) tags.toArray(String[]::new)));
        }

        return dsl.select(ITEM.ID, ITEM.SLUG, ITEM.TYPE, ITEM.NAME, ITEM.TAGS)
            .from(ITEM)
            .where(conditions)
            .orderBy(ITEM.CREATED_AT.desc())
            .fetch(r -> new ItemSummaryResource(
                r.get(ITEM.ID),
                r.get(ITEM.SLUG),
                r.get(ITEM.TYPE),
                r.get(ITEM.NAME),
                Arrays.asList(r.get(ITEM.TAGS))
            ));
    }
}
```

- [ ] **Step 5: Create `ItemController.java`**

```java
package recipebase.server.item.resource;

import org.jspecify.annotations.Nullable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import recipebase.server.item.FindItemsUseCase;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/items")
public class ItemController {

    private final FindItemsUseCase findItemsUseCase;

    public ItemController(FindItemsUseCase findItemsUseCase) {
        this.findItemsUseCase = findItemsUseCase;
    }

    @GetMapping
    public List<ItemSummaryResource> list(
            @RequestParam @Nullable String q,
            @RequestParam @Nullable String type,
            @RequestParam(required = false) @Nullable List<String> tags) {
        return findItemsUseCase.execute(q, type, tags);
    }
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
./gradlew test --tests "recipebase.server.item.resource.ItemControllerIT"
```

Expected: BUILD SUCCESSFUL, all 6 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/main/java/recipebase/server/item/ \
        src/test/java/recipebase/server/item/
git commit -m "feat: item search endpoint GET /items"
```

---

### Task 6: Verify full build passes

- [ ] **Step 1: Run the full build**

```bash
./gradlew build
```

Expected: BUILD SUCCESSFUL. `ItemControllerIT` passes. `ServerApplicationTests` passes.

- [ ] **Step 2: If `ServerApplicationTests` fails due to missing beans**

The `ServerApplicationTests` context load test will fail if there are Spring beans that reference deleted classes. Verify there are no remaining references to deleted classes:

```bash
./gradlew compileJava compileTestJava
```

Fix any compilation errors before proceeding to Part 2.
