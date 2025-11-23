import { defineStore } from "pinia";
import { useI18n } from "vue-i18n";

interface Notification {
  message: string;
  url?: string;
  type: "info" | "warning" | "error";
}

export const useNotificationStore = defineStore("notification", () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // i18n composable
  const { t } = useI18n();
  const notifications = ref<Notification[]>([]);

  function addNotification(notification: Notification) {
    notifications.value.push(notification);
  }

  function clearNotifications() {
    notifications.value = [];
  }

  async function getNotifications() {
    try {
      // get linked account pending
      const { data, error } = await supabase
        .from("linked_accounts")
        .select("*")
        .eq("child_id", user.value?.id)
        .eq("status", "pending");

      if (error) {
        throw error;
      }

      if (data) {
        data.forEach((account) => {
          addNotification({
            message: t("linkedAccounts.pendingRequestWarningNotificationArea"),
            url: "/dashboard/linked-accounts",
            type: "info",
          });
        });
      }
    } catch (error) {}
  }

  return {
    notifications,
    addNotification,
    clearNotifications,
    getNotifications,
  };
});
