create function public.increase_free_ai_trials() returns void
    security definer
    language plpgsql
as
$$
DECLARE
    current_usage integer;
BEGIN
    -- Attempt to get the current usage for the current user
    SELECT usage INTO current_usage
    FROM free_ai_trials
    WHERE user_id = auth.uid();

    -- Check if the current usage is less than 6
    IF current_usage >= 6 THEN
        RAISE EXCEPTION 'Free AI trials usage cannot exceed 6';
    END IF;

    -- Increment the usage by 1
    UPDATE free_ai_trials
    SET usage = usage + 1
    WHERE user_id = auth.uid();

    -- If the row does not exist, initialize it with usage = 1
    IF NOT FOUND THEN
        INSERT INTO free_ai_trials (user_id, usage)
        VALUES (auth.uid(), 1);
    END IF;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- If no data was found, initialize the row with usage = 1
        INSERT INTO free_ai_trials (user_id, usage)
        VALUES (auth.uid(), 1);
END;
$$;

alter function public.increase_free_ai_trials() owner to postgres;

grant execute on function public.increase_free_ai_trials() to anon;

grant execute on function public.increase_free_ai_trials() to authenticated;

grant execute on function public.increase_free_ai_trials() to service_role;

