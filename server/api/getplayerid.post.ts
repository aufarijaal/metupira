import { supabase } from "~/composables/supabaseClient";

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase
    .from("user_devices")
    .select("onesignal_player_id")
    .eq("user_id", "5991c872-f4e1-4ce9-a0d6-9caa6d95016f");

  return { playerIds: data?.map((d) => d.onesignal_player_id) || [] };
});
