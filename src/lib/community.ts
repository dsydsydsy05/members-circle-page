import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import type { Json } from "@/integrations/supabase/types";

export type Connection = {
  id: string;
  sender_id: string;
  recipient_id: string;
  reason: string;
  status: "pending" | "accepted" | "declined" | "withdrawn" | "disconnected" | "blocked";
  name: string;
  avatar_url: string | null;
  position: string | null;
  startup: string | null;
  created_at: string;
  updated_at: string;
};
export type Answer = {
  id: string;
  question_id: string;
  body: string;
  responder_type: "guest" | "admin";
  responder_name: string;
  responder_title: string | null;
  responder_avatar_url: string | null;
  guest_id: string | null;
  version: number;
  status: string;
  created_at: string;
};
export type Approval = {
  id: string;
  answer_id: string;
  version: number;
  status: string;
  expires_at: string;
  decided_at: string | null;
};
export async function communityRpc<T>(
  name: "room_connections" | "room_qa_admin" | "room_moderation_admin",
  action: string,
  payload: Json = {},
): Promise<T> {
  const { data, error } = await supabase.rpc(name, { _action: action, _payload: payload });
  if (error) throw new Error(error.message);
  return data as T;
}
export function useConnections() {
  const { userId, isMember } = useAuth();
  return useQuery({
    queryKey: ["connections", userId],
    enabled: !!userId && isMember,
    queryFn: () => communityRpc<Connection[]>("room_connections", "list"),
    refetchInterval: 15_000,
    staleTime: 0,
  });
}
export function useConnectionAction() {
  const query = useQueryClient();
  return async (action: string, payload: Json) => {
    const result = await communityRpc<{ notification_id: string | null }>(
      "room_connections",
      action,
      payload,
    );
    await Promise.all([
      query.invalidateQueries({ queryKey: ["connections"] }),
      query.invalidateQueries({ queryKey: ["connection-email"] }),
      query.invalidateQueries({ queryKey: ["member-blocks"] }),
    ]);
    if (result.notification_id) {
      // Failure never undoes a successful request. Administrators can retry the outbox.
      try {
        await supabase.functions.invoke("community-notify", {
          body: { id: result.notification_id },
        });
      } catch {
        /* durable outbox */
      }
    }
  };
}
export async function reportContent(type: string, id: string, reason: string) {
  const { error } = await supabase.rpc("room_report", { _type: type, _id: id, _reason: reason });
  if (error) throw new Error(error.message);
}
