<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { FormField } from "~/components/ui/form";
import { toast } from "vue-sonner";
import { supabase } from "~/lib/supabase";
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      password: z
        .string()
        .min(6, "Password must contain at least 6 characters"),
    }),
  ),
});

const client = useSupabaseClient();

const submitForm = handleSubmit(async (values) => {
  try {
    await client.auth.updateUser({
      password: values.password,
    });
    toast.success("Updated password successfully.");
    navigateTo("/");
  } catch (e) {
    console.error(e);
    toast.error("Unable to update password");
  }
});
const user = await client.auth.getUser();

if (!user.data.user) {
  navigateTo("/login");
}
</script>

<template>
  <form
    class="flex w-full max-w-sm grow flex-col justify-center gap-6 self-center p-4"
    @submit="submitForm"
  >
    <h2 class="heading-3">Reset your password</h2>

    <FormField v-slot="{ componentField }" name="password">
      <FormItem class="flex flex-col gap-2">
        <FormLabel>New password</FormLabel>
        <FormControl>
          <Input type="password" v-bind="componentField" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <SpinnerButton class="self-end" :loading="isSubmitting">
      Update
    </SpinnerButton>
  </form>
</template>
