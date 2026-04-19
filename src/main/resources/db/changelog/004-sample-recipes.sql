--liquibase formatted sql

-- ============================================================
-- Sample recipe: Pizza Dough
-- ============================================================
--changeset recipebase:004-pizza-dough-item
INSERT INTO item (id, slug, type, name, tags) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'pizza-dough', 'recipe', 'Pizza Dough', ARRAY['italian','baking','dough']);

--changeset recipebase:004-pizza-dough-recipe
INSERT INTO recipe (id, item_id, source, yield, notes) VALUES
    ('b1000000-0000-0000-0000-000000000001',
     'a1000000-0000-0000-0000-000000000001',
     '{"type":"original"}',
      '{"quantity":{"type":"decimal","unit":{"type":"custom","name":"pizzas"},"amount":2},"description":"two 30cm pizzas"}',
     'Let the dough cold-ferment overnight for best flavour.');

--changeset recipebase:004-pizza-dough-components
INSERT INTO recipe_component (id, recipe_id, slug, name, position) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'dough', 'Dough', 1);

--changeset recipebase:004-pizza-dough-ingredients
INSERT INTO recipe_ingredient (id, component_id, slug, name, quantity, notes, position) VALUES
    ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'bread-flour',    'Bread flour',        '{"type":"decimal","unit":{"type":"gram"},"amount":500}',  NULL,                  1),
    ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'water',          'Water',               '{"type":"decimal","unit":{"type":"milliliter"},"amount":325}', 'lukewarm',          2),
    ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'salt',           'Fine sea salt',       '{"type":"decimal","unit":{"type":"gram"},"amount":10}',   NULL,                  3),
    ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'yeast',          'Instant dry yeast',   '{"type":"decimal","unit":{"type":"gram"},"amount":3}',    NULL,                  4),
    ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'olive-oil',      'Olive oil',           '{"type":"decimal","unit":{"type":"milliliter"},"amount":20}',  NULL,              5);

--changeset recipebase:004-pizza-dough-steps
INSERT INTO recipe_step (id, component_id, slug, step_order, body, timer_seconds) VALUES
    ('e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'mix',         1, 'Dissolve yeast in lukewarm water. Add flour, salt, and olive oil. Mix until a shaggy dough forms.',  NULL),
    ('e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'knead',       2, 'Knead on a lightly floured surface for 10 minutes until smooth and elastic.', 600),
    ('e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'bulk-ferment',3, 'Place in a lightly oiled bowl, cover, and refrigerate overnight (12-24 h).', NULL),
    ('e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'shape',       4, 'Divide into 2 equal balls. Let rest at room temperature for 1 hour before shaping.', 3600);

-- ============================================================
-- Sample recipe: Paneer Spinach
-- ============================================================
--changeset recipebase:004-paneer-spinach-item
INSERT INTO item (id, slug, type, name, tags) VALUES
    ('a1000000-0000-0000-0000-000000000002', 'paneer-spinach', 'recipe', 'Paneer Spinach', ARRAY['indian','curry','vegetarian']);

--changeset recipebase:004-paneer-spinach-recipe
INSERT INTO recipe (id, item_id, source, yield, notes) VALUES
    ('b1000000-0000-0000-0000-000000000002',
     'a1000000-0000-0000-0000-000000000002',
     '{"type":"original"}',
      '{"quantity":{"type":"decimal","unit":{"type":"custom","name":"servings"},"amount":4},"description":null}',
     'Palak paneer — serve with basmati rice or naan.');

--changeset recipebase:004-paneer-spinach-components
INSERT INTO recipe_component (id, recipe_id, slug, name, position) VALUES
    ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'spinach-base', 'Spinach base', 1),
    ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'paneer',       'Paneer',       2);

--changeset recipebase:004-paneer-spinach-ingredients-base
INSERT INTO recipe_ingredient (id, component_id, slug, name, quantity, notes, position) VALUES
    ('d2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'spinach',      'Fresh spinach',        '{"type":"decimal","unit":{"type":"gram"},"amount":500}',  'washed',              1),
    ('d2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'onion',        'Onion',                '{"type":"unspecified","notes":"1 large"}', NULL,        2),
    ('d2000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'garlic',       'Garlic cloves',        '{"type":"unspecified","notes":"4 cloves"}', NULL,       3),
    ('d2000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'ginger',       'Fresh ginger',         '{"type":"decimal","unit":{"type":"gram"},"amount":20}',   'grated',              4),
    ('d2000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'green-chili',  'Green chili',          '{"type":"unspecified","notes":"1-2"}', NULL,            5),
    ('d2000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'cumin',        'Cumin seeds',          '{"type":"decimal","unit":{"type":"gram"},"amount":2}',    NULL,                  6),
    ('d2000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'cream',        'Heavy cream',          '{"type":"decimal","unit":{"type":"milliliter"},"amount":100}',  NULL,            7),
    ('d2000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000002', 'oil',          'Vegetable oil',        '{"type":"decimal","unit":{"type":"milliliter"},"amount":30}',   NULL,              8),
    ('d2000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000002', 'garam-masala', 'Garam masala',         '{"type":"decimal","unit":{"type":"gram"},"amount":5}',    NULL,                  9),
    ('d2000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000002', 'salt-1',       'Salt',                 '{"type":"unspecified","notes":"to taste"}', NULL,      10);

--changeset recipebase:004-paneer-spinach-ingredients-paneer
INSERT INTO recipe_ingredient (id, component_id, slug, name, quantity, notes, position) VALUES
    ('d2000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000003', 'paneer',       'Paneer cheese',        '{"type":"decimal","unit":{"type":"gram"},"amount":250}',  'cubed',               1);

--changeset recipebase:004-paneer-spinach-steps-base
INSERT INTO recipe_step (id, component_id, slug, step_order, body, timer_seconds) VALUES
    ('e2000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'blanch',   1, 'Blanch spinach in boiling water for 2 minutes. Transfer to ice water. Squeeze dry and blend to a rough puree.', 120),
    ('e2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'saute',    2, 'Heat oil in a pan. Add cumin seeds, then onion, garlic, ginger, and green chili. Cook until onions are golden.', 480),
    ('e2000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'simmer',   3, 'Add spinach puree, cream, garam masala, and salt. Simmer for 5 minutes.', 300);

--changeset recipebase:004-paneer-spinach-steps-paneer
INSERT INTO recipe_step (id, component_id, slug, step_order, body, timer_seconds) VALUES
    ('e2000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'fry-paneer', 1, 'Pan-fry paneer cubes in a little oil until golden on all sides. Add to the spinach sauce.', 300);

-- ============================================================
-- Placeholder items for Fraisier sub-recipes
-- ============================================================
--changeset recipebase:004-genoise-item
INSERT INTO item (id, slug, type, name, tags) VALUES
    ('a1000000-0000-0000-0000-000000000004', 'genoise', 'recipe', 'Génoise', ARRAY['french','baking','sponge']);

--changeset recipebase:004-genoise-recipe
INSERT INTO recipe (id, item_id, source, yield, notes) VALUES
    ('b1000000-0000-0000-0000-000000000003',
     'a1000000-0000-0000-0000-000000000004',
     '{"type":"original"}',
      '{"quantity":{"type":"decimal","unit":{"type":"custom","name":"layer"},"amount":1},"description":"one 20cm round"}',
     NULL);

--changeset recipebase:004-genoise-component
INSERT INTO recipe_component (id, recipe_id, slug, name, position) VALUES
    ('c3000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 'sponge', 'Sponge', 1);

--changeset recipebase:004-genoise-ingredients
INSERT INTO recipe_ingredient (id, component_id, slug, name, quantity, notes, position) VALUES
    ('d3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'eggs',       'Eggs',             '{"type":"unspecified","notes":"4 large"}',  NULL,   1),
    ('d3000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'sugar',      'Sugar',            '{"type":"decimal","unit":{"type":"gram"},"amount":120}',              NULL,   2),
    ('d3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', 'flour',      'All-purpose flour','{"type":"decimal","unit":{"type":"gram"},"amount":120}',              NULL,   3),
    ('d3000000-0000-0000-0000-000000000004', 'c3000000-0000-0000-0000-000000000001', 'butter',     'Melted butter',    '{"type":"decimal","unit":{"type":"gram"},"amount":30}',               NULL,   4);

--changeset recipebase:004-genoise-steps
INSERT INTO recipe_step (id, component_id, slug, step_order, body, timer_seconds) VALUES
    ('e3000000-0000-0000-0000-000000000001', 'c3000000-0000-0000-0000-000000000001', 'whip',    1, 'Whisk eggs and sugar over a bain-marie until thick and tripled in volume (ribbon stage).', 600),
    ('e3000000-0000-0000-0000-000000000002', 'c3000000-0000-0000-0000-000000000001', 'fold',    2, 'Sift flour over the egg mixture in three additions, folding gently. Fold in melted butter.', NULL),
    ('e3000000-0000-0000-0000-000000000003', 'c3000000-0000-0000-0000-000000000001', 'bake',    3, 'Pour into a buttered and floured 20cm tin. Bake at 180°C until golden and springy.', 1500);

--changeset recipebase:004-cake-strawberries-item
INSERT INTO item (id, slug, type, name, tags) VALUES
    ('a1000000-0000-0000-0000-000000000005', 'cake-strawberries', 'recipe', 'Cake Strawberries', ARRAY['french','filling']);

--changeset recipebase:004-cake-strawberries-recipe
INSERT INTO recipe (id, item_id, source, yield, notes) VALUES
    ('b1000000-0000-0000-0000-000000000004',
     'a1000000-0000-0000-0000-000000000005',
     '{"type":"original"}',
      '{"quantity":{"type":"decimal","unit":{"type":"custom","name":"pieces"},"amount":20},"description":"halved strawberries"}',
     NULL);

--changeset recipebase:004-cake-strawberries-component
INSERT INTO recipe_component (id, recipe_id, slug, name, position) VALUES
    ('c4000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'prep', 'Prep', 1);

--changeset recipebase:004-cake-strawberries-ingredients
INSERT INTO recipe_ingredient (id, component_id, slug, name, quantity, notes, position) VALUES
    ('d4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000001', 'strawberries', 'Fresh strawberries', '{"type":"decimal","unit":{"type":"gram"},"amount":400}', 'hulled and halved', 1);

--changeset recipebase:004-cake-strawberries-steps
INSERT INTO recipe_step (id, component_id, slug, step_order, body, timer_seconds) VALUES
    ('e4000000-0000-0000-0000-000000000001', 'c4000000-0000-0000-0000-000000000001', 'prep', 1, 'Hull strawberries and halve lengthwise. Reserve the best-looking halves for the border.', NULL);

-- ============================================================
-- Placeholder recipe: Crème Mousseline
-- ============================================================
--changeset recipebase:004-creme-mousseline-item
INSERT INTO item (id, slug, type, name, tags) VALUES
    ('a1000000-0000-0000-0000-000000000006', 'creme-mousseline', 'recipe', 'Crème Mousseline', ARRAY['french','pastry','cream']);

--changeset recipebase:004-creme-mousseline-recipe
INSERT INTO recipe (id, item_id, source, yield, notes) VALUES
    ('b1000000-0000-0000-0000-000000000005',
     'a1000000-0000-0000-0000-000000000006',
     '{"type":"original"}',
      '{"quantity":{"type":"decimal","unit":{"type":"milliliter"},"amount":500},"description":"enough for one 20cm cake"}',
     NULL);

--changeset recipebase:004-creme-mousseline-component
INSERT INTO recipe_component (id, recipe_id, slug, name, position) VALUES
    ('c5000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 'cream', 'Cream', 1);

--changeset recipebase:004-creme-mousseline-ingredients
INSERT INTO recipe_ingredient (id, component_id, slug, name, quantity, notes, position) VALUES
    ('d5000000-0000-0000-0000-000000000001', 'c5000000-0000-0000-0000-000000000001', 'milk',      'Whole milk',       '{"type":"decimal","unit":{"type":"milliliter"},"amount":500}',  NULL,            1),
    ('d5000000-0000-0000-0000-000000000002', 'c5000000-0000-0000-0000-000000000001', 'egg-yolks', 'Egg yolks',        '{"type":"unspecified","notes":"6"}',  NULL,            2),
    ('d5000000-0000-0000-0000-000000000003', 'c5000000-0000-0000-0000-000000000001', 'sugar',     'Sugar',            '{"type":"decimal","unit":{"type":"gram"},"amount":150}',        NULL,            3),
    ('d5000000-0000-0000-0000-000000000004', 'c5000000-0000-0000-0000-000000000001', 'cornstarch','Cornstarch',       '{"type":"decimal","unit":{"type":"gram"},"amount":40}',         NULL,            4),
    ('d5000000-0000-0000-0000-000000000005', 'c5000000-0000-0000-0000-000000000001', 'butter',    'Unsalted butter',  '{"type":"decimal","unit":{"type":"gram"},"amount":150}',        'softened',      5),
    ('d5000000-0000-0000-0000-000000000006', 'c5000000-0000-0000-0000-000000000001', 'vanilla',   'Vanilla extract',  '{"type":"decimal","unit":{"type":"milliliter"},"amount":5}',    NULL,            6);

--changeset recipebase:004-creme-mousseline-steps
INSERT INTO recipe_step (id, component_id, slug, step_order, body, timer_seconds) VALUES
    ('e5000000-0000-0000-0000-000000000001', 'c5000000-0000-0000-0000-000000000001', 'custard', 1, 'Whisk egg yolks, sugar, and cornstarch. Heat milk to a simmer, temper into yolk mixture, return to heat and cook until thick.', 420),
    ('e5000000-0000-0000-0000-000000000002', 'c5000000-0000-0000-0000-000000000001', 'enrich',  2, 'Transfer to a bowl, cover with cling film touching the surface. Cool to room temperature, then beat in softened butter and vanilla.', NULL);

-- ============================================================
-- Sample assembly: Fraisier
-- ============================================================
--changeset recipebase:004-fraisier-item
INSERT INTO item (id, slug, type, name, tags) VALUES
    ('a1000000-0000-0000-0000-000000000003', 'fraisier', 'assembly', 'Fraisier', ARRAY['french','pastry','cake','strawberry']);

--changeset recipebase:004-fraisier-assembly
INSERT INTO assembly (id, item_id, yield) VALUES
    ('f1000000-0000-0000-0000-000000000001',
     'a1000000-0000-0000-0000-000000000003',
      '{"quantity":{"type":"decimal","unit":{"type":"custom","name":"slices"},"amount":8},"description":"one 20cm cake"}');

--changeset recipebase:004-fraisier-components
INSERT INTO assembly_component (id, assembly_id, slug, comp_order, item_id, scale_factor, locked, lock_snapshot) VALUES
    ('aa000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'genoise',     1, 'a1000000-0000-0000-0000-000000000004', 1, false, NULL),
    ('aa000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'mousseline',  2, 'a1000000-0000-0000-0000-000000000006', 1, false, NULL),
    ('aa000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'strawberry',  3, 'a1000000-0000-0000-0000-000000000005', 1, false, NULL);
