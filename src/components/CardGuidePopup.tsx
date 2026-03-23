"use client";

type CardGuidePopupProps = {
  onClose: () => void;
};

export function CardGuidePopup({ onClose }: Readonly<CardGuidePopupProps>) {
  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
    >
      {/* 배경 탭으로 닫히지 않음 — 닫기 버튼만 사용 */}
      <div className="absolute inset-0 bg-[rgba(2,1,10,0.55)] backdrop-blur-[3px]" aria-hidden />
      <div className="relative z-10 w-full max-w-[350px] rounded-xl border border-primary bg-[rgba(9,7,28,0.94)] p-4 text-white shadow-2xl">
        <div className="min-w-0 text-[16px] leading-[1.6] text-white">
          천천히 카드를 움직여 보세요.
          <br />
          당신에게 끌리는 카드가 있을 것입니다.
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-primary px-3 py-2 text-center text-[16px] text-[#d6cbff]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

