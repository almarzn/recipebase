<script setup lang="ts">
import { LogOut, User, UserCog } from "lucide-vue-next";
import SearchRecipe from "~/components/recipe/SearchRecipe.vue";

const user = useSupabaseUser();

const supabase = useSupabaseClient();

const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.log(error);
};
const avatarUrl = user.value?.user_metadata.avatar_url;

const route = useRoute();
</script>

<template>
  <div
    class="px-5 py-3 text-sm max-md:border-b max-md:bg-gray-50/5 max-md:backdrop-blur-2xl md:px-7 md:py-5"
  >
    <div class="flex items-center justify-start gap-3 md:gap-8">
      <NuxtLink to="/" class="flex items-center justify-start gap-4">
        <img src="/icon_white.svg" class="size-6" alt="Log" />
        <div class="max-sm:hidden">Recipebase.co</div>
      </NuxtLink>

      <NuxtLink to="/recipes">Recipes</NuxtLink>

      <div class="h-9 grow" />

      <SearchRecipe v-if="route.name !== 'index'" />

      <template v-if="user">
        <Sheet>
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              class="flex items-center gap-3 rounded-full p-2 pr-3"
            >
              <div class="rounded-full text-clip">
                <div v-if="avatarUrl" class="w-6 overflow-hidden rounded-full">
                  <NuxtImg :src="avatarUrl" />
                </div>
                <User v-else class="size-5" />
              </div>

              <div class="text-muted-foreground max-sm:hidden">
                {{ user.email }}
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <p class="text-muted-foreground">{{ user.email }}</p>
            <ul class="flex flex-col gap-2">
              <li>
                <SheetClose as-child>
                  <NuxtLink
                    to="/settings"
                    class="flex items-center gap-3 rounded-md px-3 py-1 hover:bg-gray-900"
                  >
                    <UserCog class="size-5 stroke-muted-foreground" />
                    Settings
                  </NuxtLink>
                </SheetClose>
              </li>
              <li
                class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-1 hover:bg-gray-900"
                @click="signOut()"
              >
                <LogOut class="size-5 stroke-muted-foreground" />
                Logout
              </li>
            </ul>
          </SheetContent>
        </Sheet>
      </template>
    </div>
  </div>
</template>
