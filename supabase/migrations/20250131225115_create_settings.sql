create type public.profile_settings as enum ('openai_api_key', 'preferred_unit_system');

create table public.settings
(
    user_id uuid default auth.uid() not null
        constraint profiles_user_id_fkey
            references auth.users
            on update cascade on delete cascade,
    key     profile_settings        not null,
    value   jsonb,
    constraint profiles_pkey
        primary key (user_id, key)
);

alter table "public"."settings" enable row level security;


create policy "Enable users to view their own data only" on public.settings
    as permissive
    for select
    to authenticated
    using ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable insert for users based on user_id" on public.settings
    as permissive
    for insert
    with check ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable delete for users based on user_id" on public.settings
    as permissive
    for delete
    using ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable update for users based on user_id" on public.settings
    as permissive
    for update
    using ((SELECT auth.uid() AS uid) = user_id)
    with check ((SELECT auth.uid() AS uid) = user_id);

create table public.last_recipe_servings
(
    user_id   uuid default auth.uid() not null
        references auth.users
            on update cascade on delete cascade,
    recipe_id uuid                    not null
        references public.recipes
            on update cascade on delete cascade,
    value     numeric,
    primary key (user_id, recipe_id)
);

alter table "public"."last_recipe_servings" enable row level security;


create policy "all " on public.last_recipe_servings
    as permissive
    for all
    to authenticated
    using ((SELECT auth.uid() AS uid) = user_id)
    with check ((SELECT auth.uid() AS uid) = user_id);

create table public.free_ai_trials
(
    user_id uuid primary key not null,
    usage   smallint         not null default '0'::smallint,
    foreign key (user_id) references auth.users (id)
        match simple on update cascade on delete cascade
);

alter table "public"."free_ai_trials" enable row level security;

create policy "Read-only their own data " on public.free_ai_trials
    as permissive
    for select
    to authenticated
    using ((SELECT auth.uid() AS uid) = user_id);


