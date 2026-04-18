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
