import { supabase } from "~/composables/supabaseClient";

export default defineEventHandler(async (event) => {
  const { data, error } = await supabase
    .from("linked_accounts")
    .select("parent_id")
    .eq("child_id", "")
    .single();

  if (error) {
    return { result: null, error: error };
  }

  if (!data?.parent_id) {
    return { result: null, error: null };
  }

  const { data: dataPlayerId, error: errorPlayerId } = await supabase
    .from("user_devices")
    .select("onesignal_player_id")
    .eq("user_id", data?.parent_id);

  return {
    result: dataPlayerId?.map((item) => item.onesignal_player_id),
    error: error,
  };
});
