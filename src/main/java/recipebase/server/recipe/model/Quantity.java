package recipebase.server.recipe.model;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import java.math.BigDecimal;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
public sealed interface Quantity {
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    sealed interface Unit {
        @JsonTypeName("gram")
        record Gram() implements Unit {}

        @JsonTypeName("kilogram")
        record Kilogram() implements Unit {}

        @JsonTypeName("liter")
        record Liter() implements Unit {}

        @JsonTypeName("milliliter")
        record Milliliter() implements Unit {}

        @JsonTypeName("arbitrary")
        record Arbitrary() implements Unit {}

        @JsonTypeName("custom")
        record Custom(String name) implements Unit {}
    }

    @JsonTypeName("decimal")
    record DecimalAmount(Unit unit, BigDecimal amount) implements Quantity {}

    @JsonTypeName("interval")
    record Interval(
        Unit unit,
        BigDecimal from,
        BigDecimal to
    ) implements Quantity {}

    @JsonTypeName("unspecified")
    record Unspecified(String notes) implements Quantity {}
}
