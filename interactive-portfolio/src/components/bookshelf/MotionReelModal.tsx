'use client';


const __swipeTouchStart = { current: { x: 0, y: 0 } };
function __handleTouchStart(e: any) {
  if (!e?.touches || e.touches.length !== 1) return;
  __swipeTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}
function __handleTouchEnd(e: any, onLeft?: (() => void) | null, onRight?: (() => void) | null) {
  if (!e?.changedTouches || e.changedTouches.length !== 1) return;
  const dx = e.changedTouches[0].clientX - __swipeTouchStart.current.x;
  const dy = e.changedTouches[0].clientY - __swipeTouchStart.current.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    if (dx < 0 && typeof onLeft === "function") onLeft();
    if (dx > 0 && typeof onRight === "function") onRight();
  }
}
import React, { useEffect, useRef, useState } from 'react';
import { BookCategory } from '@/types/portfolio';

interface MotionReelModalProps {
  book: BookCategory;
  onClose: () => void;
}

interface MediaEntry {
  filename: string;
  videoUrl: string;
  detailImageUrl: string | null;
}

interface ReelGroupPage {
  id: string;
  groupNum: number;
  items: MediaEntry[];
  posterGradient: string;
}

const PALETTE = [
  'linear-gradient(135deg, #0d1326 0%, #1d4ed8 55%, #090b10 100%)',
  'linear-gradient(135deg, #1b1712 0%, #7c5c3e 55%, #0b0a09 100%)',
  'linear-gradient(135deg, #091e1a 0%, #0f766e 55%, #07080a 100%)',
];

const FALLBACK_GROUPS: ReelGroupPage[] = [
  {
    id: 'group-2',
    groupNum: 2,
    items: [
      {
        filename: '02_REPOVE.mp4',
        videoUrl: '/videos/02_REPOVE.mp4',
        detailImageUrl: '/videos/02_REPOVE.png',
      },
    ],
    posterGradient: PALETTE[0],
  },
  {
    id: 'group-3',
    groupNum: 3,
    items: [
      {
        filename: '03_BELLE J.mp4',
        videoUrl: '/videos/03_BELLE%20J.mp4',
        detailImageUrl: '/videos/03_BELLE%20J.png',
      },
    ],
    posterGradient: PALETTE[1],
  },
  {
    id: 'group-4',
    groupNum: 4,
    items: [
      {
        filename: '04_1_Ceramol.mp4',
        videoUrl: '/videos/04_1_Ceramol.mp4',
        detailImageUrl: '/videos/04_1_Ceramol.png',
      },
      {
        filename: '04_2_Koy.mp4',
        videoUrl: '/videos/04_2_Koy.mp4',
        detailImageUrl: '/videos/04_2_Koy.png',
      },
    ],
    posterGradient: PALETTE[2],
  },
];

function GroupEntryBlock({
  entry,
  posterGradient,
}: {
  entry: MediaEntry;
  posterGradient: string;
}) {
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  React.useEffect(() => {
    setIsVideoLoading(true);
    setIsImageLoading(true);
  }, [entry?.videoUrl, entry?.detailImageUrl]);

  return (
    <div data-swipe-bound="true" onTouchStart={__handleTouchStart} onTouchEnd={(e) => __handleTouchEnd(e, typeof null === "function" ? null : undefined, typeof null === "function" ? null : undefined)} className="w-full bg-black">
      <div className="relative aspect-video w-full overflow-hidden rounded-none bg-black">
        {!videoError ? (
          <div className="relative h-full w-full bg-black">
                {isVideoLoading && !videoError && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black text-xs font-mono tracking-[0.22em] text-white/75 uppercase">
                    LOADING...
                  </div>
                )}
                <video
                  src={entry.videoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onLoadStart={() => setIsVideoLoading(true)}
                  onWaiting={() => setIsVideoLoading(true)}
                  onLoadedData={() => setIsVideoLoading(false)}
                  onCanPlay={() => setIsVideoLoading(false)}
                  onPlaying={() => setIsVideoLoading(false)}
                  onError={() => {
                    setIsVideoLoading(false);
                    setVideoError(true);
                  }}
                  className="block h-full w-full rounded-none object-contain bg-black"
                />
              </div>
        ) : (
          <div
            style={{ background: posterGradient }}
            className="flex h-full w-full flex-col items-center justify-center rounded-none p-6 text-center max-md:flex-col-reverse"
          >
            <p className="text-xs text-white/75">
              영상을 불러오지 못했습니다. 파일 경로({entry.videoUrl}) 또는 브라우저 코덱 지원 여부를 확인해 주세요.
            </p>
          </div>
        )}
      </div>

      {entry.detailImageUrl && !imageError ? (
        <div className="w-full overflow-hidden rounded-none bg-[#12151d]">
          <div className="relative min-h-[180px] w-full bg-black">
                  {isImageLoading && !imageError && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black text-xs font-mono tracking-[0.22em] text-white/75 uppercase">
                      LOADING...
                    </div>
                  )}
                  <img
                    src={entry.detailImageUrl}
                    alt={entry.filename}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => {
                      setIsImageLoading(false);
                      setImageError(true);
                    }}
                    className="block h-auto w-full rounded-none object-contain"
                  />
                </div>
        </div>
      ) : (
        <div className="flex min-h-[140px] w-full flex-col items-center justify-center rounded-none bg-[#12151d] p-6 text-center text-xs text-neutral-400 max-md:flex-col-reverse">
          <p className="font-semibold text-neutral-200">
            포트폴리오 상세 이미지 영역
          </p>
          <p className="mt-1 max-w-md leading-relaxed">
            영상 파일과 같은 이름의 이미지를 <code className="text-neutral-200">public/videos/</code>에 넣으면 이어서 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}

export default function MotionReelModal({ onClose }: MotionReelModalProps) {

const __swipeRef = { current: { x: 0, y: 0 } };
function __handleTouchStart(e) {
  if (!e.touches || e.touches.length !== 1) return;
  __swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}
function __handleTouchEnd(e, onLeft, onRight) {
  if (!e.changedTouches || e.changedTouches.length !== 1) return;
  const dx = e.changedTouches[0].clientX - __swipeRef.current.x;
  const dy = e.changedTouches[0].clientY - __swipeRef.current.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    if (dx < 0 && typeof onLeft === "function") onLeft();
    if (dx > 0 && typeof onRight === "function") onRight();
  }
}

  const [groups, setGroups] = useState<ReelGroupPage[]>(FALLBACK_GROUPS);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  useEffect(() => {
    let active = true;
    fetch('/api/videos')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.groups?.length) return;
        const mapped: ReelGroupPage[] = data.groups.map(
          (
            g: {
              groupNum: number;
              items: MediaEntry[];
            },
            idx: number
          ) => ({
            id: `group-${g.groupNum}-${idx}`,
            groupNum: g.groupNum,
            items: g.items,
            posterGradient: PALETTE[idx % PALETTE.length],
          })
        );
        setGroups(mapped);
        setActiveIndex(0);
      })
      .catch(() => {
        // 폴백 그룹 유지
      });
    return () => {
      active = false;
    };
  }, []);

  const currentGroup = groups[activeIndex] ?? FALLBACK_GROUPS[0];

  const selectGroup = (nextIdx: number) => {
    if (!groups.length) return;
    const wrapped = ((nextIdx % groups.length) + groups.length) % groups.length;
    setActiveIndex(wrapped);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const threshold = 48;
    if (touchDeltaX.current < -threshold) {
      selectGroup(activeIndex + 1);
    } else if (touchDeltaX.current > threshold) {
      selectGroup(activeIndex - 1);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}
    >
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-none border border-white/15 bg-[#0d0f14] text-white shadow-2xl max-md:flex-col-reverse"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 text-base font-bold text-white shadow-md backdrop-blur-xs transition hover:scale-105 hover:bg-white hover:text-black"
        >
          ×
        </button>

        {groups.length > 1 && (
          <div className="absolute bottom-4 right-3 sm:bottom-5 sm:right-4 z-30 flex flex-col gap-2 max-md:flex-col-reverse">
            <button
              type="button"
              onClick={() => selectGroup(activeIndex - 1)}
              aria-label="이전 페이지"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/20 text-sm font-bold text-white shadow-md backdrop-blur-xs transition hover:scale-105 hover:bg-white hover:text-black"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => selectGroup(activeIndex + 1)}
              aria-label="다음 페이지"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/20 text-sm font-bold text-white shadow-md backdrop-blur-xs transition hover:scale-105 hover:bg-white hover:text-black"
            >
              ›
            </button>
          </div>
        )}

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="hide-scrollbar relative flex-1 overflow-y-auto"
        >
          <div key={currentGroup.id} className="w-full rounded-none bg-black">
            {currentGroup.items.map((entry, idx) => (
              <GroupEntryBlock
                key={`${currentGroup.id}-${entry.filename}-${idx}`}
                entry={entry}
                posterGradient={currentGroup.posterGradient}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
