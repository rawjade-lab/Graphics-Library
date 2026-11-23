"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { BRAND_CAMPAIGN_ITEMS, BrandCampaignItem } from "@/data/brandCampaigns";

const modernDisplayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

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
  items,
}: BrandCampaignModalProps) {
  const [index, setIndex] = useState(0);
  const [forceClosed, setForceClosed] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slideDir, setSlideDir] = useState<-1 | 0 | 1>(0);
  const [slidePhase, setSlidePhase] = useState<"idle" | "enterStart" | "enterActive">("idle");

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const animTimerRef = useRef<number | null>(null);

  const requestedOpen = open !== undefined ? open : isOpen !== undefined ? isOpen : true;
  React.useEffect(() => { if (requestedOpen) setForceClosed(false); }, [requestedOpen]);
  const visible = requestedOpen && !forceClosed;

  const list: BrandCampaignItem[] = React.useMemo(() => {
    const base = BRAND_CAMPAIGN_ITEMS;
    if (!items || items.length === 0) return base;
    const seen = new Set(items.map((it) => it.src));
    const extra = base.filter((it) => !seen.has(it.src));
    return [...items, ...extra];
  }, [items]);

  const maxIndex = Math.max(0, list.length - 1);
  const safeIndex = Math.max(0, Math.min(index, maxIndex));

  const currentItem = list[safeIndex];
  const prev1Item = safeIndex - 1 >= 0 ? list[safeIndex - 1] : null;
  const prev2Item = safeIndex - 2 >= 0 ? list[safeIndex - 2] : null;
  const next1Item = safeIndex + 1 <= maxIndex ? list[safeIndex + 1] : null;
  const next2Item = safeIndex + 2 <= maxIndex ? list[safeIndex + 2] : null;

  const navigateTo = useCallback(
    (targetIdx: number, dir: -1 | 1) => {
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
    },
    [maxIndex, safeIndex]
  );

  const goPrev = useCallback(() => {
    if (safeIndex > 0) navigateTo(safeIndex - 1, -1);
  }, [navigateTo, safeIndex]);

  const goNext = useCallback(() => {
    if (safeIndex < maxIndex) navigateTo(safeIndex + 1, 1);
  }, [maxIndex, navigateTo, safeIndex]);

  const handleClose = useCallback(() => {
    setForceClosed(true);
    if (animTimerRef.current) {
      window.clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
    setSlidePhase("idle");
    setSlideDir(0);
    onClose();
  }, [onClose]);

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
  }, [visible, handleClose, goPrev, goNext]);

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

  let screenImgTransform = "translate3d(0, 0, 0)";
  let screenImgTransition = "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)";

  if (slidePhase === "enterStart") {
    screenImgTransition = "none";
    screenImgTransform = slideDir === 1 ? "translate3d(100%, 0, 0)" : "translate3d(-100%, 0, 0)";
  } else if (slidePhase === "enterActive") {
    screenImgTransition = "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)";
    screenImgTransform = "translate3d(0, 0, 0)";
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
        <div className="w-full h-full rounded-none flex flex-col items-center justify-between p-4 bg-gradient-to-br from-neutral-950 via-neutral-900 to-[#ef233c] text-white">
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

  const renderPeekingCard = (
    item: BrandCampaignItem,
    translateXExpr: string,
    depth: 1 | 2
  ) => (
    <div
      style={{
        transform: `translate3d(${translateXExpr}, 0px, 0)`,
      }}
      className="hidden md:block absolute left-0 top-0 w-full h-full rounded-none overflow-hidden"
    >
      {renderSlideCard(item)}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          depth === 1
            ? "bg-gradient-to-t from-[#121214]/80 via-[#121214]/45 to-[#121214]/65"
            : "bg-gradient-to-t from-[#121214]/92 via-[#121214]/72 to-[#121214]/85"
        }`}
      />
    </div>
  );

  const renderNavButton = (dir: "prev" | "next", disabled: boolean) => {
    const gradId = `phone-nav-grad-${dir}`;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (dir === "prev") goPrev();
          else goNext();
        }}
        disabled={disabled}
        aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center bg-[#0c0d11] transition cursor-pointer ${
          disabled
            ? "opacity-30 cursor-not-allowed"
            : "opacity-95 hover:opacity-100 hover:scale-105"
        }`}
      >
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          <defs>
            <linearGradient id={gradId} x1="34" y1="6" x2="6" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="52%" stopColor="#e2e8f0" stopOpacity="0.56" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="18.25" stroke={`url(#${gradId})`} strokeWidth="1.425" />
          {dir === "prev" ? (
            <polyline
              points="22.5 14.5 16.5 20 22.5 25.5"
              stroke={`url(#${gradId})`}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <polyline
              points="17.5 14.5 23.5 20 17.5 25.5"
              stroke={`url(#${gradId})`}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 select-none"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Brand and Campaign Showcase"
    >
      <div
        className={`relative w-full max-w-6xl h-[88vh] max-h-[820px] rounded-2xl overflow-hidden bg-[#121214] text-white shadow-2xl border border-white/10 flex flex-col justify-between`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden flex flex-col justify-between px-5 pt-3 pb-4 sm:px-9 sm:pt-4 sm:pb-6"
        >
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[420px] opacity-35 blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(239, 35, 60, 0.22), rgba(18, 18, 20, 0) 70%)",
            }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <div
              className={`${modernDisplayFont.className} font-extrabold leading-[0.84] tracking-[-0.045em] text-[clamp(3.6rem,10.5vw,8rem)]`}
            >
              <div className="text-white/95">Brand&amp;</div>
            </div>
          </div>

          <div className="relative flex flex-col gap-2">
            <div className="flex justify-end pr-1 sm:pr-2">
              <div
                className={`${modernDisplayFont.className} font-extrabold leading-[0.86] tracking-[-0.045em] text-[clamp(3.4rem,9.8vw,7.4rem)] text-white/95 text-right`}
              >
                Campaign
              </div>
            </div>

            <div className="flex items-end justify-between font-semibold uppercase tracking-[0.18em] text-[11px] sm:text-xs text-white/40">
              <span>
                BRAND STORY · <span className="text-[#ef233c]">CAMPAIGN VISUALS</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-40 flex items-center justify-end px-4 pt-3.5 sm:px-6 sm:pt-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-[#ef233c] text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="relative z-20 flex-1 flex items-center justify-center px-4 -mt-5 sm:-mt-7">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-[248px] sm:w-[278px] md:w-[298px] aspect-[9/18.6] rounded-[42px] flex items-center justify-center"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-[56px] z-0 blur-2xl opacity-85"
              style={{
                background:
                  "radial-gradient(circle at 50% 55%, rgba(0, 0, 0, 0.85) 0%, rgba(239, 35, 60, 0.14) 55%, rgba(0, 0, 0, 0) 78%)",
              }}
            />

            <div className="pointer-events-none absolute inset-x-[10px] top-1/2 -translate-y-1/2 aspect-square z-10">
              {prev1Item && renderPeekingCard(prev1Item, "-100%", 1)}
              {prev2Item && renderPeekingCard(prev2Item, "-200%", 2)}
              {next1Item && renderPeekingCard(next1Item, "100%", 1)}
              {next2Item && renderPeekingCard(next2Item, "200%", 2)}
            </div>

            <div
              style={{
                background:
                  "linear-gradient(235deg, #383d49 0%, #181a21 24%, #090a0d 55%, #16181f 84%, #0c0d11 100%)",
              }}
              className="relative z-20 w-full h-full rounded-[42px] p-[3px] shadow-[0_32px_80px_rgba(0,0,0,0.85),0_10px_28px_rgba(0,0,0,0.65)] flex flex-col justify-between overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[42px] z-30"
                style={{
                  background:
                    "linear-gradient(225deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.09) 20%, rgba(255,255,255,0) 42%, rgba(255,255,255,0.065) 80%, rgba(255,255,255,0.015) 100%)",
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  padding: "2px",
                }}
              />

              <div
                style={{
                  background:
                    "linear-gradient(215deg, #171920 0%, #090a0d 42%, #070709 100%)",
                }}
                className="relative z-10 w-full h-full rounded-[39px] p-[8px] flex flex-col justify-between overflow-hidden"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{
                    background:
                      "linear-gradient(232deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 16%, transparent 32%, transparent 62%, rgba(255,255,255,0.024) 72%, transparent 82%)",
                  }}
                />

                <div className="relative z-20 flex items-center justify-between px-3.5 pt-1 pb-1 text-[10px] font-semibold tracking-tight text-white/85 pointer-events-none">
                  <span>9:41</span>
                  <span className="w-16 h-4 rounded-full bg-black border border-white/15 inline-block" />
                  <span className="flex items-center gap-1 text-[9px] text-white/80">
                    <span>5G</span>
                    <span className="inline-block w-3.5 h-2 rounded-[2px] border border-white/75 p-[1px]">
                      <span className="block w-full h-full bg-white rounded-[1px]" />
                    </span>
                  </span>
                </div>

                <div className="relative z-20 mt-auto pb-6 px-5 flex items-center justify-between">
                  {renderNavButton("prev", safeIndex === 0)}
                  {renderNavButton("next", safeIndex === maxIndex)}
                </div>
              </div>
            </div>

            <div className="absolute inset-x-[11px] top-1/2 -translate-y-1/2 z-30 bg-[#18181c] border-y border-white/10 shadow-[0_14px_34px_rgba(0,0,0,0.55)] flex flex-col">
              <div className="relative z-20 flex items-center justify-between px-2.5 py-1.5 bg-[#18181c]">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#ef233c] via-rose-500 to-white p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-full bg-[#18181c] flex items-center justify-center text-[8px] font-bold text-white">
                      JB
                    </div>
                  </div>
                  <div className="leading-none truncate">
                    <span className="text-[10px] font-semibold text-white">jihyeon.baek</span>
                    <span className="text-[9px] text-[#ef233c] font-medium ml-1.5">Campaign</span>
                  </div>
                </div>
                <span className="text-[10px] text-white/60 tracking-widest px-1">•••</span>
              </div>

              <div className="relative z-10 w-full aspect-square rounded-none overflow-hidden bg-neutral-900">
                <div
                  style={{
                    transform: screenImgTransform,
                    transition: screenImgTransition,
                  }}
                  className="w-full h-full rounded-none"
                >
                  {currentItem && renderSlideCard(currentItem)}
                </div>
              </div>

              <div className="relative z-20 flex flex-col px-2.5 py-1.5 bg-[#18181c] text-white">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5 leading-none">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiked((v) => !v);
                      }}
                      aria-label="Like post"
                      className={`transition cursor-pointer ${liked ? "text-[#ef233c] scale-110" : "text-white/90 hover:text-[#ef233c]"}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={liked ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                      }}
                      aria-label="Next post"
                      className="text-white/85 hover:text-white transition cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {list.map((it, idx) => (
                      <span
                        key={it.id}
                        className={`h-1 rounded-full transition-all ${
                          idx === safeIndex ? "w-2.5 bg-[#ef233c]" : "w-1 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSaved((v) => !v);
                    }}
                    aria-label="Save post"
                    className={`transition cursor-pointer ${saved ? "text-[#ef233c]" : "text-white/85 hover:text-white"}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={saved ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>

                <div className="text-[10px] leading-tight text-white/90 truncate">
                  <span className="font-semibold mr-1.5 text-white">jihyeon.baek</span>
                  <span className="text-white/80">{currentItem?.title}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-40 pb-3.5 flex items-center justify-center gap-2">
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
                idx === safeIndex ? "w-6 bg-[#ef233c]" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
