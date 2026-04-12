package recipebase.server.recipe;

import java.util.UUID;

public final class SlugUtil {
	public static String slugify(String input) {
		var base = input
			.toLowerCase()
			.replaceAll("[^a-z0-9]+", "-")
			.replaceAll("^-+|-+$", "");

		var suffix = UUID.randomUUID().toString().substring(0, 8);
		return base + "-" + suffix;
	}
}
