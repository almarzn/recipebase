# Schema Migration — Part 3: Assembly API

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full CRUD for assemblies and their components (references to other items with scale factor and lock/snapshot support).

**Architecture:** `assembly/` package mirrors the `recipe/` pattern. Assembly components reference other items by slug. When `locked=true`, the backend captures the referenced item's current `{id, slug, type, name}` as `lock_snapshot` JSONB. `lock_snapshot` flows as raw `String` (JSON text) through jOOQ `JSONB`, serialized to the client as a JSON object.

**Tech Stack:** Spring Boot 4, jOOQ 3.21, JUnit 6, MockMvc, Zonky EmbeddedPostgres

**Prerequisite:** Part 1 complete (DB schema, jOOQ types). Part 2 not required.

**Spec:** `docs/superpowers/specs/2026-04-18-schema-migration-design.md`

---

### Task 1: Assembly resource types (records only — no logic)

**Files:**
- Create: `src/main/java/recipebase/server/assembly/resource/AssemblyComponentResource.java`
- Create: `src/main/java/recipebase/server/assembly/resource/AssemblyResource.java`
- Create: `src/main/java/recipebase/server/assembly/resource/CreateAssemblyRequest.java`
- Create: `src/main/java/recipebase/server/assembly/resource/UpdateAssemblyRequest.java`
- Create: `src/main/java/recipebase/server/assembly/resource/AddAssemblyComponentRequest.java`
- Create: `src/main/java/recipebase/server/assembly/resource/UpdateAssemblyComponentRequest.java`

- [ ] **Step 1: Create `AssemblyComponentResource.java`**

`lock_snapshot` is carried as a raw JSON string; Jackson renders it inline when serialized via `@JsonRawValue`.

```java
package recipebase.server.assembly.resource;

import com.fasterxml.jackson.annotation.JsonRawValue;
import org.jspecify.annotations.Nullable;
import java.math.BigDecimal;
import java.util.UUID;

public record AssemblyComponentResource(
    UUID id,
    String slug,
    int compOrder,
    UUID itemId,
    String itemSlug,
    String itemName,
    String itemType,
    BigDecimal scaleFactor,
    boolean locked,
    @JsonRawValue @Nullable String lockSnapshot
) {}
```

- [ ] **Step 2: Create `AssemblyResource.java`**

```java
package recipebase.server.assembly.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Yield;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AssemblyResource(
    UUID id,
    String slug,
    String name,
    List<String> tags,
    @Nullable Yield yield,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<AssemblyComponentResource> components
) {}
```

- [ ] **Step 3: Create `CreateAssemblyRequest.java`**

```java
package recipebase.server.assembly.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Yield;
import java.util.List;

public record CreateAssemblyRequest(
    String name,
    List<String> tags,
    @Nullable Yield yield
) {}
```

- [ ] **Step 4: Create `UpdateAssemblyRequest.java`**

```java
package recipebase.server.assembly.resource;

import org.jspecify.annotations.Nullable;
import recipebase.server.recipe.model.Yield;
import java.util.List;

public record UpdateAssemblyRequest(
    String name,
    List<String> tags,
    @Nullable Yield yield
) {}
```

- [ ] **Step 5: Create `AddAssemblyComponentRequest.java`**

```java
package recipebase.server.assembly.resource;

import java.math.BigDecimal;

public record AddAssemblyComponentRequest(
    String itemSlug,
    BigDecimal scaleFactor
) {}
```

- [ ] **Step 6: Create `UpdateAssemblyComponentRequest.java`**

```java
package recipebase.server.assembly.resource;

import java.math.BigDecimal;

public record UpdateAssemblyComponentRequest(
    BigDecimal scaleFactor,
    boolean locked
) {}
```

- [ ] **Step 7: Verify compilation**

```bash
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL.

- [ ] **Step 8: Commit**

```bash
git add src/main/java/recipebase/server/assembly/
git commit -m "feat: assembly resource types"
```

---

### Task 2: Use case stubs + AssemblyController

**Files:**
- Create: `src/main/java/recipebase/server/assembly/CreateAssemblyUseCase.java`
- Create: `src/main/java/recipebase/server/assembly/FindAssemblyBySlugUseCase.java`
- Create: `src/main/java/recipebase/server/assembly/UpdateAssemblyUseCase.java`
- Create: `src/main/java/recipebase/server/assembly/DeleteAssemblyUseCase.java`
- Create: `src/main/java/recipebase/server/assembly/AddAssemblyComponentUseCase.java`
- Create: `src/main/java/recipebase/server/assembly/UpdateAssemblyComponentUseCase.java`
- Create: `src/main/java/recipebase/server/assembly/DeleteAssemblyComponentUseCase.java`
- Create: `src/main/java/recipebase/server/assembly/resource/AssemblyController.java`

- [ ] **Step 1: Create stub use cases**

`CreateAssemblyUseCase.java`:
```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import recipebase.server.assembly.resource.CreateAssemblyRequest;

@Repository
public class CreateAssemblyUseCase {
    public CreateAssemblyUseCase(DSLContext dsl) {}
    public AssemblyResource execute(CreateAssemblyRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`FindAssemblyBySlugUseCase.java`:
```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import java.util.Optional;

@Repository
public class FindAssemblyBySlugUseCase {
    public FindAssemblyBySlugUseCase(DSLContext dsl) {}
    public Optional<AssemblyResource> execute(String slug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`UpdateAssemblyUseCase.java`:
```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import recipebase.server.assembly.resource.UpdateAssemblyRequest;
import java.util.Optional;

@Repository
public class UpdateAssemblyUseCase {
    public UpdateAssemblyUseCase(DSLContext dsl) {}
    public Optional<AssemblyResource> execute(String slug, UpdateAssemblyRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`DeleteAssemblyUseCase.java`:
```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class DeleteAssemblyUseCase {
    public DeleteAssemblyUseCase(DSLContext dsl) {}
    public boolean execute(String slug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`AddAssemblyComponentUseCase.java`:
```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AddAssemblyComponentRequest;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import java.util.Optional;

@Repository
public class AddAssemblyComponentUseCase {
    public AddAssemblyComponentUseCase(DSLContext dsl) {}
    public Optional<AssemblyComponentResource> execute(String assemblySlug, AddAssemblyComponentRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`UpdateAssemblyComponentUseCase.java`:
```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import recipebase.server.assembly.resource.UpdateAssemblyComponentRequest;
import java.util.Optional;

@Repository
public class UpdateAssemblyComponentUseCase {
    public UpdateAssemblyComponentUseCase(DSLContext dsl) {}
    public Optional<AssemblyComponentResource> execute(
            String assemblySlug, String componentSlug, UpdateAssemblyComponentRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

`DeleteAssemblyComponentUseCase.java`:
```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class DeleteAssemblyComponentUseCase {
    public DeleteAssemblyComponentUseCase(DSLContext dsl) {}
    public boolean execute(String assemblySlug, String componentSlug) {
        throw new UnsupportedOperationException("not implemented");
    }
}
```

- [ ] **Step 2: Create `AssemblyController.java`**

```java
package recipebase.server.assembly.resource;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import recipebase.server.assembly.*;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/assemblies")
public class AssemblyController {

    private final CreateAssemblyUseCase createAssemblyUseCase;
    private final FindAssemblyBySlugUseCase findAssemblyBySlugUseCase;
    private final UpdateAssemblyUseCase updateAssemblyUseCase;
    private final DeleteAssemblyUseCase deleteAssemblyUseCase;
    private final AddAssemblyComponentUseCase addAssemblyComponentUseCase;
    private final UpdateAssemblyComponentUseCase updateAssemblyComponentUseCase;
    private final DeleteAssemblyComponentUseCase deleteAssemblyComponentUseCase;

    public AssemblyController(
            CreateAssemblyUseCase createAssemblyUseCase,
            FindAssemblyBySlugUseCase findAssemblyBySlugUseCase,
            UpdateAssemblyUseCase updateAssemblyUseCase,
            DeleteAssemblyUseCase deleteAssemblyUseCase,
            AddAssemblyComponentUseCase addAssemblyComponentUseCase,
            UpdateAssemblyComponentUseCase updateAssemblyComponentUseCase,
            DeleteAssemblyComponentUseCase deleteAssemblyComponentUseCase) {
        this.createAssemblyUseCase = createAssemblyUseCase;
        this.findAssemblyBySlugUseCase = findAssemblyBySlugUseCase;
        this.updateAssemblyUseCase = updateAssemblyUseCase;
        this.deleteAssemblyUseCase = deleteAssemblyUseCase;
        this.addAssemblyComponentUseCase = addAssemblyComponentUseCase;
        this.updateAssemblyComponentUseCase = updateAssemblyComponentUseCase;
        this.deleteAssemblyComponentUseCase = deleteAssemblyComponentUseCase;
    }

    @PostMapping
    public ResponseEntity<AssemblyResource> create(@RequestBody CreateAssemblyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(createAssemblyUseCase.execute(request));
    }

    @GetMapping("{slug}")
    public ResponseEntity<AssemblyResource> findBySlug(@PathVariable String slug) {
        return ResponseEntity.of(findAssemblyBySlugUseCase.execute(slug));
    }

    @GetMapping("{slug}/components")
    public ResponseEntity<List<AssemblyComponentResource>> findComponents(@PathVariable String slug) {
        return findAssemblyBySlugUseCase.execute(slug)
            .map(a -> ResponseEntity.ok(a.components()))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{slug}")
    public ResponseEntity<AssemblyResource> update(
            @PathVariable String slug,
            @RequestBody UpdateAssemblyRequest request) {
        return ResponseEntity.of(updateAssemblyUseCase.execute(slug, request));
    }

    @DeleteMapping("{slug}")
    public ResponseEntity<Void> delete(@PathVariable String slug) {
        return deleteAssemblyUseCase.execute(slug)
            ? ResponseEntity.noContent().build()
            : ResponseEntity.notFound().build();
    }

    @PostMapping("{slug}/components")
    public ResponseEntity<AssemblyComponentResource> addComponent(
            @PathVariable String slug,
            @RequestBody AddAssemblyComponentRequest request) {
        return addAssemblyComponentUseCase.execute(slug, request)
            .map(c -> ResponseEntity.status(HttpStatus.CREATED).<AssemblyComponentResource>body(c))
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("{slug}/components/{componentSlug}")
    public ResponseEntity<AssemblyComponentResource> updateComponent(
            @PathVariable String slug,
            @PathVariable String componentSlug,
            @RequestBody UpdateAssemblyComponentRequest request) {
        return ResponseEntity.of(
            updateAssemblyComponentUseCase.execute(slug, componentSlug, request));
    }

    @DeleteMapping("{slug}/components/{componentSlug}")
    public ResponseEntity<Void> deleteComponent(
            @PathVariable String slug,
            @PathVariable String componentSlug) {
        return deleteAssemblyComponentUseCase.execute(slug, componentSlug)
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
git add src/main/java/recipebase/server/assembly/
git commit -m "feat: assembly use case stubs + controller"
```

---

### Task 3: AssemblyControllerIT setup + CreateAssemblyUseCase

**Files:**
- Create: `src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java`
- Modify: `src/main/java/recipebase/server/assembly/CreateAssemblyUseCase.java`

- [ ] **Step 1: Create test class with setup + create test**

```java
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
```

- [ ] **Step 2: Run to see it fail**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.create_returnsCreatedAssembly"
```

Expected: FAIL — 500 (stub throws).

- [ ] **Step 3: Implement `CreateAssemblyUseCase`**

```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import recipebase.server.assembly.resource.CreateAssemblyRequest;
import recipebase.server.recipe.SlugUtil;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class CreateAssemblyUseCase {

    private final DSLContext dsl;

    public CreateAssemblyUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public AssemblyResource execute(CreateAssemblyRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();
            var now = OffsetDateTime.now();
            var itemId = UUID.randomUUID();
            var assemblyId = UUID.randomUUID();
            var slug = SlugUtil.slugify(request.name());

            c.insertInto(ITEM)
                .set(ITEM.ID, itemId)
                .set(ITEM.SLUG, slug)
                .set(ITEM.TYPE, "assembly")
                .set(ITEM.NAME, request.name())
                .set(ITEM.TAGS, request.tags() != null
                    ? request.tags().toArray(String[]::new)
                    : new String[0])
                .set(ITEM.CREATED_AT, now)
                .set(ITEM.UPDATED_AT, now)
                .execute();

            c.insertInto(ASSEMBLY)
                .set(ASSEMBLY.ID, assemblyId)
                .set(ASSEMBLY.ITEM_ID, itemId)
                .set(ASSEMBLY.YIELD, request.yield())
                .execute();

            return new AssemblyResource(
                itemId, slug, request.name(),
                request.tags() != null ? request.tags() : List.of(),
                request.yield(),
                now, now,
                List.of()
            );
        });
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.create_returnsCreatedAssembly"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/assembly/CreateAssemblyUseCase.java \
        src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java
git commit -m "feat: POST /assemblies — CreateAssemblyUseCase"
```

---

### Task 4: FindAssemblyBySlugUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/assembly/FindAssemblyBySlugUseCase.java`
- Modify: `src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java`

- [ ] **Step 1: Add failing tests**

Add to `AssemblyControllerIT`:

```java
// ============================================================
// GET /assemblies/:slug
// ============================================================

@Test
void findBySlug_returnsAssemblyWithComponents() throws Exception {
    mockMvc.perform(get("/assemblies/holiday-menu").accept(MediaType.APPLICATION_JSON))
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
    mockMvc.perform(get("/assemblies/nonexistent").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
}

@Test
void findComponents_returnsFlatList() throws Exception {
    mockMvc.perform(get("/assemblies/holiday-menu/components").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].slug").value("main-course"));
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.findBySlug_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `FindAssemblyBySlugUseCase`**

```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.JSONB;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import recipebase.server.assembly.resource.AssemblyResource;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.jooq.impl.DSL.multiset;
import static org.jooq.impl.DSL.select;
import static recipebase.data.Tables.*;

@Repository
public class FindAssemblyBySlugUseCase {

    private final DSLContext dsl;

    public FindAssemblyBySlugUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<AssemblyResource> execute(String slug) {
        var compsField = componentsField();

        return Optional.ofNullable(
            dsl.select(
                ITEM.ID, ITEM.SLUG, ITEM.NAME, ITEM.TAGS, ITEM.CREATED_AT, ITEM.UPDATED_AT,
                ASSEMBLY.YIELD,
                compsField
            )
            .from(ITEM)
            .join(ASSEMBLY).on(ASSEMBLY.ITEM_ID.eq(ITEM.ID))
            .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("assembly")))
            .fetchOne(r -> new AssemblyResource(
                r.get(ITEM.ID),
                r.get(ITEM.SLUG),
                r.get(ITEM.NAME),
                Arrays.asList(r.get(ITEM.TAGS)),
                r.get(ASSEMBLY.YIELD),
                r.get(ITEM.CREATED_AT),
                r.get(ITEM.UPDATED_AT),
                r.get(compsField)
            ))
        );
    }

    private Field<List<AssemblyComponentResource>> componentsField() {
        var refItem = ITEM.as("ref_item");
        var refSlug = refItem.SLUG.as("ref_slug");
        var refName = refItem.NAME.as("ref_name");
        var refType = refItem.TYPE.as("ref_type");

        return multiset(
            select(
                ASSEMBLY_COMPONENT.ID, ASSEMBLY_COMPONENT.SLUG, ASSEMBLY_COMPONENT.COMP_ORDER,
                ASSEMBLY_COMPONENT.ITEM_ID, ASSEMBLY_COMPONENT.SCALE_FACTOR,
                ASSEMBLY_COMPONENT.LOCKED, ASSEMBLY_COMPONENT.LOCK_SNAPSHOT,
                refSlug, refName, refType
            )
            .from(ASSEMBLY_COMPONENT)
            .join(refItem).on(refItem.ID.eq(ASSEMBLY_COMPONENT.ITEM_ID))
            .where(ASSEMBLY_COMPONENT.ASSEMBLY_ID.eq(ASSEMBLY.ID))
            .orderBy(ASSEMBLY_COMPONENT.COMP_ORDER)
        ).convertFrom(result -> result.map(row -> new AssemblyComponentResource(
            row.get(ASSEMBLY_COMPONENT.ID),
            row.get(ASSEMBLY_COMPONENT.SLUG),
            row.get(ASSEMBLY_COMPONENT.COMP_ORDER),
            row.get(ASSEMBLY_COMPONENT.ITEM_ID),
            row.get(refSlug),
            row.get(refName),
            row.get(refType),
            row.get(ASSEMBLY_COMPONENT.SCALE_FACTOR),
            row.get(ASSEMBLY_COMPONENT.LOCKED),
            toJsonString(row.get(ASSEMBLY_COMPONENT.LOCK_SNAPSHOT))
        )));
    }

    private static String toJsonString(JSONB jsonb) {
        return jsonb == null ? null : jsonb.data();
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.findBySlug_*" \
               --tests "recipebase.server.assembly.resource.AssemblyControllerIT.findComponents_*"
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/assembly/FindAssemblyBySlugUseCase.java \
        src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java
git commit -m "feat: GET /assemblies/:slug — FindAssemblyBySlugUseCase"
```

---

### Task 5: UpdateAssemblyUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/assembly/UpdateAssemblyUseCase.java`
- Modify: `src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java`

- [ ] **Step 1: Add failing tests**

Add to `AssemblyControllerIT`:

```java
// ============================================================
// PUT /assemblies/:slug
// ============================================================

@Test
void update_returnsUpdatedAssembly() throws Exception {
    mockMvc.perform(put("/assemblies/holiday-menu")
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
    mockMvc.perform(put("/assemblies/nonexistent")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"name": "X", "tags": [], "yield": null}
            """))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.update_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `UpdateAssemblyUseCase`**

```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyResource;
import recipebase.server.assembly.resource.UpdateAssemblyRequest;

import java.time.OffsetDateTime;
import java.util.Optional;

import static recipebase.data.Tables.*;

@Repository
public class UpdateAssemblyUseCase {

    private final DSLContext dsl;
    private final FindAssemblyBySlugUseCase findAssemblyBySlugUseCase;

    public UpdateAssemblyUseCase(DSLContext dsl, FindAssemblyBySlugUseCase findAssemblyBySlugUseCase) {
        this.dsl = dsl;
        this.findAssemblyBySlugUseCase = findAssemblyBySlugUseCase;
    }

    public Optional<AssemblyResource> execute(String slug, UpdateAssemblyRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            int itemUpdated = c.update(ITEM)
                .set(ITEM.NAME, request.name())
                .set(ITEM.TAGS, request.tags() != null
                    ? request.tags().toArray(String[]::new)
                    : new String[0])
                .set(ITEM.UPDATED_AT, OffsetDateTime.now())
                .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("assembly")))
                .execute();

            if (itemUpdated == 0) return Optional.empty();

            c.update(ASSEMBLY)
                .set(ASSEMBLY.YIELD, request.yield())
                .from(ITEM)
                .where(ASSEMBLY.ITEM_ID.eq(ITEM.ID).and(ITEM.SLUG.eq(slug)))
                .execute();

            return findAssemblyBySlugUseCase.execute(slug);
        });
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.update_*"
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/assembly/UpdateAssemblyUseCase.java \
        src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java
git commit -m "feat: PUT /assemblies/:slug — UpdateAssemblyUseCase"
```

---

### Task 6: DeleteAssemblyUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/assembly/DeleteAssemblyUseCase.java`
- Modify: `src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java`

- [ ] **Step 1: Add failing tests**

Add to `AssemblyControllerIT`:

```java
// ============================================================
// DELETE /assemblies/:slug
// ============================================================

@Test
void delete_removes204() throws Exception {
    mockMvc.perform(delete("/assemblies/holiday-menu"))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/assemblies/holiday-menu"))
        .andExpect(status().isNotFound());
}

@Test
void delete_returnsNotFoundForUnknownSlug() throws Exception {
    mockMvc.perform(delete("/assemblies/nonexistent"))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.delete_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `DeleteAssemblyUseCase`**

```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static recipebase.data.Tables.ITEM;

@Repository
public class DeleteAssemblyUseCase {

    private final DSLContext dsl;

    public DeleteAssemblyUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public boolean execute(String slug) {
        int deleted = dsl.deleteFrom(ITEM)
            .where(ITEM.SLUG.eq(slug).and(ITEM.TYPE.eq("assembly")))
            .execute();
        return deleted > 0;
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.delete_*"
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/assembly/DeleteAssemblyUseCase.java \
        src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java
git commit -m "feat: DELETE /assemblies/:slug — DeleteAssemblyUseCase"
```

---

### Task 7: AddAssemblyComponentUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/assembly/AddAssemblyComponentUseCase.java`
- Modify: `src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java`

- [ ] **Step 1: Add failing tests**

Add to `AssemblyControllerIT`:

```java
// ============================================================
// POST /assemblies/:slug/components
// ============================================================

@Test
void addComponent_addsComponentAndReturnsIt() throws Exception {
    mockMvc.perform(post("/assemblies/holiday-menu/components")
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
    mockMvc.perform(post("/assemblies/nonexistent/components")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"itemSlug": "chocolate-cake", "scaleFactor": 1.0}
            """))
        .andExpect(status().isNotFound());
}

@Test
void addComponent_returnsNotFoundForUnknownItem() throws Exception {
    mockMvc.perform(post("/assemblies/holiday-menu/components")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"itemSlug": "nonexistent-item", "scaleFactor": 1.0}
            """))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.addComponent_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `AddAssemblyComponentUseCase`**

```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AddAssemblyComponentRequest;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import recipebase.server.recipe.SlugUtil;

import java.util.Optional;
import java.util.UUID;

import static recipebase.data.Tables.*;

@Repository
public class AddAssemblyComponentUseCase {

    private final DSLContext dsl;

    public AddAssemblyComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public Optional<AssemblyComponentResource> execute(String assemblySlug, AddAssemblyComponentRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            var assemblyId = c.select(ASSEMBLY.ID)
                .from(ASSEMBLY)
                .join(ITEM).on(ITEM.ID.eq(ASSEMBLY.ITEM_ID))
                .where(ITEM.SLUG.eq(assemblySlug).and(ITEM.TYPE.eq("assembly")))
                .fetchOptional(ASSEMBLY.ID);

            if (assemblyId.isEmpty()) return Optional.empty();

            var refItem = c.select(ITEM.ID, ITEM.SLUG, ITEM.NAME, ITEM.TYPE)
                .from(ITEM)
                .where(ITEM.SLUG.eq(request.itemSlug()))
                .fetchOptional();

            if (refItem.isEmpty()) return Optional.empty();

            int maxOrder = c.select(ASSEMBLY_COMPONENT.COMP_ORDER.max())
                .from(ASSEMBLY_COMPONENT)
                .where(ASSEMBLY_COMPONENT.ASSEMBLY_ID.eq(assemblyId.get()))
                .fetchOne(0, int.class);
            int compOrder = maxOrder + 1;

            var compId = UUID.randomUUID();
            String compSlug = SlugUtil.slugify(refItem.get().get(ITEM.NAME));

            c.insertInto(ASSEMBLY_COMPONENT)
                .set(ASSEMBLY_COMPONENT.ID, compId)
                .set(ASSEMBLY_COMPONENT.ASSEMBLY_ID, assemblyId.get())
                .set(ASSEMBLY_COMPONENT.SLUG, compSlug)
                .set(ASSEMBLY_COMPONENT.COMP_ORDER, compOrder)
                .set(ASSEMBLY_COMPONENT.ITEM_ID, refItem.get().get(ITEM.ID))
                .set(ASSEMBLY_COMPONENT.SCALE_FACTOR, request.scaleFactor())
                .set(ASSEMBLY_COMPONENT.LOCKED, false)
                .execute();

            return Optional.of(new AssemblyComponentResource(
                compId,
                compSlug,
                compOrder,
                refItem.get().get(ITEM.ID),
                refItem.get().get(ITEM.SLUG),
                refItem.get().get(ITEM.NAME),
                refItem.get().get(ITEM.TYPE),
                request.scaleFactor(),
                false,
                null
            ));
        });
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.addComponent_*"
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/assembly/AddAssemblyComponentUseCase.java \
        src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java
git commit -m "feat: POST /assemblies/:slug/components — AddAssemblyComponentUseCase"
```

---

### Task 8: UpdateAssemblyComponentUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/assembly/UpdateAssemblyComponentUseCase.java`
- Modify: `src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java`

The lock mechanic: when `locked=true` and the component is currently unlocked, capture a snapshot of the referenced item's current `{id, slug, type, name}` as JSONB. When `locked=false`, clear the snapshot.

- [ ] **Step 1: Add failing tests**

Add to `AssemblyControllerIT`:

```java
// ============================================================
// PUT /assemblies/:slug/components/:componentSlug
// ============================================================

@Test
void updateComponent_updatesScaleFactor() throws Exception {
    mockMvc.perform(put("/assemblies/holiday-menu/components/main-course")
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
    mockMvc.perform(put("/assemblies/holiday-menu/components/main-course")
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
    mockMvc.perform(put("/assemblies/holiday-menu/components/nonexistent")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
            {"scaleFactor": 1.0, "locked": false}
            """))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.updateComponent_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `UpdateAssemblyComponentUseCase`**

```java
package recipebase.server.assembly;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jooq.DSLContext;
import org.jooq.JSONB;
import org.springframework.stereotype.Repository;
import recipebase.server.assembly.resource.AssemblyComponentResource;
import recipebase.server.assembly.resource.UpdateAssemblyComponentRequest;

import java.util.Map;
import java.util.Optional;

import static recipebase.data.Tables.*;

@Repository
public class UpdateAssemblyComponentUseCase {

    private final DSLContext dsl;
    private final ObjectMapper objectMapper;

    public UpdateAssemblyComponentUseCase(DSLContext dsl, ObjectMapper objectMapper) {
        this.dsl = dsl;
        this.objectMapper = objectMapper;
    }

    public Optional<AssemblyComponentResource> execute(
            String assemblySlug, String componentSlug, UpdateAssemblyComponentRequest request) {
        return dsl.transactionResult(cfg -> {
            var c = cfg.dsl();

            // Step 1: find the component via assembly slug
            var comp = c.select(
                    ASSEMBLY_COMPONENT.ID, ASSEMBLY_COMPONENT.COMP_ORDER,
                    ASSEMBLY_COMPONENT.ITEM_ID)
                .from(ASSEMBLY_COMPONENT)
                .join(ASSEMBLY).on(ASSEMBLY.ID.eq(ASSEMBLY_COMPONENT.ASSEMBLY_ID))
                .join(ITEM).on(ITEM.ID.eq(ASSEMBLY.ITEM_ID))
                .where(ITEM.SLUG.eq(assemblySlug)
                    .and(ITEM.TYPE.eq("assembly"))
                    .and(ASSEMBLY_COMPONENT.SLUG.eq(componentSlug)))
                .fetchOptional();

            if (comp.isEmpty()) return Optional.empty();

            // Step 2: fetch the referenced item for snapshot / response
            var refItem = c.select(ITEM.SLUG, ITEM.NAME, ITEM.TYPE)
                .from(ITEM)
                .where(ITEM.ID.eq(comp.get().get(ASSEMBLY_COMPONENT.ITEM_ID)))
                .fetchOne();

            boolean nowLocked = request.locked();
            JSONB snapshot = null;

            if (nowLocked) {
                var snapshotMap = Map.of(
                    "id",   comp.get().get(ASSEMBLY_COMPONENT.ITEM_ID).toString(),
                    "slug", refItem.get(ITEM.SLUG),
                    "name", refItem.get(ITEM.NAME),
                    "type", refItem.get(ITEM.TYPE)
                );
                try {
                    snapshot = JSONB.valueOf(objectMapper.writeValueAsString(snapshotMap));
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }

            c.update(ASSEMBLY_COMPONENT)
                .set(ASSEMBLY_COMPONENT.SCALE_FACTOR, request.scaleFactor())
                .set(ASSEMBLY_COMPONENT.LOCKED, nowLocked)
                .set(ASSEMBLY_COMPONENT.LOCK_SNAPSHOT, snapshot)
                .where(ASSEMBLY_COMPONENT.ID.eq(comp.get().get(ASSEMBLY_COMPONENT.ID)))
                .execute();

            return Optional.of(new AssemblyComponentResource(
                comp.get().get(ASSEMBLY_COMPONENT.ID),
                componentSlug,
                comp.get().get(ASSEMBLY_COMPONENT.COMP_ORDER),
                comp.get().get(ASSEMBLY_COMPONENT.ITEM_ID),
                refItem.get(ITEM.SLUG),
                refItem.get(ITEM.NAME),
                refItem.get(ITEM.TYPE),
                request.scaleFactor(),
                nowLocked,
                snapshot != null ? snapshot.data() : null
            ));
        });
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.updateComponent_*"
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/main/java/recipebase/server/assembly/UpdateAssemblyComponentUseCase.java \
        src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java
git commit -m "feat: PUT /assemblies/:slug/components/:slug — UpdateAssemblyComponentUseCase"
```

---

### Task 9: DeleteAssemblyComponentUseCase

**Files:**
- Modify: `src/main/java/recipebase/server/assembly/DeleteAssemblyComponentUseCase.java`
- Modify: `src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java`

- [ ] **Step 1: Add failing tests**

Add to `AssemblyControllerIT`:

```java
// ============================================================
// DELETE /assemblies/:slug/components/:componentSlug
// ============================================================

@Test
void deleteComponent_removesComponent() throws Exception {
    mockMvc.perform(delete("/assemblies/holiday-menu/components/main-course"))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/assemblies/holiday-menu"))
        .andExpect(jsonPath("$.components.length()").value(0));
}

@Test
void deleteComponent_returnsNotFoundForUnknownComponent() throws Exception {
    mockMvc.perform(delete("/assemblies/holiday-menu/components/nonexistent"))
        .andExpect(status().isNotFound());
}
```

- [ ] **Step 2: Run to see them fail**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.deleteComponent_*"
```

Expected: FAIL — 500.

- [ ] **Step 3: Implement `DeleteAssemblyComponentUseCase`**

```java
package recipebase.server.assembly;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import static recipebase.data.Tables.*;

@Repository
public class DeleteAssemblyComponentUseCase {

    private final DSLContext dsl;

    public DeleteAssemblyComponentUseCase(DSLContext dsl) {
        this.dsl = dsl;
    }

    public boolean execute(String assemblySlug, String componentSlug) {
        int deleted = dsl.deleteFrom(ASSEMBLY_COMPONENT)
            .using(ASSEMBLY, ITEM)
            .where(ASSEMBLY_COMPONENT.ASSEMBLY_ID.eq(ASSEMBLY.ID)
                .and(ASSEMBLY.ITEM_ID.eq(ITEM.ID))
                .and(ITEM.SLUG.eq(assemblySlug))
                .and(ITEM.TYPE.eq("assembly"))
                .and(ASSEMBLY_COMPONENT.SLUG.eq(componentSlug)))
            .execute();
        return deleted > 0;
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT.deleteComponent_*"
```

Expected: both pass.

- [ ] **Step 5: Run the full assembly test suite**

```bash
./gradlew test --tests "recipebase.server.assembly.resource.AssemblyControllerIT"
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/main/java/recipebase/server/assembly/DeleteAssemblyComponentUseCase.java \
        src/test/java/recipebase/server/assembly/resource/AssemblyControllerIT.java
git commit -m "feat: DELETE /assemblies/:slug/components/:slug — DeleteAssemblyComponentUseCase"
```

---

### Task 10: Full Part 3 build verification

- [ ] **Step 1: Run the full build**

```bash
./gradlew build
```

Expected: BUILD SUCCESSFUL. All tests pass: `AssemblyControllerIT`, `ItemControllerIT`, `ServerApplicationTests`, and (if Part 2 complete) `RecipeControllerIT`.

- [ ] **Step 2: Spot-check with curl (optional, requires `./gradlew bootRun` running)**

```bash
# Create an assembly
curl -s -X POST http://localhost:8080/assemblies \
  -H "Content-Type: application/json" \
  -d '{"name":"Dinner Party","tags":["dinner"],"yield":{"quantity":4,"unit":"servings","description":null}}' | jq .

# Add a component referencing a recipe (requires a recipe to exist first)
RECIPE_SLUG=$(curl -s -X POST http://localhost:8080/recipes \
  -H "Content-Type: application/json" \
  -d '{"name":"Roast Chicken","tags":[],"source":{"type":"original"},"yield":null,"notes":null}' | jq -r .slug)

ASSEMBLY_SLUG=$(curl -s http://localhost:8080/assemblies | jq -r '.[0].slug')

curl -s -X POST "http://localhost:8080/assemblies/$ASSEMBLY_SLUG/components" \
  -H "Content-Type: application/json" \
  -d "{\"itemSlug\":\"$RECIPE_SLUG\",\"scaleFactor\":1.0}" | jq .

# List all items (should see both recipe and assembly)
curl -s http://localhost:8080/items | jq .
```
