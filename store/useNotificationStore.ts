import { defineStore } from "pinia";

interface Notification {
  message: string;
  url?: string;
}

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref<Notification[]>([]);

  function addNotification(notification: Notification) {
    notifications.value.push(notification);
  }

  function clearNotifications() {
    notifications.value = [];
  }

  return {
    notifications,
    addNotification,
    clearNotifications,
  };
});
