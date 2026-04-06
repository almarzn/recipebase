package recipebase.server.model;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import org.jspecify.annotations.Nullable;
import tools.jackson.databind.EnumNamingStrategies;
import tools.jackson.databind.annotation.EnumNaming;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record RecipeResource(
        UUID id,
        String slug,
        String title,
        @Nullable String description,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        VariantContent current,
        List<VariantSummary> availableVariants
) {

    record VariantSummary(
            String slug,
            String name,
            @Nullable String description,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt
    ) {}

    record VariantContent(
            String slug,
            String name,
            @Nullable String description,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            List<Component> components
    ) {}

    record Ingredient(
            String slug,
            String name,
            @Nullable String notes,
            Quantity quantity
    ) {
        @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "unit")
        sealed interface Quantity {
            sealed interface DecimalAmount extends Quantity {
                @JsonTypeName("gram")
                record Gram(BigDecimal amount) implements DecimalAmount {}
                @JsonTypeName("kilogram")
                record Kilogram(BigDecimal amount) implements DecimalAmount {}
                @JsonTypeName("liter")
                record Liter(BigDecimal amount) implements DecimalAmount {}
                @JsonTypeName("milliliter")
                record Milliliter(BigDecimal amount) implements DecimalAmount {}
                @JsonTypeName("deciliter")
                record Deciliter(BigDecimal amount) implements DecimalAmount {}
                @JsonTypeName("centiliter")
                record Centiliter(BigDecimal amount) implements DecimalAmount {}
            }
            @JsonTypeName("unspecified")
            record Unspecified(String notes) implements Quantity {}
        }
    }

    record Component(
            UUID id,
            String title,
            Link link,
            @Nullable String description,
            List<Ingredient> ingredients,
            List<Step> steps
    ) {
        @EnumNaming(EnumNamingStrategies.SnakeCaseStrategy.class)
        enum ExternalLinkMode {
            SNAPSHOT, LINKED
        }

        @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "quality")
        sealed interface Link {
            @JsonTypeName("external")
            record ExternalRecipe(String slug, String title, ExternalLinkMode link) implements Link {}

            @JsonTypeName("self")
            record Self() implements Link {}
        }
    }

    record Step(
            UUID id,
            String text,
            @Nullable String notes,
            @Nullable TimerAttachment attachment
    ) {
        record TimerAttachment(Duration duration) {}
    }
}
