"use client";

import React, { useEffect, useRef, useState } from "react";
import { BRAND_CAMPAIGN_ITEMS, BrandCampaignItem } from "@/data/brandCampaigns";

interface BrandCampaignModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  items?: BrandCampaignItem[];
}

export default function BrandCampaignModal({
  open,
  isOpen,
  onClose,
  items = BRAND_CAMPAIGN_ITEMS,
}: BrandCampaignModalProps) {
  const [index, setIndex] = useState(0);
  const [closed, setClosed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [slideDir, setSlideDir] = useState<-1 | 0 | 1>(0);
  const [slidePhase, setSlidePhase] = useState<"idle" | "enterStart" | "enterActive">("idle");

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const animTimerRef = useRef<number | null>(null);

  const visible = !closed && (open ?? isOpen ?? true);
  const list = items && items.length > 0 ? items : BRAND_CAMPAIGN_ITEMS;
  const maxIndex = Math.max(0, list.length - 1);
  const safeIndex = Math.max(0, Math.min(index, maxIndex));

  const currentItem = list[safeIndex];
  const prevItem = safeIndex > 0 ? list[safeIndex - 1] : null;
  const nextItem = safeIndex < maxIndex ? list[safeIndex + 1] : null;

  const navigateTo = (targetIdx: number, dir: -1 | 1) => {
    const clamped = Math.max(0, Math.min(maxIndex, targetIdx));
    if (clamped === safeIndex) return;

    if (animTimerRef.current) {
      window.clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }

    setImgFailed(false);
    setIndex(clamped);
    setSlideDir(dir);
    setSlidePhase("enterStart");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSlidePhase("enterActive");
        animTimerRef.current = window.setTimeout(() => {
          setSlidePhase("idle");
          setSlideDir(0);
        }, 380);
      });
    });
  };

  const goPrev = () => {
    if (safeIndex > 0) navigateTo(safeIndex - 1, -1);
  };

  const goNext = () => {
    if (safeIndex < maxIndex) navigateTo(safeIndex + 1, 1);
  };

  const handleClose = () => {
    setClosed(true);
    onClose();
  };

  useEffect(() => {
    return () => {
      if (animTimerRef.current) window.clearTimeout(animTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!visible) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartRef.current.x;
    const dx = endX - touchStartRef.current.x;
    touchStartRef.current = null;

    if (dx < -40) goNext();
    else if (dx > 40) goPrev();
  };

  // 클릭/이동 시 새 이미지가 스와이프되듯 미끄러져 들어오는 transform 계산
  let screenImgTransform = "translate3d(0, 0, 0)";
  let screenImgTransition = "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)";

  if (slidePhase === "enterStart") {
    screenImgTransition = "none";
    // dir === 1 (다음으로 이동): 오른쪽에서 왼쪽으로 미끄러져 들어옴
    // dir === -1 (이전으로 이동): 왼쪽에서 오른쪽으로 미끄러져 들어옴
    screenImgTransform = dirToOffset(slideDir);
  } else if (slidePhase === "enterActive") {
    screenImgTransition = "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)";
    screenImgTransform = "translate3d(0, 0, 0)";
  }

  function dirToOffset(d: -1 | 0 | 1) {
    if (d === 1) return "translate3d(100%, 0, 0)";
    if (d === -1) return "translate3d(-100%, 0, 0)";
    return "translate3d(0, 0, 0)";
  }

  const renderSlideCard = (item: BrandCampaignItem) => (
    <div className="w-full h-full rounded-none overflow-hidden bg-neutral-900">
      {!imgFailed ? (
        <img
          src={item.src}
          alt={item.title}
          draggable={false}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover rounded-none"
        />
      ) : (
        <div className="w-full h-full rounded-none flex flex-col items-center justify-between p-4 bg-gradient-to-br from-slate-900 via-zinc-800 to-orange-600 text-white">
          <span className="self-start bg-white/15 px-2.5 py-0.5 text-[10px] font-mono uppercase rounded-none">
            {item.id} · CAMPAIGN
          </span>
          <div className="text-center">
            <p className="text-sm font-extrabold tracking-tight">{item.title}</p>
            <p className="text-[11px] text-white/75 mt-1">{item.caption}</p>
          </div>
          <span className="text-[10px] font-mono text-white/60">{item.id}</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 select-none"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Brand and Campaign Showcase"
    >
      <div
        className="relative w-full max-w-5xl h-[88vh] max-h-[820px] rounded-2xl overflow-hidden bg-[#eceae4] text-[#141414] shadow-2xl border border-black/10 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 배경 타이포그래피 장식 레이어 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden flex flex-col justify-between p-4 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="leading-[0.86] tracking-[-0.04em] font-black text-[clamp(3.2rem,10vw,7.5rem)] text-[#141414]/90">
              <div>Brand&amp;</div>
              <div>Campaign</div>
            </div>
            <div className="hidden sm:flex flex-col items-end text-right font-mono text-[11px] tracking-[0.2em] uppercase text-[#141414]/55 pt-2">
              <span>ARCHIVE EDITION</span>
              <span>
                {String(safeIndex + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between font-black uppercase tracking-[0.14em] text-xs sm:text-sm text-[#141414]/25">
            <span>BRAND STORY · CAMPAIGN VISUALS</span>
            <span className="hidden md:inline">CLICK OR SWIPE TO SLIDE</span>
          </div>
        </div>

        {/* 상단 배지 및 닫기 버튼 */}
        <div className="relative z-40 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
          <span className="inline-flex items-center rounded-full bg-black/10 px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-black/75">
            BRAND &amp; CAMPAIGN
          </span>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            className="w-9 h-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 중앙 무대: [후면 대기 이미지] < [휴대폰 프레임] < [스크린 속 이미지] */}
        <div className="relative z-20 flex-1 flex items-center justify-center px-4">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-[240px] sm:w-[272px] md:w-[292px] aspect-[9/18.5] rounded-[38px] flex items-center justify-center"
          >
            {/* 1층(가장 뒤): 양옆 대기 이미지들 (현재 간격 유지, 휴대폰 뒤 z-10 배치) */}
            <div className="pointer-events-none absolute inset-x-[10px] top-1/2 -translate-y-1/2 aspect-square z-10">
              {prevItem && (
                <div
                  style={{
                    transform: "translate3d(-100%, 0px, 0)",
                  }}
                  className="hidden sm:block absolute left-0 top-0 w-full h-full rounded-none overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)]"
                >
                  {renderSlideCard(prevItem)}
                </div>
              )}

              {nextItem && (
                <div
                  style={{
                    transform: "translate3d(100%, 0px, 0)",
                  }}
                  className="hidden sm:block absolute left-0 top-0 w-full h-full rounded-none overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.3)]"
                >
                  {renderSlideCard(nextItem)}
                </div>
              )}
            </div>

            {/* 2층(중간): 휴대폰 바디 프레임 (z-20) */}
            <div className="relative z-20 w-full h-full rounded-[38px] bg-[#111215] p-[10px] shadow-[0_26px_65px_rgba(0,0,0,0.45)] border-[3px] border-[#2c2f36] flex flex-col justify-between pointer-events-none">
              {/* 상단 상태바 / 카메라 홀 */}
              <div className="flex items-center justify-between px-3 pt-1 pb-2 text-[10px] font-mono text-white/75">
                <span>12:36</span>
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700 inline-block" />
                <span className="tracking-tighter">5G ▮▮▮</span>
              </div>

              {/* 중앙 빈 공간은 3층 스크린 이미지가 자리함 */}
              <div className="w-full aspect-square my-auto" />

              {/* 하단 네비게이션 바 */}
              <div className="flex items-center justify-around px-4 pt-2 pb-1 text-white/70 text-xs">
                <span className="p-1">◁</span>
                <span className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                </span>
                <span className="p-1">▷</span>
              </div>
            </div>

            {/* 3층(최상단): 휴대폰 스크린 화면 속 이미지 + 조작 버튼 (z-30) */}
            <div className="absolute inset-x-[10px] top-1/2 -translate-y-1/2 aspect-square z-30 rounded-none overflow-hidden">
              <div
                style={{
                  transform: screenImgTransform,
                  transition: screenImgTransition,
                }}
                className="w-full h-full rounded-none"
              >
                {currentItem && renderSlideCard(currentItem)}
              </div>

              {/* 좌우 넘김 버튼 */}
              {list.length > 1 && (
                <>
                  {safeIndex > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                      }}
                      aria-label="Previous campaign image"
                      className="hidden sm:flex absolute left-1.5 top-1/2 -translate-y-1/2 z-40 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white items-center justify-center text-xs transition cursor-pointer"
                    >
                      ‹
                    </button>
                  )}
                  {safeIndex < maxIndex && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                      }}
                      aria-label="Next campaign image"
                      className="hidden sm:flex absolute right-1.5 top-1/2 -translate-y-1/2 z-40 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white items-center justify-center text-xs transition cursor-pointer"
                    >
                      ›
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 하단 페이지 인디케이터 */}
        <div className="relative z-40 pb-4 flex items-center justify-center gap-2">
          {list.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const dir: -1 | 1 = idx > safeIndex ? 1 : -1;
                navigateTo(idx, dir);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === safeIndex ? "w-6 bg-[#141414]" : "w-2 bg-[#141414]/30 hover:bg-[#141414]/55"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
