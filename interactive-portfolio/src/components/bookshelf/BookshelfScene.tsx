'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { BOOKS_DATA } from '@/data/portfolioData';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import BookMesh3D from './BookMesh3D';
import PortfolioBookModal from './PortfolioBookModal';

export default function BookshelfScene() {
  const selectedBookId = usePortfolioStore((state) => state.selectedBookId);
  const closeBook = usePortfolioStore((state) => state.closeBook);
  const setHoveredBookIndex = usePortfolioStore((state) => state.setHoveredBookIndex);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const selectedBook = BOOKS_DATA.find((b) => b.id === selectedBookId);

  const handleClosePopup = () => {
    closeBook();
    setHoveredBookIndex(null);
  };

  return (
    <div
      style={{ width: '100vw', height: '100vh', backgroundColor: '#07080a' }}
      className="relative overflow-hidden select-none text-white"
    >
      <header className="fixed top-[58px] inset-x-0 z-20 flex justify-center pointer-events-none px-6">
        <h1
          style={{ fontFamily: '"Kanit", sans-serif' }}
          className="text-[20px] font-medium tracking-wider text-white text-center"
        >
          Jihyeon Baek&rsquo;s Graphic Library
        </h1>
      </header>

      <div className="w-full h-full">
        <Canvas
          shadows
          camera={{ position: [0, 0, isMobile ? 12.2 : 9.6], fov: 45 }}
          onPointerMissed={() => setHoveredBookIndex(null)}
        >
          <color attach="background" args={['#07080a']} />

          <Environment resolution={256} frames={1} environmentIntensity={0.85}>
            <Lightformer
              form="rect"
              intensity={2.2}
              color="#cfe4ff"
              scale={[12, 5, 1]}
              position={[-2, 7, 3]}
              rotation={[Math.PI / 2.6, 0.2, 0]}
            />
            <Lightformer
              form="circle"
              intensity={3.4}
              color="#ffe9c2"
              scale={[4.5, 4.5, 1]}
              position={[7, 4.5, 5]}
              rotation={[0, -Math.PI / 3, 0]}
            />
            <Lightformer
              form="rect"
              intensity={1.3}
              color="#b9d6ff"
              scale={[7, 5, 1]}
              position={[-7, 1.5, 2]}
              rotation={[0, Math.PI / 2.2, 0]}
            />
            <Lightformer
              form="rect"
              intensity={0.65}
              color="#e6ded3"
              scale={[10, 4, 1]}
              position={[0, -5, 3]}
              rotation={[-Math.PI / 2.5, 0, 0]}
            />
          </Environment>

          <ambientLight intensity={0.95} />
          <directionalLight
            position={[6, 8, 6]}
            intensity={1.65}
            color="#fff2dc"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0004}
          />
          <directionalLight position={[-6, 4, 4]} intensity={0.75} color="#cfe3ff" />

          <group
            position={[0, -1.85, 0]}
            scale={isMobile ? 0.86 : 1}
          >
            {BOOKS_DATA.map((book, idx) => (
              <BookMesh3D
                key={book.id}
                book={book}
                index={idx}
                totalBooks={BOOKS_DATA.length}
              />
            ))}
          </group>
        </Canvas>
      </div>

      {selectedBook && (
        <PortfolioBookModal book={selectedBook} onClose={handleClosePopup} />
      )}
    </div>
  );
}
