import { API_ENDPOINTS } from "@/lib/constants";
import { postJson } from "@/lib/apiClient";

export type FeedbackPayload = {
  contact?: string;
  content: string;
  needResponse: boolean;
  token: string;
};

export async function submitFeedback(payload: FeedbackPayload) {
  return postJson<{ success: boolean }>(API_ENDPOINTS.feedback, payload);
}

