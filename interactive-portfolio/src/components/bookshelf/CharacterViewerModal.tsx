'use client';

import React, { Component, ErrorInfo, ReactNode, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { BookCategory } from '@/types/portfolio';

interface CharacterViewerModalProps {
  book: BookCategory;
  onClose: () => void;
}

interface ElementItem {
  charNum: number;
  elemNum: number;
  imageUrl: string;
}

interface CharacterSlot {
  id: string;
  charNum: number;
  code: string;
  name: string;
  tagline: string;
  designIdeas: string;
  modelUrl: string;
  elements: ElementItem[];
}

function stripLeadingNumber(raw: string): string {
  return raw
    .replace(/^\d+[_\-\s]+/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function extractTwoNumbers(fileName: string): { charNum: number; elemNum: number } | null {
  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  const m = withoutExt.match(/^0?(\d+)[_\-\s]+0?(\d+)/);
  if (!m) return null;
  return {
    charNum: parseInt(m[1], 10),
    elemNum: parseInt(m[2], 10),
  };
}

function extractSingleNumber(fileName: string, fallbackIdx: number): number {
  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  const m = withoutExt.match(/^0?(\d+)/);
  return m ? parseInt(m[1], 10) : fallbackIdx + 1;
}

function matchElementsForCharacter(charNum: number, allImgFiles: string[]): ElementItem[] {
  return allImgFiles
    .map((img, idx) => {
      const two = extractTwoNumbers(img);
      return {
        img,
        idx,
        cNum: two ? two.charNum : charNum,
        eNum: two ? two.elemNum : extractSingleNumber(img, idx),
      };
    })
    .filter((item) => item.cNum === charNum)
    .sort((a, b) => {
      if (a.eNum !== b.eNum) return a.eNum - b.eNum;
      return a.img.localeCompare(b.img);
    })
    .map((item) => ({
      charNum: item.cNum,
      elemNum: item.eNum,
      imageUrl: `/characters/${encodeURIComponent(item.img)}`,
    }));
}

const DEFAULT_SLOT: CharacterSlot = {
  id: 'char-01',
  charNum: 1,
  code: 'CHARACTER // 01',
  name: 'STELLA JANG',
  tagline: '스텔라 장 · 3D 캐릭터 아트워크',
  designIdeas:
    '스텔라 장 캐릭터의 표정과 실루엣, 소품 디테일이 한눈에 들어오도록 구성한 3D 캐릭터 작업입니다. 마우스로 드래그해 회전하거나 휠로 확대·축소하며 입체 형태를 자유롭게 살펴볼 수 있습니다.',
  modelUrl: '/characters/01_StellaJang.glb',
  elements: [
    { charNum: 1, elemNum: 1, imageUrl: '/characters/01_1_Mike.png' },
    { charNum: 1, elemNum: 2, imageUrl: '/characters/01_2_Orange.png' },
  ],
};

class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; resetKey: string; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: {
    children: ReactNode;
    fallback: ReactNode;
    resetKey: string;
    onError?: () => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError?.();
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function LoadedCharacterModel({ url, autoRotate }: { url: string; autoRotate: boolean }) {
  const gltf = useGLTF(url);
  const rootRef = useRef<THREE.Group>(null);

  const normalizedScene = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const scale = 2.25 / maxDim;

    cloned.scale.setScalar(scale);
    cloned.position.set(-center.x * scale, -box.min.y * scale - 0.78, -center.z * scale);

    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        if (mesh.geometry && !mesh.geometry.attributes.normal) {
          mesh.geometry.computeVertexNormals();
        }

        const tuneMaterial = (mat: THREE.Material) => {
          const stdMat = mat as THREE.MeshStandardMaterial;
          if ('roughness' in stdMat && typeof stdMat.roughness === 'number') {
            stdMat.roughness = Math.max(stdMat.roughness, 0.42);
          }
          if ('metalness' in stdMat && typeof stdMat.metalness === 'number') {
            stdMat.metalness = Math.min(stdMat.metalness, 0.25);
          }
          stdMat.needsUpdate = true;
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(tuneMaterial);
        } else if (mesh.material) {
          tuneMaterial(mesh.material);
        }
      }
    });

    return cloned;
  }, [gltf.scene]);

  useFrame((_state, delta) => {
    if (rootRef.current && autoRotate) {
      rootRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group ref={rootRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

export default function CharacterViewerModal({ book, onClose }: CharacterViewerModalProps) {
  const { active: __isModelLoading, progress: __loadProgress } = useProgress();
  const [slots, setSlots] = useState<CharacterSlot[]>([DEFAULT_SLOT]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [modelLoadFailed, setModelLoadFailed] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/characters', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { files?: string[]; images?: string[] }) => {
        if (!active) return;
        const files = Array.isArray(data?.files) ? [...data.files] : [];
        const images = Array.isArray(data?.images) ? [...data.images] : [];

        files.sort((a, b) => {
          const na = extractSingleNumber(a, 999);
          const nb = extractSingleNumber(b, 999);
          if (na !== nb) return na - nb;
          return a.localeCompare(b);
        });

        if (files.length > 0) {
          const mapped: CharacterSlot[] = files.map((fileName, idx) => {
            const charNum = extractSingleNumber(fileName, idx);
            const numStr = String(charNum).padStart(2, '0');
            const titleName =
              stripLeadingNumber(fileName.replace(/\.(glb|gltf)$/i, '')) || `CHARACTER ${numStr}`;
            return {
              id: `char-${charNum}-${fileName}`,
              charNum,
              code: `CHARACTER // ${numStr}`,
              name: titleName,
              tagline: `스텔라 장 · ${titleName} 3D 캐릭터`,
              designIdeas:
                '스텔라 장 캐릭터의 표정과 실루엣, 소품 디테일이 한눈에 들어오도록 구성한 3D 캐릭터 작업입니다. 마우스로 드래그해 회전하거나 휠로 확대·축소하며 입체 형태를 자유롭게 살펴볼 수 있습니다.',
              modelUrl: `/characters/${encodeURIComponent(fileName)}`,
              elements: matchElementsForCharacter(charNum, images),
            };
          });
          setSlots(mapped);
          setSelectedIdx(0);
        } else if (images.length > 0) {
          setSlots((prev) =>
            prev.map((slot) => ({
              ...slot,
              elements: matchElementsForCharacter(slot.charNum, images),
            }))
          );
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const currentCharacter = slots[selectedIdx] ?? slots[0];

  useEffect(() => {
    setModelLoadFailed(false);
  }, [selectedIdx, currentCharacter?.modelUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[86vh] max-h-[820px] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-[#0b0c0f]/95 text-neutral-100 shadow-2xl md:flex-row max-md:flex-col-reverse"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="캐릭터 뷰어 닫기"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-md bg-neutral-900/75 text-sm font-semibold text-neutral-200 transition hover:text-orange-400"
        >
          ✕
        </button>

        {/* 좌측 패널 */}
        <div className="flex w-full flex-col justify-between overflow-y-auto bg-transparent p-6 md:w-[46%] md:p-8 max-md:flex-col-reverse">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block bg-neutral-100 px-2.5 py-1 text-xs font-bold tracking-wider text-neutral-950">
                {book.title || 'CHARACTER'}
              </span>
              <span className="px-2 py-0.5 font-mono text-[11px] text-orange-400">
                {currentCharacter.code}
              </span>
            </div>

            <div>
              <h2 className="break-words text-3xl font-black tracking-tight text-[#ff6a00] sm:text-5xl">
                {currentCharacter.name}
              </h2>
              <p className="mt-2 text-base font-semibold text-neutral-100">스텔라 장</p>
              <p className="mt-1 text-xs text-neutral-400">{currentCharacter.tagline}</p>
            </div>

            {slots.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {slots.map((item, idx) => {
                  const active = idx === selectedIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIdx(idx)}
                      className={`px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? 'bg-orange-500/15 text-orange-300'
                          : 'bg-transparent text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {item.code} · {item.name}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-bold tracking-widest text-neutral-200">
                DESIGN IDEAS
              </div>
              <p className="text-xs leading-relaxed text-neutral-300 sm:text-sm">
                {currentCharacter.designIdeas}
              </p>
            </div>

            {currentCharacter.elements.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold tracking-widest text-neutral-200">
                  ELEMENT
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentCharacter.elements.map((el) => (
                    <div
                      key={`${el.charNum}-${el.elemNum}-${el.imageUrl}`}
                      className="flex h-40 w-full items-center justify-center overflow-hidden bg-transparent sm:h-44"
                    >
                      <img
                        src={el.imageUrl}
                        alt={`ELEMENT ${el.elemNum}`}
                        className="h-full w-full bg-transparent object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          
        </div>

        {/* 우측 패널: 3D 뷰어 */}
        <div className="relative flex h-[44vh] w-full flex-col bg-transparent md:h-auto md:w-[54%] max-md:flex-col-reverse">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 pr-16">
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`px-2.5 py-1 text-xs font-medium transition ${
                  autoRotate
                    ? 'bg-orange-500/15 text-orange-300'
                    : 'bg-neutral-900/60 text-neutral-300'
                }`}
              >
                {autoRotate ? '자동 회전 ON' : '자동 회전 OFF'}
              </button>
            </div>
          </div>

          <div className="h-full w-full cursor-grab active:cursor-grabbing">
            {__isModelLoading && (
        <div data-model-loader="true" className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 pointer-events-none">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <span className="text-xs tracking-widest uppercase text-neutral-400">
            LOADING 3D MODEL... {Math.round(__loadProgress)}%
          </span>
        </div>
      )}
      <Canvas
              dpr={[1, 2]}
              camera={{ position: [0, 0.25, 4.4], fov: 38 }}
              gl={{ antialias: true }}
            >
              <color attach="background" args={['#090a0d']} />
              <ambientLight intensity={1.0} />
              <directionalLight position={[3.5, 5.5, 4]} intensity={1.55} />
              <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#ff9d5c" />
              <hemisphereLight args={['#fff7ed', '#181b22', 1.2]} />
              <pointLight position={[-3, 3, 3]} intensity={1.2} color="#ff7b29" />

              <Grid
                position={[0, -0.79, 0]}
                args={[12, 12]}
                cellSize={0.5}
                cellThickness={0.6}
                cellColor="#20242d"
                sectionSize={2.5}
                sectionThickness={1}
                sectionColor="#343b49"
                fadeDistance={10}
                fadeStrength={1.5}
                infiniteGrid
              />

              {currentCharacter.modelUrl && !modelLoadFailed ? (
                <ModelErrorBoundary
                  resetKey={currentCharacter.modelUrl}
                  onError={() => setModelLoadFailed(true)}
                  fallback={null}
                >
                  <Suspense fallback={null}>
                    <LoadedCharacterModel url={currentCharacter.modelUrl} autoRotate={autoRotate} />
                  </Suspense>
                </ModelErrorBoundary>
              ) : null}

              <OrbitControls
                ref={controlsRef}
                makeDefault
                target={[0, 0.25, 0]}
                enableDamping
                dampingFactor={0.08}
                enablePan
                minDistance={1.6}
                maxDistance={9}
                maxPolarAngle={Math.PI / 2 - 0.03}
              />
            </Canvas>
          </div>

          <div className="pointer-events-none flex items-center justify-between bg-transparent px-4 py-2 text-[11px] text-neutral-400">
            <span></span>
            
          </div>
        </div>
      </div>
    </div>
  );
}
