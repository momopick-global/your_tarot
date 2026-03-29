"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";

import { withAssetBase } from "@/lib/publicPath";
import { tarotRevealWith } from "@/lib/routes";

const CARD_BACK = withAssetBase("/assets/card-back-page04.png");
const TOTAL_CARDS = 78;
const VISIBLE_CARDS = 7;
const MAX_VISIBLE_OFFSET = Math.floor(VISIBLE_CARDS / 2);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** public/card_swipe_mobile_demo.html 과 동일 */
const DRAG_WIDTH_PX = 170;

function easeOutLongTail(t: number) {
  if (t < 0.8) {
    const p = t / 0.8;
    return 0.88 * (1 - Math.pow(1 - p, 3));
  }
  const p = (t - 0.8) / 0.2;
  return 0.88 + 0.12 * (1 - Math.pow(1 - p, 5));
}

/** 데모 getCardStyle — signed visual offset */
function getCardStyleDemo(offset: number) {
  const side = offset === 0 ? 0 : offset > 0 ? 1 : -1;
  const abs = Math.abs(offset);

  const center = { x: 0, y: -6, scale: 1.12, rotate: 0 };
  const near = { x: 102, y: 26, scale: 0.95, rotate: 10 };
  const far = { x: 168, y: 58, scale: 0.85, rotate: 18 };
  const outer = { x: 184, y: 84, scale: 0.79, rotate: 16 };

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
  } else {
    x = outer.x * side;
    y = outer.y;
    scale = outer.scale;
    rotate = outer.rotate * side;
  }

  return { x, y, scale, rotate };
}

export function CardInteractionBoard({
  masterId,
}: Readonly<{
  masterId: string;
}>) {
  const router = useRouter();
  const [deckOrder, setDeckOrder] = useState<number[]>(
    Array.from({ length: TOTAL_CARDS }, (_, idx) => idx),
  );
  const [selectedCard, setSelectedCard] = useState(39);
  /** 카드섞기 흐름용 연속 인덱스 (데모와 별도) */
  const [displayIndex, setDisplayIndex] = useState(39);
  /** 일반 스와이프: 데모와 동일 — 중앙 덱 슬롯(0..77) + progress(-1..1) */
  const [deckCenter, setDeckCenter] = useState(39);
  const [swipeP, setSwipeP] = useState(0);

  const [isFlowing, setIsFlowing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isDeckDragging, setIsDeckDragging] = useState(false);

  const dragStartX = useRef<number | null>(null);
  const dragStartAt = useRef<number>(0);
  const lastMoveX = useRef<number | null>(null);
  const lastMoveTime = useRef<number | null>(null);
  const velocityRef = useRef(0);

  const displayIndexRef = useRef(39);
  const deckCenterRef = useRef(39);
  const swipeTargetRef = useRef(0);
  const swipeDisplayRef = useRef(0);
  const isSnapAnimRef = useRef(false);

  const flowVelocity = useRef(0);
  const flowStopRequested = useRef(false);
  const flowLastTime = useRef(0);
  const flowTraveled = useRef(0);
  const draggedEnough = useRef(false);

  const rafRef = useRef<number | null>(null);
  const swipeDragRafRef = useRef<number | null>(null);
  const swipeSnapRafRef = useRef<number | null>(null);
  const deckOrderRef = useRef(deckOrder);

  useEffect(() => {
    displayIndexRef.current = displayIndex;
  }, [displayIndex]);

  useEffect(() => {
    deckCenterRef.current = deckCenter;
  }, [deckCenter]);

  useEffect(() => {
    deckOrderRef.current = deckOrder;
  }, [deckOrder]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (swipeDragRafRef.current) cancelAnimationFrame(swipeDragRafRef.current);
      if (swipeSnapRafRef.current) cancelAnimationFrame(swipeSnapRafRef.current);
    };
  }, []);

  /** 쿼리·에셋(`{n}.webp`)과 동일한 0~77 인덱스 */
  const cardQueryParam = useMemo(() => String(selectedCard).padStart(2, "0"), [selectedCard]);
  /** 화면 표기 — 에셋 번호와 동일(0~77) */
  const displayCardNo = useMemo(() => String(selectedCard).padStart(2, "0"), [selectedCard]);

  const syncSelectedFromCenter = useCallback((center: number) => {
    const c = mod(center, TOTAL_CARDS);
    setSelectedCard(deckOrderRef.current[c] ?? 0);
  }, []);

  const stopSwipeDragLoop = useCallback(() => {
    if (swipeDragRafRef.current) {
      cancelAnimationFrame(swipeDragRafRef.current);
      swipeDragRafRef.current = null;
    }
  }, []);

  const runSwipeDragLoop = useCallback(() => {
    swipeDragRafRef.current = null;
    const smoothing = isSnapAnimRef.current ? 0.22 : 0.34;
    swipeDisplayRef.current = lerp(swipeDisplayRef.current, swipeTargetRef.current, smoothing);
    setSwipeP(swipeDisplayRef.current);
    syncSelectedFromCenter(deckCenterRef.current);

    if (Math.abs(swipeTargetRef.current - swipeDisplayRef.current) > 0.001) {
      swipeDragRafRef.current = requestAnimationFrame(runSwipeDragLoop);
    }
  }, [syncSelectedFromCenter]);

  const animateToIndex = (
    target: number,
    onDone?: () => void,
    durationOverride?: number,
    easingFn: (t: number) => number = (t) => 1 - Math.pow(1 - t, 3),
  ) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = displayIndexRef.current;
    const distance = Math.abs(target - from);
    const duration = durationOverride ?? Math.min(420, 170 + distance * 28);
    const startedAt = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = easingFn(t);
      const value = from + (target - from) * eased;
      setDisplayIndex(value);
      const rounded = mod(Math.round(value), TOTAL_CARDS);
      setSelectedCard(deckOrderRef.current[rounded] ?? 0);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setDisplayIndex(target);
      const finalRounded = mod(Math.round(target), TOTAL_CARDS);
      setSelectedCard(deckOrderRef.current[finalRounded] ?? 0);
      rafRef.current = null;
      onDone?.();
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const shuffledDeck = () => {
    const arr = Array.from({ length: TOTAL_CARDS }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const beginFlow = (
    direction: "left" | "right",
    initialBoost = 0,
    options?: {
      shuffleDeck?: boolean;
      resetToStart?: boolean;
    },
  ) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopSwipeDragLoop();
    if (swipeSnapRafRef.current) {
      cancelAnimationFrame(swipeSnapRafRef.current);
      swipeSnapRafRef.current = null;
    }
    isSnapAnimRef.current = false;

    const shouldShuffle = options?.shuffleDeck ?? false;
    const shouldResetToStart = options?.resetToStart ?? false;

    if (shouldShuffle) {
      const newDeck = shuffledDeck();
      setDeckOrder(newDeck);
      deckOrderRef.current = newDeck;
    }

    if (shouldResetToStart) {
      setDisplayIndex(0);
      displayIndexRef.current = 0;
      setDeckCenter(0);
      deckCenterRef.current = 0;
      setSwipeP(0);
      swipeDisplayRef.current = 0;
      swipeTargetRef.current = 0;
      setSelectedCard(deckOrderRef.current[0] ?? 0);
    } else {
      const rounded = mod(Math.round(displayIndexRef.current), TOTAL_CARDS);
      setSelectedCard(deckOrderRef.current[rounded] ?? 0);
    }
    setIsFlowing(true);

    flowVelocity.current = (direction === "left" ? 1 : -1) * (1.45 + initialBoost * 0.85);
    flowStopRequested.current = false;
    flowLastTime.current = 0;
    flowTraveled.current = 0;

    const minTravel = TOTAL_CARDS * 1.1;

    const tick = (now: number) => {
      if (!flowLastTime.current) flowLastTime.current = now;
      const dt = Math.min(32, now - flowLastTime.current || 16.7);
      flowLastTime.current = now;

      const frameStep = flowVelocity.current * (dt / 16.7);
      const next = displayIndexRef.current + frameStep;
      flowTraveled.current += Math.abs(frameStep);

      setDisplayIndex(next);
      displayIndexRef.current = next;

      const rounded = mod(Math.round(next), TOTAL_CARDS);
      const cardIdx = deckOrderRef.current[rounded] ?? 0;
      setSelectedCard(cardIdx);

      if (flowStopRequested.current) {
        flowVelocity.current *= 0.92;
      } else if (flowTraveled.current >= minTravel) {
        flowVelocity.current *= 0.979;
        if (Math.abs(flowVelocity.current) <= 0.34) flowStopRequested.current = true;
      }

      if (flowStopRequested.current && Math.abs(flowVelocity.current) <= 0.09) {
        const target = mod(Math.round(displayIndexRef.current), TOTAL_CARDS);
        animateToIndex(target, () => {
          setIsFlowing(false);
          flowVelocity.current = 0;
          flowStopRequested.current = false;
          flowLastTime.current = 0;
          flowTraveled.current = 0;
          const c = mod(Math.round(displayIndexRef.current), TOTAL_CARDS);
          setDeckCenter(c);
          deckCenterRef.current = c;
          setSwipeP(0);
          swipeDisplayRef.current = 0;
          swipeTargetRef.current = 0;
        });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const snapToNearestDemo = useCallback(
    (step: number) => {
      if (swipeSnapRafRef.current) cancelAnimationFrame(swipeSnapRafRef.current);
      isSnapAnimRef.current = true;

      const from = swipeDisplayRef.current;
      const to = step === 0 ? 0 : -step;
      const duration = clamp(980 + Math.abs(step) * 140, 980, 2400);
      const start = performance.now();

      const tick = (now: number) => {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = easeOutLongTail(t);
        let p = lerp(from, to, eased);

        while (p <= -1) {
          deckCenterRef.current = mod(deckCenterRef.current + 1, TOTAL_CARDS);
          p += 1;
        }
        while (p >= 1) {
          deckCenterRef.current = mod(deckCenterRef.current - 1, TOTAL_CARDS);
          p -= 1;
        }

        swipeTargetRef.current = p;
        swipeDisplayRef.current = p;
        setDeckCenter(deckCenterRef.current);
        setSwipeP(p);
        syncSelectedFromCenter(deckCenterRef.current);

        if (t < 1) {
          swipeSnapRafRef.current = requestAnimationFrame(tick);
          return;
        }

        swipeTargetRef.current = 0;
        swipeDisplayRef.current = 0;
        setDeckCenter(deckCenterRef.current);
        setSwipeP(0);
        syncSelectedFromCenter(deckCenterRef.current);
        isSnapAnimRef.current = false;
        swipeSnapRafRef.current = null;
      };

      swipeSnapRafRef.current = requestAnimationFrame(tick);
    },
    [syncSelectedFromCenter],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isOpening) return;

    if (swipeSnapRafRef.current) {
      cancelAnimationFrame(swipeSnapRafRef.current);
      swipeSnapRafRef.current = null;
      isSnapAnimRef.current = false;
      swipeTargetRef.current = swipeDisplayRef.current;
      setSwipeP(swipeDisplayRef.current);
    }

    if (rafRef.current && !isFlowing) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (isFlowing) {
      flowStopRequested.current = true;
      return;
    }

    stopSwipeDragLoop();

    dragStartAt.current = performance.now();
    dragStartX.current = e.clientX;
    lastMoveX.current = e.clientX;
    lastMoveTime.current = performance.now();
    velocityRef.current = 0;
    draggedEnough.current = false;

    swipeDisplayRef.current = swipeP;
    swipeTargetRef.current = swipeP;
    deckCenterRef.current = deckCenter;

    setIsDeckDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isOpening || isFlowing) return;
    if (dragStartX.current === null) return;

    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 8) draggedEnough.current = true;

    swipeTargetRef.current = clamp(delta / DRAG_WIDTH_PX, -1, 1);

    if (swipeDragRafRef.current === null) {
      swipeDragRafRef.current = requestAnimationFrame(runSwipeDragLoop);
    }

    const now = performance.now();
    if (lastMoveX.current !== null && lastMoveTime.current !== null) {
      const dt = now - lastMoveTime.current;
      if (dt > 0) velocityRef.current = (e.clientX - lastMoveX.current) / dt;
    }
    lastMoveX.current = e.clientX;
    lastMoveTime.current = now;
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isOpening || isFlowing) return;

    stopSwipeDragLoop();

    if (dragStartX.current !== null) {
      const delta = e.clientX - dragStartX.current;
      const targetP = clamp(delta / DRAG_WIDTH_PX, -1, 1);
      const elapsed = Math.max(1, performance.now() - dragStartAt.current);
      const avgVelocity = delta / elapsed;
      const v = Math.abs(velocityRef.current) > Math.abs(avgVelocity) ? velocityRef.current : avgVelocity;
      const absV = Math.abs(v);
      const absProgress = Math.abs(targetP);
      const absVelocity = Math.abs(velocityRef.current);

      if (Math.abs(delta) >= 8 || absV >= 0.12) {
        const intent = absVelocity > 0.15 ? velocityRef.current : targetP;
        const direction = intent < 0 ? 1 : -1;
        const projectedCards = absProgress * 1.55 + absVelocity * 7.8;
        let stepCount = Math.floor(projectedCards + 0.08);
        if (stepCount === 0 && (absProgress > 0.2 || absVelocity > 0.18)) stepCount = 1;
        stepCount = clamp(stepCount, 0, 12);
        const step = direction * stepCount;
        snapToNearestDemo(step);
      } else {
        snapToNearestDemo(0);
      }
    }

    dragStartX.current = null;
    lastMoveX.current = null;
    lastMoveTime.current = null;
    velocityRef.current = 0;
    setIsDeckDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const startShuffleFlow = () => {
    if (isOpening) return;
    if (isFlowing) return;
    setDisplayIndex(deckCenterRef.current);
    displayIndexRef.current = deckCenterRef.current;
    beginFlow("left", 0.5, {
      shuffleDeck: true,
      resetToStart: true,
    });
  };

  const startOpenFlow = () => {
    if (isOpening) return;
    setIsOpening(true);
    window.setTimeout(() => {
      router.push(tarotRevealWith(masterId, cardQueryParam));
    }, 520);
  };

  return (
    <div className="page-fade">
      <div
        className={`relative left-1/2 mt-10 h-[310px] w-[390px] -translate-x-1/2 touch-none overflow-visible ${
          isOpening ? "pointer-events-none" : ""
        }`}
        style={{ touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {Array.from({ length: VISIBLE_CARDS }, (_, index) => {
          const relative = index - MAX_VISIBLE_OFFSET;

          let deckPos: number;
          let visualOffset: number;

          if (isFlowing) {
            const base = Math.floor(displayIndex);
            const fraction = displayIndex - base;
            visualOffset = relative - fraction;
            deckPos = mod(base + relative, TOTAL_CARDS);
          } else {
            deckPos = mod(deckCenter + relative, TOTAL_CARDS);
            visualOffset = relative + swipeP;
          }

          const cardIdx = deckOrder[deckPos] ?? 0;
          const absVo = Math.abs(visualOffset);
          const hideSlot = !isFlowing && absVo > 3.1;

          let x = 0;
          let y = -6;
          let scale = 1.12;
          let rotate = 0;
          let opacity = 1;
          let blur = 0;

          if (isFlowing) {
            const clamped = clamp(visualOffset, -3.2, 3.2);
            const absClamped = Math.abs(clamped);
            const dir = clamped === 0 ? 0 : clamped > 0 ? 1 : -1;
            if (absClamped <= 1) {
              x = dir * (absClamped * 102);
              y = -6 + absClamped * 32;
              scale = 1.12 - absClamped * 0.17;
              rotate = dir * (absClamped * 10);
            } else if (absClamped <= 2) {
              const local = absClamped - 1;
              x = dir * (102 + local * 66);
              y = 26 + local * 32;
              scale = 0.95 - local * 0.1;
              rotate = dir * (10 + local * 8);
              blur = local * 0.2;
            } else {
              const local = Math.min(1, absClamped - 2);
              x = dir * (168 + local * 16);
              y = 58 + local * 26;
              scale = 0.85 - local * 0.06;
              rotate = dir * (18 + local * 6);
              blur = local * 0.5;
            }
            if (absClamped > 3.1) {
              opacity = 0;
              blur = 4;
            }
            if (absClamped > 0.15) blur = Math.max(1.2, blur);
          } else {
            const style = getCardStyleDemo(visualOffset);
            x = style.x;
            y = style.y;
            scale = style.scale;
            rotate = style.rotate;
            const abs = absVo;
            opacity = hideSlot ? 0 : abs <= 3 ? 1 : Math.max(0.75, 1 - (abs - 3) * 0.8);
            blur = hideSlot
              ? 4
              : abs < 2.6
                ? 0
                : (abs - 2.6) * 0.5;
            if (!hideSlot && abs > 0.15) blur = Math.max(1.0, blur);
          }

          const width = 128;
          const height = 198;
          const zIndex = 320 - Math.round(absVo * 52);
          const isVisibleCard = !hideSlot && absVo <= 3.1;
          const exitY = isOpening ? 120 + absVo * 16 : 0;
          const exitScale = isOpening ? 0.9 : 1;
          const exitOpacity = isOpening ? Math.max(0, 0.12 - absVo * 0.02) : 1;
          const exitBlur = isOpening ? 2.4 : 0;

          return (
            <button
              key={`${isFlowing ? "f" : "s"}-${deckPos}-${cardIdx}-${relative}`}
              type="button"
              onClick={() => {
                if (draggedEnough.current) return;
                if (isFlowing) return;
                const newCenter = mod(deckCenter + relative, TOTAL_CARDS);
                setDeckCenter(newCenter);
                deckCenterRef.current = newCenter;
                setSwipeP(0);
                swipeDisplayRef.current = 0;
                swipeTargetRef.current = 0;
                setSelectedCard(deckOrderRef.current[newCenter] ?? 0);
              }}
              className={`absolute bottom-0 left-1/2 overflow-hidden rounded-[14px] border bg-[#0f0a24] shadow-[0_14px_26px_rgba(4,3,14,0.5)] ${
                isDeckDragging || isFlowing ? "" : "transition-[transform,filter,opacity] duration-500 ease-out"
              } ${absVo < 0.55 ? "border-[#8F55FF]" : "border-[#7A5BC6]"}`}
              style={{
                width,
                height,
                transform: `translateX(-50%) translate(${x}px, ${y + exitY}px) scale(${scale * exitScale}) rotate(${rotate}deg)`,
                zIndex,
                opacity: opacity * exitOpacity,
                filter: `blur(${blur + exitBlur}px)`,
                pointerEvents: isVisibleCard ? "auto" : "none",
                willChange: isDeckDragging ? "transform, filter, opacity" : "auto",
              }}
            >
              <Image src={CARD_BACK} alt="카드 뒷면" fill className="object-cover" />
            </button>
          );
        })}
      </div>

      <div className="pb-6 text-center text-[11px] text-[#b9abdf]">선택 카드: #{displayCardNo}</div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={startOpenFlow}
          disabled={isOpening}
          className="rounded-2xl bg-[#6422AB] px-3 py-3 text-center text-[20px] font-semibold text-white"
        >
          {isOpening ? "카드 여는 중..." : "카드 열기"}
        </button>
        <button
          type="button"
          onClick={startShuffleFlow}
          disabled={isOpening}
          className="rounded-2xl border border-primary bg-[rgba(12,10,36,0.92)] px-3 py-3 text-center text-[16px] text-[#d8ccff]"
        >
          {isFlowing ? "흐름 중..." : "카드섞기"}
        </button>
      </div>
    </div>
  );
}
