import OneSignalVuePlugin from "@onesignal/onesignal-vue3";

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();

  if (!runtimeConfig.public.onesignalAppId) {
    console.warn("OneSignal App ID is not defined.");
    return;
  }

  nuxtApp.vueApp.use(OneSignalVuePlugin, {
    appId: runtimeConfig.public.onesignalAppId, // 👈 this must be defined
    allowLocalhostAsSecureOrigin: true,
    notifyButton: {
      enable: true,
    },
  });

  // Wait until OneSignal is ready
  if (typeof window !== "undefined") {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal: any) {
      // Ask for permission (new v2 syntax)
      await OneSignal.Notifications.requestPermission();

      const permission = await OneSignal.Notifications.permission;
      console.log("Notification permission:", permission);
    });
  }
});
