# AGENTS.md

Recipe manager — Java/Spring Boot 4 backend + Angular 21 frontend. Early stage, schema done, feature code just starting.

## Structure

```
/
├── src/main/java/recipebase/server/   # Spring Boot app (Java 25)
├── src/main/resources/db/changelog/   # Liquibase migrations
├── src/test/java/recipebase/server/   # Tests (JUnit 6 + Mockito + AssertJ)
├── build.gradle.kts                   # Gradle build, jOOQ codegen config
└── frontend/                          # Angular 21 app
    └── src/app/
        ├── shared/                    # Zard UI infra, utilities
        └── features/                  # (to be created) lazy-loaded feature dirs
```

## Commands

### Backend

```bash
./gradlew build                    # compile + test
./gradlew test                     # tests only
./gradlew test --tests "XxxTest"   # single test class
./gradlew bootRun                  # dev server (default port 8080)
./gradlew jooqCodegen              # regenerate jOOQ types (runs automatically before compileJava)
```

### Frontend

```bash
cd frontend
npx ng serve                       # dev server (localhost:4200)
npx ng build                       # production build
npx ng test                        # unit tests (Vitest)
npx zard-cli add <component>       # add Zard UI component to shared/
npx @biomejs/biome check --write   # format + lint (MUST run after any frontend edit)
```

## jOOQ codegen

`./gradlew compileJava` auto-triggers `jooqCodegen` which:

1. Spins up EmbeddedPostgres on port 15432
2. Runs all Liquibase migrations against it
3. Generates types into `build/generated-sources/jooq` package `recipebase.data`

Schema changes → edit `src/main/resources/db/changelog/*.sql` → re-run `./gradlew jooqCodegen`.

## Conventions

Detailed rules live in `.opencode/skills/` — load the relevant skill when working on that part of the codebase.
## Architecture notes

- jOOQ (not JPA) — entities are records, no mutable-entity constraint.
- DB: PostgreSQL (prod), SQLite (runtime dep listed). Embedded PostgreSQL for tests (Zonky).
- Schema: `recipe` → `recipe_variant` → `recipe_component` → `recipe_ingredient` + `recipe_step`. JSONB columns for `quantity`, `link`, `attachment` — these map to Java sealed types with Jackson `@JsonTypeInfo`.
- Spring AI with Anthropic Claude for import pipeline — see `docs/specs/importing.md`.
- Spring Batch for import orchestration.
- `@CrossOrigin` on controllers — no shared CORS config yet.
- No CI, no Docker, no deploy pipeline yet.
