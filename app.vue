<template>
  <div class="flex h-lvh w-lvw items-stretch flex-col">
    <div class="p-4">
      <div class="flex gap-4 justify-start items-center text-sm">
        <div class="max-sm:hidden">Recipebase.co</div>

        <div>Handbooks</div>

        <div class="grow" />

        <template v-if="user">
          <div class="rounded-full overflow-clip">
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
