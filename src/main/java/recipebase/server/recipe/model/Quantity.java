package recipebase.server.recipe.model;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.math.BigDecimal;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "unit")
public sealed interface Quantity {
    sealed interface DecimalAmount extends Quantity {
        @JsonTypeName("gram")
        record Gram(BigDecimal amount) implements DecimalAmount {}
        @JsonTypeName("kilogram")
        record Kilogram(BigDecimal amount) implements DecimalAmount {}
        @JsonTypeName("liter")
        record Liter(BigDecimal amount) implements DecimalAmount {}
        @JsonTypeName("milliliter")
        record Milliliter(BigDecimal amount) implements DecimalAmount {}
    }
    @JsonTypeName("unspecified")
    record Unspecified(String notes) implements Quantity {}
}
