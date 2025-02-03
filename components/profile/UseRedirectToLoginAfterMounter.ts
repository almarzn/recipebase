import type { Subscription } from "@supabase/auth-js/src/lib/types";

const client = useSupabaseClient();

export const useRedirectToLoginAfterMounter = () => {
  let subscription: Subscription | undefined = undefined;

  onMounted(() => {
    subscription = client.auth.onAuthStateChange(async (event) => {
      if (event !== "INITIAL_SESSION") {
        return;
      }
      const user = await client.auth.getUser();
      if (!user.data.user) {
        navigateTo("/login");
      }
    }).data.subscription;
  });

  onUnmounted(() => {
    subscription?.unsubscribe();
  });
};
