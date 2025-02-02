create table public.comments
(
    created_at timestamp with time zone default now()             not null,
    user_id    uuid                     default auth.uid()        not null
        constraint remarks_user_id_fkey
            references auth.users
            on update cascade on delete cascade,
    recipe_id  uuid                                               not null
        constraint remarks_recipe_id_fkey
            references public.recipes
            on update cascade on delete cascade,
    target     jsonb,
    content    text                                               not null,
    id         uuid                     default gen_random_uuid() not null
        primary key
);

alter table "public"."comments" enable row level security;


create policy "Enable delete for users based on user_id" on public.comments
    as permissive
    for delete
    using ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable insert for users based on user_id" on public.comments
    as permissive
    for insert
    with check ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable users to view their own data only" on public.comments
    as permissive
    for select
    to authenticated
    using ((SELECT auth.uid() AS uid) = user_id);

create policy "Enable update for users based on user_id" on public.comments
    as permissive
    for update
    using ((SELECT auth.uid() AS uid) = user_id)
    with check ((SELECT auth.uid() AS uid) = user_id);
