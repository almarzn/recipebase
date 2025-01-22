<template>
  <div class="mt-16 flex max-w-96 grow flex-col gap-4 self-center">
    <h1 class="heading-3">Login to recipebase</h1>

    <p>You need to login to use this website</p>

    <Button @click="signInWithOAuth()">Login with Google</Button>
  </div>
</template>
<script setup lang="ts">
const supabase = useSupabaseClient();

const signInWithOAuth = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/confirm",
    },
  });
  if (error) console.log(error);
};
</script>
