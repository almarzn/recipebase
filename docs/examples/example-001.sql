-- Example: Chocolate Cake with two variants (Classic + Molten Center)
-- Used by RecipeResourceControllerIT integration tests

-- Insert recipe
INSERT INTO recipe (id, slug, title, description) VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'chocolate-cake', 'Chocolate Cake', 'A rich chocolate cake');

-- Insert variants
INSERT INTO recipe_variant (id, recipe_id, slug, name, description) VALUES ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'classic', 'Classic', 'Traditional chocolate cake');
INSERT INTO recipe_variant (id, recipe_id, slug, name, description) VALUES ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'molten', 'Molten Center', 'Gooey molten center');

-- Set current variant
UPDATE recipe SET current_variant_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901' WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- Insert components
INSERT INTO recipe_component (id, variant_id, position, title, description, link) VALUES ('d4e5f6a7-b8c9-0123-defa-234567890123', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 1, 'Cake Batter', 'The main batter', '{"quality":"self"}'::jsonb);
INSERT INTO recipe_component (id, variant_id, position, title, link) VALUES ('e5f6a7b8-c9d0-1234-efab-345678901234', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 1, 'Molten Batter', '{"quality":"self"}'::jsonb);

-- Insert ingredients (Classic variant)
INSERT INTO recipe_ingredient (id, component_id, position, slug, name, quantity) VALUES ('f6a7b8c9-d0e1-2345-fabc-456789012345', 'd4e5f6a7-b8c9-0123-defa-234567890123', 1, 'flour', 'All-purpose flour', '{"unit":"gram","amount":250}'::jsonb);
INSERT INTO recipe_ingredient (id, component_id, position, slug, name, quantity) VALUES ('a7b8c9d0-e1f2-3456-abcd-567890123456', 'd4e5f6a7-b8c9-0123-defa-234567890123', 2, 'sugar', 'Sugar', '{"unit":"gram","amount":200}'::jsonb);

-- Insert ingredients (Molten variant)
INSERT INTO recipe_ingredient (id, component_id, position, slug, name, quantity) VALUES ('b8c9d0e1-f2a3-4567-bcde-678901234567', 'e5f6a7b8-c9d0-1234-efab-345678901234', 1, 'dark-chocolate', 'Dark chocolate', '{"unit":"gram","amount":200}'::jsonb);

-- Insert steps (Classic variant)
INSERT INTO recipe_step (id, component_id, position, text) VALUES ('c9d0e1f2-a3b4-5678-cdef-789012345678', 'd4e5f6a7-b8c9-0123-defa-234567890123', 1, 'Mix dry ingredients together.');
INSERT INTO recipe_step (id, component_id, position, text, attachment) VALUES ('d0e1f2a3-b4c5-6789-defa-890123456789', 'd4e5f6a7-b8c9-0123-defa-234567890123', 2, 'Bake at 180°C.', '{"duration":"PT30M"}'::jsonb);

-- Insert steps (Molten variant)
INSERT INTO recipe_step (id, component_id, position, text, attachment) VALUES ('e1f2a3b4-c5d6-7890-efab-901234567890', 'e5f6a7b8-c9d0-1234-efab-345678901234', 1, 'Bake for 12 minutes only.', '{"duration":"PT12M"}'::jsonb);
