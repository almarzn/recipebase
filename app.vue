<template>
  <div class="flex h-screen w-screen items-stretch flex-col">
    <div class="p-4">
      <div class="flex gap-4 justify-start items-center text-sm">
        <div>Recipebase.co</div>

        <div>
          Handbooks
        </div>

        <div class="grow"/>

        <template v-if="user">
          <div class="text-muted-foreground">{{ user.email }}</div>

          <Button variant="outline" @click="signOut()">Logout</Button>
        </template>
        <template v-if="!user">
          <Button variant="default" as-child>
            <NuxtLink to="/login">Login</NuxtLink>
          </Button>
        </template>
      </div>
    </div>

    <NuxtPage/>
  </div>
</template>
<script setup lang="ts">
const user = useSupabaseUser()

const supabase = useSupabaseClient()

const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.log(error)
}

</script>