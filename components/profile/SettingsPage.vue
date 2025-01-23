<script setup lang="ts">
import { AdaptiveBreadcrumbs } from "~/components/layout";
import { SpinnerButton } from "~/components/ui/button";
import { Form, useForm } from "vee-validate";
import { Settings, settingsSchema } from "~/lib/Settings";
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import TagSettingSheet from "~/components/profile/TagSettingSheet.vue";

const client = useSupabaseClient();

const settings = await useAsyncData(() => Settings.using(client).getSettings());

const { meta, handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(settingsSchema),
  initialValues: settings.data.value,
  validateOnMount: true,
});

const submitForm = handleSubmit(async (data) => {
  try {
    await Settings.using(client).updateSettings(data);

    toast.success("Settings saved!");

    resetForm({
      values: data,
    });
  } catch (e) {
    console.error(e);

    toast.error("An error occurred while trying to save settings");
  }
});
</script>

<template>
  <h2>Settings</h2>

  <form class="flex flex-col items-start gap-4" @submit.prevent="submitForm">
    <FormField v-slot="{ componentField }" name="openai_api_key">
      <FormItem>
        <FormLabel>OpenAI API key</FormLabel>
        <FormControl>
          <Input placeholder="sk-proj-..." v-bind="componentField" />
        </FormControl>
        <FormDescription>
          An OpenAI API key allows recipebase to leverage ChatGPT to import
          recipes from the web or pictures.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <TagSettingSheet />

    <SpinnerButton
      type="submit"
      :disabled="!meta.dirty"
      :loading="isSubmitting"
    >
      Save changes
    </SpinnerButton>
  </form>
</template>
