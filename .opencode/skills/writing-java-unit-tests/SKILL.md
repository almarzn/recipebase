---
name: writing-java-unit-tests
description: Use when writing or modifying Java unit tests with JUnit 6, Mockito, or AssertJ in the Spring Boot backend
license: MIT
metadata:
  language: java
  framework: spring-boot
---

## Core principles

### Test only real logic
- Only test methods with actual logic branching, calculations, or side effects.
- Skip trivial getters, setters, simple record accessors, or pass-through delegators.
- When in doubt whether something is worth testing, ask the user.

### Dependencies
All dependencies are already available via Spring Boot BOM — no need to add them to `build.gradle.kts`:
- JUnit Jupiter 6 (`org.junit.jupiter:junit-jupiter`)
- Mockito (`org.mockito:mockito-core`, `org.mockito:mockito-junit-jupiter`)
- AssertJ (`org.assertj:assertj-core`)

### Test class conventions
- Place tests in `src/test/java/recipebase/server/` mirroring the main source tree.
- Name: `<ClassName>Test.java` (e.g., `RecipeServiceTest`).
- No `public` modifier on test classes or methods (JUnit 6 doesn't require it).
- Use `@ExtendWith(MockitoExtension.class)` for unit tests with mocks.
- Use `@Mock` for dependencies, `@InjectMocks` for the class under test.

```java
package recipebase.server.recipes;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    RecipeRepository repository;

    @InjectMocks
    RecipeService service;

    @Test
    void returnsEmptyWhenNoRecipes() {
        when(repository.findAll()).thenReturn(List.of());

        var result = service.getActiveRecipes();

        assertThat(result).isEmpty();
    }
}
```

### Assertions — AssertJ always
- Use `assertThat(actual).<assertion>()` fluent API exclusively.
- Never use JUnit's `assertEquals`, `assertTrue`, etc.
- Common patterns:
  - `assertThat(result).isEmpty()` / `.isNotEmpty()`
  - `assertThat(result).hasSize(2)`
  - `assertThat(result).containsExactly(a, b)`
  - `assertThat(result).extracting(Record::field).containsExactly(1, 2)`
  - `assertThat(result).isNull()` / `.isNotNull()`
  - `assertThat(result).isEqualTo(expected)`
  - `assertThat(result).isInstanceOf(ExpectedType.class)`
  - `assertThatThrownBy(() -> ...).isInstanceOf(SomeException.class).hasMessage("...")`

### Mockito conventions
- Stub with `when(...).thenReturn(...)` / `.thenThrow(...)`.
- Verify interactions only when they are the point of the test: `verify(mock).method(args)`.
- Use `ArgumentCaptor` sparingly — prefer verifying with `eq()` matchers.
- Use `@Mock` (not manual `mock()`) for cleaner setup.
- `lenient()` stubs only when truly needed for shared setup.

### Test naming
- Method names describe the scenario: `returnsEmptyWhenNoRecipes`, `throwsOnInvalidId`, `mapsToDomainCorrectly`.
- No `@DisplayName` unless the scenario is complex enough to warrant it.
- No `given/when/then` comments — the code structure should make that obvious.

### What to test
Focus on:
- Conditional branches (`if`, `switch`, ternary)
- Validation logic (invalid input → exception)
- Transformations and mappings
- Edge cases (empty input, boundary values, nulls where `@Nullable`)
- Error handling paths

Skip:
- Trivial delegations (method just calls `repository.save(x)` and returns)
- Framework plumbing (Spring wiring, serialization)
- POJO/record constructors with no validation logic

### Parameterized tests
Use `@ParameterizedTest` with `@MethodSource` or `@CsvSource` when testing multiple input variations of the same logic:

```java
@ParameterizedTest
@CsvSource({
    "0, INACTIVE",
    "1, ACTIVE",
    "2, ACTIVE"
})
void mapsStatus(int recipeCount, Status expected) {
    assertThat(service.deriveStatus(recipeCount)).isEqualTo(expected);
}
```

## Running tests
```bash
./gradlew test                         # all tests
./gradlew test --tests "RecipeServiceTest"  # single class
```

## Style
Follow the `writing-java` skill conventions: `var`, records, no comments, functional style.
