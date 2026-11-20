'use client';

import React, { useMemo, useState } from 'react';
import { BookCategory } from '@/types/portfolio';
import MotionReelModal from './MotionReelModal';
import CharacterViewerModal from './CharacterViewerModal';

interface PortfolioBookModalProps {
  book: BookCategory;
  onClose: () => void;
}

interface ChapterItem {
  num: string;
  title: string;
  subItems: string[];
  year: string;
  role: string;
  summary: string;
  deliverables: string[];
}

function getChaptersForBook(book: BookCategory): ChapterItem[] {
  if (book.id === 'book-brand') {
    return [
      {
        num: '(1)',
        title: 'Brand Identity & Grid System',
        subItems: ['Core Symbol', 'Modular Grid', 'Visual Hierarchy'],
        year: '2026',
        role: 'Brand Direction · Identity',
        summary:
          '브랜드의 본질적인 태도를 시각 언어로 번역한 아이덴티티 시스템과 비례 그리드 설계 기록입니다.',
        deliverables: ['Logo System', 'Grid Manual', 'Key Visual'],
      },
      {
        num: '(2)',
        title: 'Campaign Key Visual Series',
        subItems: ['Seasonal Campaign', 'Art Direction', 'Poster & OOH'],
        year: '2025',
        role: 'Campaign Design · Art Direction',
        summary:
          '캠페인 메시지가 공간과 지면 위에서 선명하게 전달되도록 구성한 키 비주얼 및 포스터 시리즈입니다.',
        deliverables: ['Campaign Posters', 'OOH Mockups', 'Art Direction'],
      },
      {
        num: '(3)',
        title: 'Packaging & Materiality',
        subItems: ['Paper & Finish', 'Structural Die-line', 'Tactile Detail'],
        year: '2025',
        role: 'Packaging · Material Study',
        summary:
          '종이의 결, 코팅 물성, 구조적 접힘선을 통해 브랜드의 완성도를 끌어올린 패키지 디자인 기록입니다.',
        deliverables: ['Die-line Spec', 'Sample Swatch', 'Packaging Set'],
      },
      {
        num: '(4)',
        title: 'Brand Guideline & Rollout',
        subItems: ['Digital Touchpoints', 'Editorial Extensions', 'Summary'],
        year: '2026',
        role: 'Design System · Guideline',
        summary:
          '다양한 매체와 채널에서도 일관된 브랜드 경험을 유지하기 위한 확장 규칙과 운영 가이드를 정리했습니다.',
        deliverables: ['Brand Book', 'Digital Kit', 'Review Notes'],
      },
    ];
  }

  if (book.id === 'book-character') {
    return [
      {
        num: '(1)',
        title: 'Character Concept & Silhouette',
        subItems: ['Proportion Study', 'Silhouette Check', 'Personality Traits'],
        year: '2026',
        role: 'Character Design · Concept',
        summary:
          '실루엣만으로도 성격을 읽어낼 수 있도록 설계한 캐릭터 컨셉 스케치와 비율 스터디 아카이브입니다.',
        deliverables: ['Concept Sketches', 'Silhouette Sheet', 'Profile'],
      },
      {
        num: '(2)',
        title: 'Turnaround & Model Sheet',
        subItems: ['Front / Side / Back', 'Scale 1:1 Reference', 'Costume & Props'],
        year: '2025',
        role: 'Character Sheet · Production',
        summary:
          '입체 구현과 애니메이션 적용을 고려한 정면·측면·후면 턴어라운드 및 소품 스케일 시트입니다.',
        deliverables: ['Turnaround Sheet', 'Prop Studies', 'Color Key'],
      },
      {
        num: '(3)',
        title: 'Expression & Narrative Pose',
        subItems: ['Emotional Range', 'Action Line', 'World Context'],
        year: '2025',
        role: 'Illustration · Narrative',
        summary:
          '표정 변화와 동세 라인을 통해 캐릭터가 처한 상황과 서사를 풀어낸 일러스트레이션 모음입니다.',
        deliverables: ['Expression Chart', 'Pose Studies', 'Scene Art'],
      },
    ];
  }

  if (book.id === 'book-artwork') {
    return [
      {
        num: '(1)',
        title: 'Exhibition Monograph & Form',
        subItems: ['Composition Study', 'Color & Contrast', 'Spatial Balance'],
        year: '2026',
        role: 'Fine Art · Visual Monograph',
        summary:
          '형태와 여백, 색면의 긴장감을 탐구한 아트워크 시리즈와 전시 모노그래프 구성 기록입니다.',
        deliverables: ['Monograph Plates', 'Color Study', 'Exhibition Note'],
      },
      {
        num: '(2)',
        title: 'Print & Tactile Editions',
        subItems: ['Archival Print', 'Surface Texture', 'Limited Edition'],
        year: '2025',
        role: 'Printmaking · Edition',
        summary:
          '인쇄 잉크의 발색과 지면의 질감을 살려 제작한 에디션 프린트 및 물성 실험 아카이브입니다.',
        deliverables: ['Edition Prints', 'Paper Test', 'Colophon'],
      },
      {
        num: '(3)',
        title: 'Curatorial Index & Essay',
        subItems: ['Visual Notes', 'Critical Context', 'Archive Index'],
        year: '2025',
        role: 'Editorial · Curatorial Note',
        summary:
          '작업 세계를 관통하는 시각적 키워드와 비평적 메모를 정리한 에디토리얼 인덱스 섹션입니다.',
        deliverables: ['Curatorial Text', 'Index Plates', 'Reflection'],
      },
    ];
  }

  return [
    {
      num: '(1)',
      title: 'Lab Note & Early Prototypes',
      subItems: ['Quick Sketch', 'Idea Seed', 'Feasibility Check'],
      year: '2026',
      role: 'Experimental · Prototyping',
      summary:
        '정형화된 규칙에서 벗어나 자유롭게 시도한 초기 실험 노트와 빠른 프로토타입 기록입니다.',
      deliverables: ['Lab Notes', 'Rapid Prototype', 'Test Log'],
    },
    {
      num: '(2)',
      title: 'Creative Coding & Tools',
      subItems: ['Generative Pattern', 'Custom Utility', 'Interaction Test'],
      year: '2025',
      role: 'Creative Tech · Tooling',
      summary:
        '디자인 워크플로우를 확장하거나 새로운 시각 패턴을 생성하기 위해 만든 실험적 도구와 코드 조각들입니다.',
      deliverables: ['Generator Demo', 'Parameter Map', 'Build Note'],
    },
    {
      num: '(3)',
      title: 'Field Experiments & Reflection',
      subItems: ['Visual Findings', 'What Worked', 'Next Iteration'],
      year: '2025',
      role: 'Research · Reflection',
      summary:
        '실험 과정에서 발견한 우연한 결과물과 다음 프로젝트로 이어갈 인사이트를 정리했습니다.',
      deliverables: ['Experiment Log', 'Findings', 'Next Steps'],
    },
  ];
}

export default function PortfolioBookModal({ book, onClose }: PortfolioBookModalProps) {
  const [activeChapterIdx, setActiveChapterIdx] = useState<number | null>(null);
  const [activeSubTopic, setActiveSubTopic] = useState<string | null>(null);

  const chapters = useMemo(() => getChaptersForBook(book), [book]);

  if (book.id === 'book-motion') {
    return <MotionReelModal book={book} onClose={onClose} />;
  }
  if (book.id === 'book-character') {
    return <CharacterViewerModal book={book} onClose={onClose} />;
  }

  const openChapterDetail = (idx: number, subTopic?: string) => {
    setActiveChapterIdx(idx);
    setActiveSubTopic(subTopic ?? null);
  };

  const backToIndex = () => {
    setActiveChapterIdx(null);
    setActiveSubTopic(null);
  };

  const selectedChapter =
    activeChapterIdx !== null ? chapters[activeChapterIdx] : null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-3 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden border border-white/15 bg-[#d8d8d6] text-[#111111] shadow-2xl max-md:flex-col-reverse"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 내비게이션 바 */}
        <div className="flex items-center justify-between border-b border-black/15 bg-[#d8d8d6] px-4 py-3 sm:px-7">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-black/30"
              style={{ backgroundColor: book.color }}
            />
            <span className="truncate text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] text-black/80">
              {book.spineTitle} — {book.coverTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {selectedChapter && (
              <button
                type="button"
                onClick={backToIndex}
                className="border border-black/30 bg-transparent px-2.5 py-1 text-[11px] font-semibold text-black transition hover:bg-black hover:text-[#d8d8d6]"
              >
                ← Index 목록
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="border border-black bg-[#111111] px-3 py-1 text-[11px] font-semibold text-[#d8d8d6] transition hover:bg-black/80"
            >
              닫기 ×
            </button>
          </div>
        </div>

        {/* 뷰 1: Index 스프레드 화면 */}
        {!selectedChapter ? (
          <div className="relative flex-1 overflow-y-auto bg-[#d8d8d6] text-[#111111]">
            <div className="relative min-h-full overflow-hidden">
              {/* 은은한 뒷면 비침 / 고스트 워터마크 레이어 */}
              <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute inset-0 grid grid-cols-1 md:grid-cols-2 max-md:flex-col-reverse"
              >
                <div className="p-8 sm:p-12 text-[11px] leading-relaxed tracking-wide text-black/[0.06] blur-[0.4px]">
                  <p className="mb-4">
                    {book.coverTitle} · {book.coverSubtitle} · Visual Archive &amp; Editorial Index ·
                    Spatial Rhythm · Typography System · Monograph Notes
                  </p>
                  <p className="mb-4">
                    Select any index item on the right to open its dedicated detail page view.
                  </p>
                  <p>
                    {chapters.map((c) => `${c.num} ${c.title} · `).join('')}
                  </p>
                </div>
                <div className="relative flex items-center justify-center overflow-hidden">
                  <span className="text-[110px] sm:text-[150px] font-black tracking-tighter text-black/[0.05] translate-x-6 translate-y-4">
                    {book.spineTitle.slice(0, 6)}
                  </span>
                </div>
              </div>

              {/* 중앙 제본선 */}
              <div
                aria-hidden="true"
                className="pointer-events-none hidden md:block absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-black/15 via-black/30 to-black/15"
              />

              {/* 좌/우 스프레드 콘텐츠 */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 min-h-full max-md:flex-col-reverse">
                {/* 좌측: Index 대형 타이틀 */}
                <div className="relative flex flex-col justify-between p-6 sm:p-10 md:p-12 border-b md:border-b-0 border-black/15 max-md:flex-col-reverse">
                  <div>
                    <h2 className="text-[64px] sm:text-[86px] md:text-[96px] font-black leading-[0.92] tracking-[-0.04em] text-[#111111]">
                      Index
                    </h2>
                    <p className="mt-5 max-w-sm text-xs sm:text-sm leading-relaxed text-black/75">
                      <span className="font-bold text-black">{book.coverTitle}</span> —{' '}
                      {book.coverSubtitle}. 오른쪽 목록에서 원하는 항목을 선택하면 상세
                      페이지로 전환됩니다.
                    </p>
                  </div>

                  <div className="mt-10 flex items-end justify-between text-[11px] font-semibold tracking-widest text-black/70">
                    <span>{book.spineTitle}</span>
                    <span>004.</span>
                  </div>
                </div>

                {/* 우측: 번호 매겨진 목차 리스트 */}
                <div className="relative flex flex-col justify-between p-6 sm:p-10 md:p-12 max-md:flex-col-reverse">
                  <div className="space-y-4 sm:space-y-5">
                    {chapters.map((chapter, idx) => (
                      <div key={chapter.num} className="group">
                        <button
                          type="button"
                          onClick={() => openChapterDetail(idx)}
                          className="flex w-full items-baseline gap-3 text-left transition group-hover:translate-x-1"
                        >
                          <span className="w-7 shrink-0 text-xs sm:text-sm font-bold text-black/80">
                            {chapter.num}
                          </span>
                          <span className="text-sm sm:text-base font-bold tracking-[-0.01em] text-[#111111] underline-offset-4 group-hover:underline">
                            {chapter.title}
                          </span>
                        </button>

                        <ul className="mt-1 pl-10 space-y-0.5">
                          {chapter.subItems.map((sub) => (
                            <li key={sub}>
                              <button
                                type="button"
                                onClick={() => openChapterDetail(idx, sub)}
                                className="text-left text-xs sm:text-[13px] leading-snug text-black/75 transition hover:text-black hover:underline underline-offset-2"
                              >
                                {sub}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 flex items-center justify-between text-[11px] font-semibold tracking-widest text-black/70">
                    <span>005.</span>
                    <span className="uppercase tracking-wider text-black/60">
                      Select an item to open page →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 뷰 2: 선택된 목차 항목의 상세 페이지 화면 */
          <div className="flex-1 overflow-y-auto bg-[#e3e3e0] px-6 py-8 sm:px-12 sm:py-10 text-[#111111]">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/15 pb-3 text-xs font-semibold uppercase tracking-wider text-black/65">
                <span>
                  {selectedChapter.num} · {selectedChapter.role}
                </span>
                <span>{selectedChapter.year}</span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-[#111111]">
                  {selectedChapter.title}
                </h3>
                {activeSubTopic && (
                  <span className="border border-black/25 bg-[#d8d8d6] px-2.5 py-0.5 text-xs font-bold text-black/80">
                    {activeSubTopic}
                  </span>
                )}
              </div>

              <p className="mt-4 max-w-2xl text-sm sm:text-[15px] leading-relaxed text-black/80">
                {selectedChapter.summary}
              </p>

              {/* 세부 항목 칩 */}
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedChapter.subItems.map((sub) => {
                  const isCurrentSub = activeSubTopic === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setActiveSubTopic(sub)}
                      className={`border px-3 py-1 text-xs font-semibold transition ${
                        isCurrentSub
                          ? 'border-black bg-[#111111] text-[#d8d8d6]'
                          : 'border-black/20 bg-[#d8d8d6] text-black/80 hover:border-black'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>

              {/* 비주얼 플레이트 영역 */}
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3 max-md:flex-col-reverse">
                {selectedChapter.deliverables.map((item, dIdx) => (
                  <div
                    key={item}
                    className="flex min-h-[170px] flex-col justify-between border border-black/15 bg-[#d8d8d6] p-4 max-md:flex-col-reverse"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-black/55">
                      <span>PLATE 0{dIdx + 1}</span>
                      <span>{selectedChapter.num}</span>
                    </div>

                    <div
                      className="my-4 h-14 w-full border border-black/10"
                      style={{
                        background:
                          dIdx === 0
                            ? book.color
                            : dIdx === 1
                              ? `linear-gradient(135deg, ${book.color} 0%, #d8d8d6 100%)`
                              : '#c9c9c5',
                      }}
                    />

                    <p className="text-xs font-bold text-[#111111]">{item}</p>
                  </div>
                ))}
              </div>

              {/* 하단 이전/다음 챕터 및 Index 복귀 네비게이션 */}
              <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-black/15 pt-5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={backToIndex}
                  className="border border-black/30 bg-[#d8d8d6] px-3.5 py-2 text-black transition hover:bg-black hover:text-[#d8d8d6]"
                >
                  ← Index 목차로 돌아가기
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeChapterIdx === 0}
                    onClick={() => openChapterDetail((activeChapterIdx ?? 1) - 1)}
                    className="border border-black/25 bg-[#d8d8d6] px-3 py-2 text-black transition hover:bg-black hover:text-[#d8d8d6] disabled:opacity-35 disabled:pointer-events-none"
                  >
                    이전 항목
                  </button>
                  <button
                    type="button"
                    disabled={activeChapterIdx === chapters.length - 1}
                    onClick={() => openChapterDetail((activeChapterIdx ?? 0) + 1)}
                    className="border border-black/25 bg-[#d8d8d6] px-3 py-2 text-black transition hover:bg-black hover:text-[#d8d8d6] disabled:opacity-35 disabled:pointer-events-none"
                  >
                    다음 항목 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
