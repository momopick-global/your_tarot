"use client";

import { getMasterCardBackSrc } from "@/lib/masterCardAssets";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./card-swipe-deck.css";

const TOTAL_CARDS = 78;
const CARD_LABELS = Array.from({ length: TOTAL_CARDS }, (_, i) =>
  `${String(i + 1).padStart(2, "0")}`,
);

const makeShuffledOrder = () => {
  const order = Array.from({ length: TOTAL_CARDS }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

/** `public/card_swipe_mobile_demo.html` 과 동일한 스와이프 덱 (iframe 없음) */
export function CardSwipeDeck({
  masterId,
  onRevealChange,
}: Readonly<{
  masterId: string;
  onRevealChange?: (isRevealed: boolean) => void;
}>) {
  const router = useRouter();
  const deckAreaRef = useRef<HTMLDivElement | null>(null);
  /** 스냅 애니메이션 중에도 최신 값 — 「카드열기」 클릭 시 화면 중앙 카드와 일치 */
  const liveSelectedCardRef = useRef(0);
  const [deckIndex, setDeckIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [deckOrder, setDeckOrder] = useState(() => makeShuffledOrder());

  useEffect(() => {
    onRevealChange?.(isRevealed);
  }, [isRevealed, onRevealChange]);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });

  useEffect(() => {
    const root = deckAreaRef.current;
    if (!root) return;
    const deckArea = root;

    let currentIndex = 0;
    let progress = 0;
    let targetProgress = 0;
    let displayProgress = 0;
    let isDragging = false;
    let startX = 0;
    const dragWidth = 170;
    let pointerId: number | null = null;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let rafId: number | null = null;
    let snapRafId: number | null = null;
    let isSnapping = false;
    const cardElements: HTMLDivElement[] = [];

    /** 스와이프 progress(−1~1)를 반영해 화면 정중앙에 가장 가까운 덱 슬롯의 카드 ID(0~77) */
    function syncLiveSelectedCardFromVisual(prog: number) {
      const p = clamp(prog, -1, 1);
      let bestI = currentIndex;
      let bestAbs = Infinity;
      for (let i = 0; i < TOTAL_CARDS; i += 1) {
        const vo = wrapOffset(i - currentIndex) + p;
        const abs = Math.abs(vo);
        if (abs < bestAbs) {
          bestAbs = abs;
          bestI = i;
        }
      }
      liveSelectedCardRef.current = deckOrder[bestI] ?? 0;
    }

    function notifyDeckIndex() {
      setDeckIndex(liveSelectedCardRef.current);
    }

    function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    function wrapIndex(index: number) {
      return ((index % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS;
    }

    function wrapOffset(offset: number) {
      const half = Math.floor(TOTAL_CARDS / 2);
      let v = offset;
      if (v > half) v -= TOTAL_CARDS;
      if (v < -half) v += TOTAL_CARDS;
      return v;
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function getCardStyle(offset: number) {
      const side = offset === 0 ? 0 : offset > 0 ? 1 : -1;
      const abs = Math.abs(offset);

      const center = { x: 0, y: -6, scale: 1.12, rotate: 0 };
      const near = { x: 72, y: 24, scale: 0.95, rotate: 10 };
      const far = { x: 104, y: 48, scale: 0.87, rotate: 15 };
      const outer = { x: 130, y: 66, scale: 0.81, rotate: 13 };
      const outer2 = { x: 150, y: 78, scale: 0.75, rotate: 11 };

      let x = 0;
      let y = 0;
      let scale = 1;
      let rotate = 0;

      if (abs <= 1) {
        const t = abs;
        x = lerp(center.x, near.x, t) * side;
        y = lerp(center.y, near.y, t);
        scale = lerp(center.scale, near.scale, t);
        rotate = lerp(center.rotate, near.rotate, t) * side;
      } else if (abs <= 2) {
        const t = clamp(abs - 1, 0, 1);
        x = lerp(near.x, far.x, t) * side;
        y = lerp(near.y, far.y, t);
        scale = lerp(near.scale, far.scale, t);
        rotate = lerp(near.rotate, far.rotate, t) * side;
      } else if (abs <= 3) {
        const t = clamp(abs - 2, 0, 1);
        x = lerp(far.x, outer.x, t) * side;
        y = lerp(far.y, outer.y, t);
        scale = lerp(far.scale, outer.scale, t);
        rotate = lerp(far.rotate, outer.rotate, t) * side;
      } else if (abs <= 4) {
        const t = clamp(abs - 3, 0, 1);
        x = lerp(outer.x, outer2.x, t) * side;
        y = lerp(outer.y, outer2.y, t);
        scale = lerp(outer.scale, outer2.scale, t);
        rotate = lerp(outer.rotate, outer2.rotate, t) * side;
      } else {
        x = outer2.x * side;
        y = outer2.y;
        scale = outer2.scale;
        rotate = outer2.rotate * side;
      }

      return { x, y, scale, rotate };
    }

    function updateCards(nextProgress: number) {
      progress = clamp(nextProgress, -1, 1);

      for (let i = 0; i < cardElements.length; i += 1) {
        const el = cardElements[i];
        const rawOffset = wrapOffset(i - currentIndex);
        const visualOffset = rawOffset + progress;

        if (Math.abs(visualOffset) > 4.1) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          continue;
        }

        const style = getCardStyle(visualOffset);
        const abs = Math.abs(visualOffset);
        const zIndex = 360 - Math.round(abs * 44);
        let opacity = abs <= 4 ? 1 : Math.max(0.72, 1 - (abs - 4) * 0.9);
        const blur = abs < 3.2 ? 0 : (abs - 3.2) * 0.55;
        let x = style.x;
        let y = style.y;
        let scale = style.scale;

        // "카드열기" 이후: 중앙 카드만 남기고 양옆 카드는 바깥으로 이탈/페이드아웃
        if (isRevealed) {
          if (abs < 0.6) {
            scale = style.scale * 1.04;
            y = style.y - 8;
          } else {
            const side = visualOffset >= 0 ? 1 : -1;
            x = style.x + side * 220;
            y = style.y + Math.min(24, abs * 8);
            opacity = 0;
          }
        }

        el.style.opacity = String(opacity);
        el.style.zIndex = String(zIndex);
        el.style.pointerEvents = !isRevealed && abs < 0.6 ? "auto" : "none";
        el.style.filter = `blur(${blur.toFixed(2)}px)`;
        el.style.transform =
          `translateX(-50%) ` +
          `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) ` +
          `scale(${scale.toFixed(4)}) ` +
          `rotate(${style.rotate.toFixed(2)}deg)`;
      }

      syncLiveSelectedCardFromVisual(progress);
    }

    function requestRender() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(renderLoop);
    }

    function renderLoop() {
      rafId = null;
      const smoothing = isSnapping ? 0.22 : 0.34;
      displayProgress = lerp(displayProgress, targetProgress, smoothing);
      updateCards(displayProgress);

      if (Math.abs(targetProgress - displayProgress) > 0.001) {
        requestRender();
      } else {
        displayProgress = targetProgress;
        updateCards(displayProgress);
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (isRevealed) return;
      if (snapRafId !== null) {
        cancelAnimationFrame(snapRafId);
        snapRafId = null;
        isSnapping = false;
        targetProgress = displayProgress;
        updateCards(displayProgress);
      }

      isDragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      deckArea.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      targetProgress = clamp(dx / dragWidth, -1, 1);
      requestRender();

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) velocity = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
    }

    function onPointerUp(e: PointerEvent) {
      if (!isDragging || e.pointerId !== pointerId) return;
      isDragging = false;
      deckArea.releasePointerCapture(e.pointerId);
      pointerId = null;

      const absProgress = Math.abs(targetProgress);
      const absVelocity = Math.abs(velocity);
      const intent = absVelocity > 0.15 ? velocity : targetProgress;
      const direction = intent < 0 ? 1 : -1;
      const projectedCards = absProgress * 1.55 + absVelocity * 7.8;
      let stepCount = Math.floor(projectedCards + 0.08);

      if (stepCount === 0 && (absProgress > 0.2 || absVelocity > 0.18)) {
        stepCount = 1;
      }

      stepCount = clamp(stepCount, 0, 12);
      const step = direction * stepCount;
      snapToNearest(step);
    }

    function easeOutLongTail(t: number) {
      if (t < 0.8) {
        const p = t / 0.8;
        return 0.88 * (1 - (1 - p) ** 3);
      }
      const p = (t - 0.8) / 0.2;
      return 0.88 + 0.12 * (1 - (1 - p) ** 5);
    }

    function snapToNearest(step = 0) {
      if (snapRafId !== null) cancelAnimationFrame(snapRafId);
      isSnapping = true;

      const from = displayProgress;
      const to = step === 0 ? 0 : -step;
      const duration = clamp(980 + Math.abs(step) * 140, 980, 2400);
      const start = performance.now();

      function tick(now: number) {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = easeOutLongTail(t);
        let p = lerp(from, to, eased);

        while (p <= -1) {
          currentIndex = wrapIndex(currentIndex + 1);
          p += 1;
        }
        while (p >= 1) {
          currentIndex = wrapIndex(currentIndex - 1);
          p -= 1;
        }

        targetProgress = p;
        displayProgress = p;
        updateCards(p);
        setDeckIndex(liveSelectedCardRef.current);

        if (t < 1) {
          snapRafId = requestAnimationFrame(tick);
          return;
        }

        targetProgress = 0;
        displayProgress = 0;
        updateCards(0);
        isSnapping = false;
        snapRafId = null;
        notifyDeckIndex();
      }

      snapRafId = requestAnimationFrame(tick);
    }

    function createCards() {
      deckArea.innerHTML = "";
      cardElements.length = 0;
      for (let i = 0; i < TOTAL_CARDS; i += 1) {
        const el = document.createElement("div");
        const label = document.createElement("span");
        el.className = "card";
        label.textContent = CARD_LABELS[deckOrder[i] ?? i];
        el.appendChild(label);
        el.dataset.index = String(i);
        deckArea.appendChild(el);
        cardElements.push(el);
      }
      updateCards(0);
      notifyDeckIndex();
    }

    function bindEvents() {
      deckArea.addEventListener("pointerdown", onPointerDown);
      deckArea.addEventListener("pointermove", onPointerMove);
      deckArea.addEventListener("pointerup", onPointerUp);
      deckArea.addEventListener("pointercancel", onPointerUp);
    }

    function unbindEvents() {
      deckArea.removeEventListener("pointerdown", onPointerDown);
      deckArea.removeEventListener("pointermove", onPointerMove);
      deckArea.removeEventListener("pointerup", onPointerUp);
      deckArea.removeEventListener("pointercancel", onPointerUp);
    }

    createCards();
    bindEvents();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (snapRafId !== null) cancelAnimationFrame(snapRafId);
      unbindEvents();
      deckArea.innerHTML = "";
      cardElements.length = 0;
    };
  }, [isRevealed, resetKey, deckOrder]);

  const cardBackUrl = `url("${getMasterCardBackSrc(masterId)}")`;

  return (
    <div
      className="card-swipe-deck page-fade mx-auto flex h-full min-h-0 w-full max-w-[390px] flex-col [color-scheme:dark]"
      style={{ "--card-back-url": cardBackUrl } as CSSProperties}
    >
      <div
        ref={deckAreaRef}
        className={`deck-area${isRevealed ? " pointer-events-none" : ""}`}
        aria-disabled={isRevealed}
      />

      <div className="pb-3 pt-2 text-center text-[11px] text-[#b9abdf]">
        선택 카드: #{String(deckIndex + 1).padStart(2, "0")}
      </div>

      <div className="mt-auto mx-auto grid w-full max-w-[350px] grid-cols-2 gap-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <button
          type="button"
          onClick={() => {
            if (isShuffling) return;
            if (!isRevealed) {
              setIsRevealed(true);
              return;
            }
            const chosen = String(liveSelectedCardRef.current);
            router.push(
              `/page_06_analyzing?master=${encodeURIComponent(masterId)}&card=${encodeURIComponent(chosen)}`,
            );
          }}
          disabled={isShuffling}
          className="rounded-2xl bg-[#6422AB] px-3 py-3 text-center text-[20px] font-semibold text-white disabled:opacity-70"
        >
          {isRevealed ? "카드해석" : "카드열기"}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (isShuffling) return;
            setIsShuffling(true);
            const deck = deckAreaRef.current;
            if (!deck) {
              setIsShuffling(false);
              return;
            }

            const cards = Array.from(deck.querySelectorAll<HTMLDivElement>(".card"));
            cards.forEach((el, idx) => {
              const delay = (idx % 10) * 12;
              el.style.transition = `translate 220ms cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}ms`;
            });

            // 1) 카드가 오른쪽으로 겹쳐 쌓임
            cards.forEach((el, idx) => {
              const y = Math.min(26, idx * 1.4);
              el.style.translate = `72px ${y}px`;
            });
            await wait(260);

            // 2) 카드가 왼쪽으로 겹쳐 쌓임
            cards.forEach((el, idx) => {
              const y = Math.min(22, idx * 1.2);
              el.style.translate = `-68px ${y}px`;
            });
            await wait(260);

            // 3) 원위치로 복귀 후 덱 재배치(리셋)
            cards.forEach((el) => {
              el.style.translate = "0 0";
            });
            await wait(180);

            cards.forEach((el) => {
              el.style.transition = "";
              el.style.translate = "";
            });

            setDeckOrder(makeShuffledOrder());
            setResetKey((k) => k + 1);
            setIsRevealed(false);
            setIsShuffling(false);
          }}
          disabled={isShuffling}
          className="rounded-2xl border border-primary bg-[rgba(12,10,36,0.92)] px-3 py-3 text-center text-[16px] text-[#d8ccff] disabled:opacity-70"
        >
          {isShuffling ? "카드 섞는 중..." : "카드섞기"}
        </button>
      </div>
    </div>
  );
}
