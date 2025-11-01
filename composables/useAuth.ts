import { useRouter } from "vue-router";
import { useOneSignal } from "@onesignal/onesignal-vue3";

export const useAuth = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const user = useSupabaseUser();
  const isAuthenticated = computed(() => !!user.value);
  const onesignal = useOneSignal();

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any auth-related local storage or state here
      localStorage.removeItem("last-path");

      // Redirect to signin page
      await router.push("/auth/signin");
    } catch (error) {
      console.error(
        "Error signing out:",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  };

  // Return a strongly typed object
  return {
    user,
    signOut,
    isAuthenticated,
  } as const;
};
