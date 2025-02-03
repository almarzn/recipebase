<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { z } from "zod";
import { FormField } from "~/components/ui/form";
import { toast } from "vue-sonner";
import { ArrowRight } from "lucide-vue-next";
import type { AuthError } from "@supabase/auth-js";
import ReauthenticateUser from "~/components/profile/ReauthenticateUser.vue";
import { useRedirectToLoginAfterMount } from "~/components/profile/useRedirectToLoginAfterMount";

const { handleSubmit, isSubmitting, values } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      password: z
        .string()
        .min(6, "Password must contain at least 6 characters"),
    }),
  ),
});

const client = useSupabaseClient();

const reauthenticating = ref(false);

const doReauthenticate = async (result: {
  data: { user: null };
  error: AuthError;
}) => {
  const reauthenticateResult = await client.auth.reauthenticate();

  if (reauthenticateResult.error) {
    toast.error(
      "Unable to reauthenticate to update password: " + result.error.message,
    );

    return;
  }

  reauthenticating.value = true;

  return;
};

const updatePassword = async (password: string, nonce?: string) => {
  const result = await client.auth.updateUser({
    password,
    nonce,
  });

  if (result.error) {
    if (result.error.code === "reauthentication_needed") {
      return await doReauthenticate(result);
    }

    toast.error("Unable to update password: " + result.error.message);

    return;
  }

  toast.success("Updated password successfully.");

  navigateTo("/");
};

const submitForm = handleSubmit(async (values) => {
  return await updatePassword(values.password);
});

const submitWithNonce = async (nonce: string) => {
  await updatePassword(values.password!, nonce);
};

useRedirectToLoginAfterMount();
</script>

<template>
  <form
    v-if="!reauthenticating"
    class="flex w-full max-w-sm grow flex-col justify-center gap-6 self-center p-4"
    @submit="submitForm"
  >
    <h2 class="heading-3">Change your password</h2>

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
      <ArrowRight />
    </SpinnerButton>
  </form>
  <div
    v-else
    class="flex w-full max-w-lg grow flex-col justify-center gap-6 self-center p-4"
  >
    <ReauthenticateUser :submit="submitWithNonce" />
  </div>
</template>
