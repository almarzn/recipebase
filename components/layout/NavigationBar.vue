<script setup lang="ts">
const user = useSupabaseUser();

const supabase = useSupabaseClient();

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.log(error);
};
const avatarUrl = user.value?.user_metadata.avatar_url;
</script>

<template>
  <div class="p-3 max-md:border-b max-md:bg-gray-50/5 max-md:backdrop-blur-2xl">
    <div class="flex items-center justify-start gap-4 text-sm">
      <div class="max-sm:hidden">Recipebase.co</div>
      <div class="w-2"></div>
      <NuxtLink to="/recipes">Recipes</NuxtLink>

      <div class="grow" />

      <template v-if="user">
        <div class="text-clip rounded-full">
          <div v-if="avatarUrl" class="w-7 overflow-hidden rounded-full">
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
</template>
