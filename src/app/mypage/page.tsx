"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { loginUrlWithReturnTo, MYPAGE_PATH } from "@/lib/authReturnPath";
import { FLOW_MASTERS } from "@/lib/flowData";
import { getMasterCardFrontSrc } from "@/lib/masterCardAssets";
import {
  cardIndexFromStoredImagePath,
  deleteAllTarotResultsForUser,
  deleteTarotResultById,
  fetchTarotResultsForUser,
  type TarotResultRow,
} from "@/lib/tarotResultsDb";
import {
  clearSavedReadings,
  readSavedReadings,
  removeSavedReading,
  type SavedReading,
} from "@/lib/savedReadings";
import { tarotResultWith } from "@/lib/routes";

function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "저장 시간 정보 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function useSupabaseConfigured(): boolean {
  return Boolean(
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0,
  );
}

export default function MyPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useUser();
  const supabaseConfigured = useSupabaseConfigured();

  const [savedLocal, setSavedLocal] = useState<SavedReading[]>(() =>
    supabaseConfigured ? [] : readSavedReadings(),
  );
  const [cloudRows, setCloudRows] = useState<TarotResultRow[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const masterMap = useMemo(() => new Map(FLOW_MASTERS.map((m) => [m.id, m])), []);
  const masterIdByName = useMemo(() => new Map(FLOW_MASTERS.map((m) => [m.name, m.id])), []);

  const refreshCloud = useCallback(async () => {
    if (!user?.id) {
      setCloudRows([]);
      return;
    }
    setCloudLoading(true);
    setCloudError(null);
    const { data, error } = await fetchTarotResultsForUser(user.id);
    setCloudLoading(false);
    if (error) {
      setCloudError(error.message);
      setCloudRows([]);
      return;
    }
    setCloudRows(data);
  }, [user]);

  useEffect(() => {
    if (!supabaseConfigured || authLoading) return;
    if (!user) {
      queueMicrotask(() => {
        setCloudRows([]);
        setCloudLoading(false);
      });
      return;
    }
    queueMicrotask(() => {
      void refreshCloud();
    });
  }, [supabaseConfigured, authLoading, user, refreshCloud]);

  /** Supabase 사용 시 비로그인이 /mypage 로 직접 들어오면 로그인으로 */
  useEffect(() => {
    if (!supabaseConfigured || authLoading) return;
    if (!user) {
      router.replace(loginUrlWithReturnTo(MYPAGE_PATH));
    }
  }, [supabaseConfigured, authLoading, user, router]);

  const onLogout = async () => {
    await logout();
    router.push("/");
  };

  if (supabaseConfigured && !authLoading && !user) {
    return (
      <main className="flex-1">
        <section className="mx-auto w-full max-w-[390px] px-5 pt-14 text-center text-[16px] text-[#d8ccff]">
          로그인 페이지로 이동 중…
        </section>
      </main>
    );
  }

  const onDeleteOneLocal = (id: string) => {
    setSavedLocal(removeSavedReading(id));
  };

  const onDeleteAllLocal = () => {
    const ok = window.confirm("저장된 결과를 모두 삭제할까요?");
    if (!ok) return;
    setSavedLocal(clearSavedReadings());
  };

  const onDeleteOneCloud = async (id: number | string) => {
    const { error } = await deleteTarotResultById(id);
    if (error) {
      window.alert(error.message);
      return;
    }
    void refreshCloud();
  };

  const onDeleteAllCloud = async () => {
    if (!user) return;
    const ok = window.confirm("클라우드에 저장된 타로 기록을 모두 삭제할까요?");
    if (!ok) return;
    const { error } = await deleteAllTarotResultsForUser(user.id);
    if (error) {
      window.alert(error.message);
      return;
    }
    void refreshCloud();
  };

  const renderLocalList = () => (
    <>
      {savedLocal.length === 0 ? (
        <p className="text-[13px] text-[#d8ccff]">아직 저장된 결과가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {savedLocal.map((item) => {
            const master = masterMap.get(item.masterId) ?? FLOW_MASTERS[0];
            const href = tarotResultWith(item.masterId, item.card);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-[rgba(255,255,255,0.03)] p-2"
              >
                <div className="relative h-[64px] w-[43px] overflow-hidden rounded-md border border-white/20">
                  <Image
                    src={getMasterCardFrontSrc(item.masterId, item.card)}
                    alt={`${master.name} ${item.card}번 카드`}
                    fill
                    className="object-cover"
                    sizes="43px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={href} className="block">
                    <div className="truncate text-[13px] font-semibold text-white">
                      {item.titleEn || `Card #${item.card}`}
                    </div>
                    <div className="truncate text-[12px] text-[#d8ccff]">
                      {master.name} · {item.titleKo || `${item.card}번 카드`}
                    </div>
                  </Link>
                  <div className="pt-1 text-[11px] text-[#aa9dce]">{formatSavedAt(item.createdAt)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteOneLocal(item.id)}
                  className="shrink-0 rounded-md border border-white/20 px-2 py-1 text-[11px] text-[#e8deff]"
                >
                  삭제
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  const renderCloudList = () => {
    if (authLoading || (user && cloudLoading)) {
      return <p className="text-[13px] text-[#d8ccff]">불러오는 중…</p>;
    }
    if (!user) {
      return (
        <div className="space-y-3 text-[13px] leading-relaxed text-[#d8ccff]">
          <p>로그인하면 타로 결과가 클라우드에 저장되고, 여기에서 모아볼 수 있어요.</p>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-[#6422AB] px-4 py-2 text-center text-[16px] font-semibold text-white"
          >
            로그인하기
          </Link>
        </div>
      );
    }
    if (cloudError) {
      return <p className="text-[13px] text-[#e8a598]">{cloudError}</p>;
    }
    if (cloudRows.length === 0) {
      return <p className="text-[13px] text-[#d8ccff]">아직 저장된 타로 기록이 없습니다.</p>;
    }
    return (
      <div className="space-y-3">
        {cloudRows.map((row) => {
          const masterId = masterIdByName.get(row.master_name) ?? FLOW_MASTERS[0].id;
          const cardIdx = cardIndexFromStoredImagePath(row.card_image);
          const href = tarotResultWith(masterId, cardIdx);
          const imgSrc = row.card_image.startsWith("/") ? row.card_image : `/${row.card_image}`;
          const rawInterp = row.interpretation?.replace(/\s+/g, " ").trim() ?? "";
          const preview =
            rawInterp.length > 140 ? `${rawInterp.slice(0, 140)}…` : rawInterp;

          return (
            <div
              key={String(row.id)}
              className="rounded-lg border border-white/10 bg-[rgba(255,255,255,0.03)] p-3"
            >
              <div className="flex items-start gap-3">
                <div className="relative h-[72px] w-[48px] shrink-0 overflow-hidden rounded-md border border-white/20">
                  <Image src={imgSrc} alt="" fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={href} className="block">
                    <div className="text-[13px] font-semibold text-white">{row.card_name}</div>
                    <div className="text-[12px] text-[#d8ccff]">{row.master_name}</div>
                  </Link>
                  <div className="pt-1 text-[11px] text-[#aa9dce]">{formatSavedAt(row.created_at)}</div>
                  {preview ? (
                    <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-[#c4b8e8]">{preview}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void onDeleteOneCloud(row.id)}
                  className="shrink-0 rounded-md border border-white/20 px-2 py-1 text-[11px] text-[#e8deff]"
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="flex-1">
      <section className="mx-auto w-full max-w-[390px] px-5 pt-14">
        <div className="flex flex-col items-center gap-4">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#b79cff_0%,#6f42c1_60%,#2b173f_100%)] text-[34px]">
            🦄
          </div>
          <div className="text-[18px] text-neutral-10">YourTarot</div>
        </div>

        <div className="mt-8 rounded-xl border border-primary/40 bg-[rgba(10,8,28,0.82)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-[16px] font-semibold text-white">
              {supabaseConfigured ? "저장된 타로 기록" : "저장된 결과"}
            </div>
            {supabaseConfigured ? (
              <button
                type="button"
                onClick={() => void onDeleteAllCloud()}
                disabled={!user || cloudRows.length === 0 || cloudLoading}
                className="rounded-md border border-white/20 px-2 py-1 text-[11px] text-[#d8ccff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                전체 삭제
              </button>
            ) : (
              <button
                type="button"
                onClick={onDeleteAllLocal}
                disabled={savedLocal.length === 0}
                className="rounded-md border border-white/20 px-2 py-1 text-[11px] text-[#d8ccff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                전체 삭제
              </button>
            )}
          </div>
          {supabaseConfigured ? renderCloudList() : renderLocalList()}
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={onLogout}
            className="block w-full rounded-xl bg-[#6422AB] px-5 py-4 text-center text-[20px] font-semibold text-neutral-10"
          >
            로그아웃
          </button>
        </div>
      </section>
    </main>
  );
}
