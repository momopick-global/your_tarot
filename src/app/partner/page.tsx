"use client";

import { useMemo, useState } from "react";
import { API_ENDPOINTS } from "@/lib/constants";
import { postJson } from "@/lib/apiClient";

export default function PartnerPage() {
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (status === "submitting") return false;
    if (!company.trim()) return false;
    if (!name.trim()) return false;
    if (!email.trim()) return false;
    if (!type) return false;
    return true;
  }, [company, email, name, status, type]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setErrorMessage(null);

    try {
      await postJson<{ success: boolean }>(API_ENDPOINTS.partner, {
        company: company.trim(),
        name: name.trim(),
        email: email.trim(),
        website: website.trim() ? website.trim() : null,
        type,
        token: `local-dev-token-${Date.now()}`,
      });

      setStatus("success");
      setCompany("");
      setName("");
      setEmail("");
      setWebsite("");
      setType("");
    } catch (err) {
      setStatus("error");
      if (err instanceof Error && /API request failed: (404|405)/.test(err.message)) {
        setErrorMessage("제휴 문의 기능을 점검 중입니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : "문의 전송에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-8 pb-4">
        <h1 className="text-[16px] font-semibold">
          📩 제휴 문의(Partnership)
        </h1>

        <p className="mt-3 text-[16px] leading-[22px] text-neutral-10">
          유어타로는 함께 새로운 경험을 만들어보세요.
          <br />
          국내외의 다양한 파트너들과 함께 성장할 수 있는 제휴 제안을
          기다립니다.
        </p>

        <form
          className="mt-8 p-0"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center gap-2 text-[16px] font-semibold">
            <span aria-hidden>👤</span> 외화하시는 본의 정보를 알려주세요
          </div>

          <div className="mt-4 space-y-4 text-[16px]">
            <div className="space-y-1">
              <div className="text-neutral-30">회사명 / 브랜드명</div>
              <div className="min-h-[44px] border-b border-neutral-30 px-0.5 py-2.5 leading-[1.35] text-neutral-10 focus-within:border-[#8B5CF6]">
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="회사명 / 브랜드명을 입력해주세요."
                  className="w-full bg-transparent outline-none placeholder:text-neutral-60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-30">담당자 이름</div>
              <div className="min-h-[44px] border-b border-neutral-30 px-0.5 py-2.5 leading-[1.35] text-neutral-10 focus-within:border-[#8B5CF6]">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="담당자 이름을 입력해주세요."
                  className="w-full bg-transparent outline-none placeholder:text-neutral-60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-30">이메일 주소</div>
              <div className="min-h-[44px] border-b border-neutral-30 px-0.5 py-2.5 leading-[1.35] text-neutral-10 focus-within:border-[#8B5CF6]">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  inputMode="email"
                  autoComplete="email"
                  placeholder="예: name@company.com"
                  className="w-full bg-transparent outline-none placeholder:text-neutral-60"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-30">웹사이트</div>
              <div className="min-h-[44px] border-b border-neutral-30 px-0.5 py-2.5 leading-[1.35] text-neutral-10 focus-within:border-[#8B5CF6]">
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  inputMode="url"
                  autoComplete="url"
                  placeholder="웹사이트 또는 서비스 (선택)"
                  className="w-full bg-transparent outline-none placeholder:text-neutral-60"
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-[16px] font-semibold">📌 제휴 유형</div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["콘텐츠 제휴", "브랜드 협업", "광고 제휴", "기타"] as const).map((label) => {
                const isSelected = type === label;
                return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setType(label)}
                  className={[
                    "h-12 rounded-xl border text-[16px] transition",
                    isSelected ? "border-white bg-white text-[#151622]" : "border-neutral-30 bg-transparent text-neutral-10",
                  ].join(" ")}
                >
                  {label}
                </button>
                );
              })}
            </div>

            {status === "error" && (
              <div className="mt-3 text-[12px] text-red-300">
                {errorMessage ?? "문의 전송에 실패했어요. 잠시 후 다시 시도해 주세요."}
              </div>
            )}

            {status === "success" && (
              <div className="mt-3 text-[12px] text-emerald-300">
                문의가 전송됐어요. 감사합니다.
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 w-full rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? "보내는 중..." : "문의 보내기"}
            </button>

            <div className="mt-4 text-[12px] text-neutral-10">
              제휴 문의는 1주 내로 답변 드립니다.
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

