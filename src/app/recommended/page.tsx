"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { withAssetBase } from "@/lib/publicPath";
import { submitFeedback } from "@/hooks/useFeedback";

const ICON_EYE = withAssetBase("/assets/svg-logo-yourtarot.svg-699577b6-cedf-4beb-8082-e9fc60a6227c.png");

export default function RecommendedPage() {
  const [contact, setContact] = useState("");
  const [content, setContent] = useState("");
  const [needResponse, setNeedResponse] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => content.trim().length > 0 && status !== "submitting", [content, status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setErrorMessage(null);

    try {
      const token = `local-dev-token-${Date.now()}`;

      await submitFeedback({
        contact: contact.trim() || undefined,
        content: content.trim(),
        needResponse,
        token,
      });

      setStatus("success");
      setContact("");
      setContent("");
      setNeedResponse(false);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "의견 전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-8">
        <h1 className="flex items-center gap-2 text-[16px] font-semibold">
          💡 작은 아이디어라도 큰 힘이 됩니다
        </h1>

        <p className="mt-3 text-[16px] leading-[22px] text-neutral-10">
          여러분의 가장 작은 참여가 저희를 성장시킵니다.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Image src={ICON_EYE} alt="" width={26} height={26} style={{ height: "auto" }} />
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center gap-2 text-[16px] font-semibold">
              <span aria-hidden>✉️</span> 연락처
            </div>
            <div className="mt-2 border-b border-neutral-30 px-0.5 py-2 text-[16px] leading-[1.35] text-neutral-10 focus-within:border-[#8B5CF6]">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                inputMode="email"
                autoComplete="email"
                placeholder="이메일을 남겨주세요."
                className="w-full bg-transparent outline-none placeholder:text-neutral-60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[16px] font-semibold">
              <span aria-hidden>📝</span> 내용
            </div>
            <div className="mt-2 rounded-lg bg-[#151622] px-3 py-3 text-[16px] leading-[1.4] text-neutral-10">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="당신의 소중한 의견을 남겨주세요."
                className="min-h-[104px] w-full resize-none bg-transparent outline-none placeholder:text-neutral-60"
              />
            </div>

            <label className="mt-3 flex items-center gap-2 text-[12px] text-neutral-10">
              <input
                type="checkbox"
                checked={needResponse}
                onChange={(e) => setNeedResponse(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-30 bg-transparent accent-[#6422AB]"
              />
              답장이 필요한 경우 체크해 주세요. 💬
            </label>

            {status === "error" && (
              <div className="mt-2 text-[12px] text-red-300">
                {errorMessage ?? "의견 전송에 실패했어요. 잠시 후 다시 시도해 주세요."}
              </div>
            )}

            {status === "success" && (
              <div className="mt-2 text-[12px] text-emerald-300">
                의견이 전송됐어요. 감사합니다.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-2 w-full rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "보내는 중..." : "의견 보내기"}
          </button>
        </form>

      </section>
    </main>
  );
}

