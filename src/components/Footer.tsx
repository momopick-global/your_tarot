import Link from "next/link";
import Image from "next/image";
import { withAssetBase } from "@/lib/publicPath";

const ICON_EYE = withAssetBase("/assets/svg-logo-yourtarot.svg-699577b6-cedf-4beb-8082-e9fc60a6227c.png");
const ICON_INSTAGRAM = withAssetBase(
  "/assets/svg-ic-social-instagram.svg-2aa4e1f6-9ec8-47a4-8c99-29d5317dd055.png",
);
const ICON_TALK = withAssetBase("/assets/svg-ic-social-kakao.svg-20eca7d6-4d65-40b8-954f-17463d423b00.png");

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[390px] bg-[#17182E] pb-5 pt-0">
      <div className="flex flex-col items-center gap-6">
        <Image src={ICON_EYE} alt="" width={37} height={28} />

        <div className="w-[86%] border-t border-[#666666]" />

        <nav
          aria-label="푸터 링크"
          className="flex flex-wrap items-center justify-center gap-2 text-center text-[13px] text-neutral-60"
        >
          <Link className="text-[16px] text-white hover:text-neutral-10" href="/masters">
            타로 마스터 소개
          </Link>
          <span className="text-[#666666]">|</span>
          <Link className="text-[16px] text-white hover:text-neutral-10" href="/about">
            서비스 소개
          </Link>
          <span className="text-[#666666]">|</span>
          <Link className="text-[16px] text-white hover:text-neutral-10" href="/terms">
            이용약관
          </Link>
          <span className="text-[#666666]">|</span>
          <Link className="text-[16px] text-white hover:text-neutral-10" href="/personal">
            개인정보처리방침
          </Link>
          <span className="text-[#666666]">|</span>
          <Link className="text-[16px] text-white hover:text-neutral-10" href="/disclaimer">
            면책조항
          </Link>
          <span className="text-[#666666]">|</span>
          <Link className="text-[16px] text-white hover:text-neutral-10" href="/partner">
            제휴문의
          </Link>
        </nav>

        <div className="w-[86%] border-t border-[#666666] pt-4" />

        <div className="w-[86%] text-left text-[11px] leading-[18px] text-neutral-60">
          <div>ASOG Co., Ltd. | CEO: jungyoungcheol</div>
          <div>Address: Hancheon-Ro, Gangbuk-Gu, Seoul, Republic Of Korea</div>
          <div>Business Registration Number: 370-54-00601</div>
          <div>
            Mail-Order Business Registration Number: 2021-Seoul-Seodaemun-0013
          </div>
          <div>Copyright© YourTarot Co., Ltd. All Rights Reserved.</div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <a
            href="#"
            aria-label="인스타그램"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md"
          >
            <Image src={ICON_INSTAGRAM} alt="" width={36} height={36} />
          </a>
          <a
            href="#"
            aria-label="카카오톡"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md"
          >
            <Image src={ICON_TALK} alt="" width={36} height={36} />
          </a>
        </div>
      </div>
    </footer>
  );
}

