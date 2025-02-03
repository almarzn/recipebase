<script setup lang="ts">
import { SpinnerButton } from "~/components/ui/button";
import { useForm } from "vee-validate";
import { Settings, settingsSchema } from "~/lib/Settings";
import { toTypedSchema } from "@vee-validate/zod";
import { toast } from "vue-sonner";
import TagSettingSheet from "~/components/profile/TagSettingSheet.vue";
import { FormField } from "~/components/ui/form";
import { Tags, Trash2, RefreshCcw } from "lucide-vue-next";

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

const deleteAccount = useAsyncData(async () => {
  try {
    const response = await $fetch("/api/account", {
      method: "DELETE",
    });
    await client.auth.signOut();

    toast.success("Account deleted successfully");

    navigateTo("/");
  } catch (e) {
    console.error(e);

    toast.error("An error occurred while trying to delete account");
  }
}, { immediate: false });
</script>

<template>
  <div class="flex gap-6">
    <div class="flex grow flex-col gap-8">
      <h2 class="heading-3">Settings</h2>
      <form
        class="flex flex-col items-start gap-4"
        @submit.prevent="submitForm"
      >
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
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-sm text-muted-foreground">Actions</h3>
      <div class="flex flex-col items-start gap-1">
        <TagSettingSheet>
          <Button variant="ghost">
            <Tags />
            Edit tags
          </Button>
        </TagSettingSheet>

        <Button variant="ghost" as-child>
          <NuxtLink to="/reset">
            <RefreshCcw />
            Change password
          </NuxtLink>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button
              variant="ghost"
              class="text-destructive hover:text-destructive"
            >
              <Trash2 />
              Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction @click="deleteAccount.execute()">
                Delete my account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </div>
</template>
