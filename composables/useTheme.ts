import { computed, ref, watch } from "vue";
import { useColorMode } from "@vueuse/core";

export function useTheme() {
  const mode = useColorMode();
  const currentTheme = ref("");

  const updateTheme = () => {
    const html = document.documentElement;
    const theme = html.getAttribute("data-theme");
    currentTheme.value = theme || "";
  };

  // Initial theme detection
  if (process.client) {
    updateTheme();

    // Create a mutation observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateTheme();
        }
      });
    });

    // Start observing the document element for theme changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  // Computed properties for common theme checks
  const isDark = computed(() => {
    return [
      "dark",
      "night",
      "business",
      "forest",
      "black",
      "luxury",
      "dracula",
    ].includes(currentTheme.value);
  });

  const isLight = computed(() => !isDark.value);

  return {
    currentTheme,
    isDark,
    isLight,
  };
}
