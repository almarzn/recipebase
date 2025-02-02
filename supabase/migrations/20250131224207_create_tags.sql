create type public.tag_colors as enum ('gray', 'zinc', 'slate', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose');

alter type public.tag_colors owner to postgres;

create type public.tag_icons as enum ('apple', 'beef', 'candy', 'carrot', 'dessert', 'fish_symbol', 'cup_soda', 'vegan', 'leafy_green', 'wheat', 'wheat_off', 'egg', 'egg_off');

alter type public.tag_icons owner to postgres;

create table public.tags
(
    created_at timestamp with time zone default now()              not null,
    color      tag_colors               default 'gray'::tag_colors not null,
    icon       tag_icons,
    text       varchar                                             not null,
    user_id    uuid                     default auth.uid()
        references auth.users
            on update cascade on delete cascade,
    id         uuid                     default gen_random_uuid()  not null
        primary key
);

alter table "public"."tags" enable row level security;


create policy "Enable users to view their own data only" on public.tags
    as permissive
    for select
                   to authenticated
                   using ((user_id IS NULL) OR ((SELECT auth.uid() AS uid) = user_id));

create policy "Enable insert for users based on user_id" on public.tags
    as permissive
    for insert
    to authenticated
    with check ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable update for users based on id" on public.tags
    as permissive
    for update
                          to authenticated
                          using ((SELECT auth.uid() AS uid) = user_id)
        with check ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable delete for users based on user_id" on public.tags
    as permissive
    for delete
to authenticated
    using ((SELECT auth.uid() AS uid) = user_id);

create policy "Allow admin" on public.tags
    as permissive
    for all
    to supabase_admin
    using (true);

create policy "Enable view for public tags" on public.tags
    as permissive
    for select
                          to authenticated
                          using (user_id IS NULL);
create table public.recipe_tags
(
    recipe_id uuid not null
        references public.recipes
            on update cascade on delete cascade,
    tag_id    uuid not null
        references public.tags
            on update cascade on delete cascade,
    primary key (recipe_id, tag_id)
);

alter table "public"."recipe_tags" enable row level security;

alter table public.recipe_tags
    owner to postgres;

create policy "Policy with table joins" on public.recipe_tags
    as permissive
    for all
    using ((SELECT auth.uid() AS uid) IN (SELECT recipes.user_id
                                          FROM recipes
                                          WHERE (recipe_tags.recipe_id = recipes.id)))
    with check ((SELECT auth.uid() AS uid) IN (SELECT recipes.user_id
                                               FROM recipes
                                               WHERE (recipe_tags.recipe_id = recipes.id)));

