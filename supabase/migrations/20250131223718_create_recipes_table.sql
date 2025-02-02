create table public.recipes
(
    id          uuid primary key         not null default gen_random_uuid(),
    created_at  timestamp with time zone not null default now(),
    name        text                     not null,
    description text,
    steps       jsonb                    not null,
    ingredients jsonb                    not null,
    slug        text                     not null,
    user_id     uuid                              default auth.uid(),
    servings    jsonb,
    foreign key (user_id) references auth.users (id)
        match simple on update cascade on delete cascade
);

alter table "public"."recipes" enable row level security;

create unique index recipes_user_id_slug_idx
    on public.recipes (user_id, slug);

create policy "Enable delete for users based on user_id" on public.recipes
    as permissive
    for delete
    using ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable insert for users based on user_id" on public.recipes
    as permissive
    for insert
    with check ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable update for users based on user_id" on public.recipes
    as permissive
    for update
    using ((SELECT auth.uid() AS uid) = user_id)
    with check ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable users to view their own data only" on public.recipes
    as permissive
    for select
    to authenticated
    using ((SELECT auth.uid() AS uid) = user_id);
