package recipebase.server.recipe.model;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;
import tools.jackson.databind.EnumNamingStrategies;
import tools.jackson.databind.annotation.EnumNaming;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "quality")
public sealed interface Link {
    @JsonTypeName("external")
    record ExternalRecipe(String slug, String title, ExternalLinkMode link) implements Link {}

    @JsonTypeName("self")
    record Self() implements Link {}

    @EnumNaming(EnumNamingStrategies.SnakeCaseStrategy.class)
    enum ExternalLinkMode {
        SNAPSHOT, LINKED
    }
}
