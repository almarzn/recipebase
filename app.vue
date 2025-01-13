<template>
  <div class="bg-radial flex h-lvh w-lvw flex-col items-stretch">
    <NuxtLoadingIndicator />
    <div class="p-4">
      <div class="flex items-center justify-start gap-4 text-sm">
        <div class="max-sm:hidden">Recipebase.co</div>
        <div class="w-2"></div>
        <NuxtLink to="/recipes">Recipes</NuxtLink>
        <NuxtLink to="/collections">Collections</NuxtLink>

        <div class="grow" />

        <template v-if="user">
          <div class="text-clip rounded-full">
            <div v-if="avatarUrl" class="w-7">
              <NuxtImg :src="avatarUrl" />
            </div>
          </div>
          <div class="text-muted-foreground max-sm:hidden">
            {{ user.email }}
          </div>

          <Button variant="outline" @click="signOut()">Logout</Button>
        </template>
        <template v-if="!user">
          <Button variant="default" as-child>
            <NuxtLink to="/login">Login</NuxtLink>
          </Button>
        </template>
      </div>
    </div>

    <NuxtPage />

    <Toaster class="pointer-events-auto" />
  </div>
</template>
<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";

const user = useSupabaseUser();

const supabase = useSupabaseClient();

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.log(error);
};
const avatarUrl = user.value?.user_metadata.avatar_url;
</script>
