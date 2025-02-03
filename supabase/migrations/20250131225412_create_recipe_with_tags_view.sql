create view public.recipes_with_tags(id, created_at, name, description, slug, tag_ids, text) as
SELECT r.id,
       r.created_at,
       r.name,
       r.description,
       r.slug,
       array_agg(DISTINCT rt.tag_id) FILTER (WHERE rt.tag_id IS NOT NULL)          AS tag_ids,
       to_tsvector('english'::regconfig,
                   (((COALESCE(r.name, ''::text) || ' '::text) || COALESCE(r.description, ''::text)) || ' '::text) ||
                   COALESCE(string_agg(ing.ingredient_name, ' '::text), ''::text)) AS text
FROM recipes r
         LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
         LEFT JOIN LATERAL ( SELECT ingredient.value ->> 'name'::text AS ingredient_name
                             FROM jsonb_array_elements(r.ingredients) ingredient(value)) ing ON true
GROUP BY r.id;

ALTER VIEW public.recipes_with_tags SET (security_invoker = on);