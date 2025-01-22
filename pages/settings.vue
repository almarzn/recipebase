<script setup lang="ts">
import PageLayout from "~/components/layout/PageLayout.vue";
import { toTypedSchema } from "@vee-validate/zod";
import { TabsContent } from "~/components/ui/tabs";
import { Field, Form, useForm } from "vee-validate";
import { Settings, settingsSchema } from "~/lib/Settings";
import { toast } from "vue-sonner";
import { SpinnerButton } from "~/components/ui/button";

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

    resetForm(data);
  } catch (e) {
    console.error(e);

    toast.error("An error occurred while trying to save settings");
  }
});
</script>

<template>
  <PageLayout>
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

      <SpinnerButton
        type="submit"
        :disabled="!meta.dirty"
        :loading="isSubmitting"
      >
        Save changes
      </SpinnerButton>
    </form>
  </PageLayout>
</template>
