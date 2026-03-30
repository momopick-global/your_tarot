import { postJson } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/constants";
import { getSupabaseClient } from "@/lib/supabase";

export type FeedbackPayload = {
  contact?: string;
  content: string;
  needResponse: boolean;
  token: string;
};

/**
 * 정적 export(`output: "export"`) 배포에서는 `/api/feedback` 이 없어 POST 가 405/404 가 됩니다.
 * Supabase 가 설정되어 있으면 DB에 직접 insert 하고, 없을 때만 API 로 폴백합니다.
 */
export async function submitFeedback(payload: FeedbackPayload) {
  const supabase = getSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("feedback").insert({
      user_id: user?.id ?? null,
      contact: payload.contact?.trim() || null,
      content: payload.content.trim(),
      need_response: payload.needResponse,
    });

    if (error) {
      throw new Error(error.message || "의견 전송에 실패했어요.");
    }
    return { success: true as const };
  }

  try {
    return postJson<{ success: boolean }>(API_ENDPOINTS.feedback, payload);
  } catch (error) {
    // Static export deployment has no Next API routes (/api/*).
    if (error instanceof Error && /API request failed: (404|405)/.test(error.message)) {
      throw new Error(
        "의견 전송 기능을 점검 중입니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 이메일로 문의해 주세요.",
      );
    }
    throw error;
  }
}

