'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ size = 12, maxDistance = 5, pupilColor = 'black', forceLookX, forceLookY }: PupilProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calcPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const rect = pupilRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const pos = calcPosition();
  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{ width: `${size}px`, height: `${size}px`, backgroundColor: pupilColor, transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.1s ease-out' }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = 'black', isBlinking = false, forceLookX, forceLookY }: EyeBallProps) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calcPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const pos = calcPosition();
  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: `${size}px`, height: isBlinking ? '2px' : `${size}px`, backgroundColor: eyeColor, overflow: 'hidden' }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{ width: `${pupilSize}px`, height: `${pupilSize}px`, backgroundColor: pupilColor, transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.1s ease-out' }}
        />
      )}
    </div>
  );
};

interface AnimatedCharactersPanelProps {
  isTyping?: boolean;
  password?: string;
  showPassword?: boolean;
}

export default function AnimatedCharactersPanel({ isTyping = false, password = '', showPassword = false }: AnimatedCharactersPanelProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  useEffect(() => {
    const scheduleBlink = (setter: (v: boolean) => void) => {
      const t = setTimeout(() => {
        setter(true);
        setTimeout(() => { setter(false); scheduleBlink(setter); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t1 = scheduleBlink(setIsPurpleBlinking);
    const t2 = scheduleBlink(setIsBlackBlinking);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const t = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(t);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsPurplePeeking(true);
        setTimeout(() => setIsPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    } else {
      setIsPurplePeeking(false);
    }
  }, [password, showPassword, isPurplePeeking]);

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 3;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const pp = calcPos(purpleRef);
  const bp = calcPos(blackRef);
  const yp = calcPos(yellowRef);
  const op = calcPos(orangeRef);

  const hidingPassword = password.length > 0 && !showPassword;
  const showingPassword = password.length > 0 && showPassword;

  return (
    <div className="relative hidden lg:flex flex-col justify-between bg-linear-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground overflow-hidden">
      {/* Brand */}
      <div className="relative z-20">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="size-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <span style={{ fontFamily: 'var(--font-caveat)' }} className="text-2xl tracking-wide">FileVault</span>
        </div>
      </div>

      {/* Characters */}
      <div className="relative z-20 flex items-end justify-center h-125">
        <div className="relative" style={{ width: '550px', height: '400px' }}>
          {/* Purple — back */}
          <div
            ref={purpleRef}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '70px', width: '180px',
              height: (isTyping || hidingPassword) ? '440px' : '400px',
              backgroundColor: '#1e3a8a',
              borderRadius: '10px 10px 0 0',
              zIndex: 1,
              transform: showingPassword
                ? 'skewX(0deg)'
                : (isTyping || hidingPassword)
                  ? `skewX(${(pp.bodySkew || 0) - 12}deg) translateX(40px)`
                  : `skewX(${pp.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-8 transition-all duration-700 ease-in-out"
              style={{
                left: showingPassword ? '20px' : isLookingAtEachOther ? '55px' : `${45 + pp.faceX}px`,
                top: showingPassword ? '35px' : isLookingAtEachOther ? '65px' : `${40 + pp.faceY}px`,
              }}
            >
              <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking}
                forceLookX={showingPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                forceLookY={showingPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
              <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking}
                forceLookX={showingPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                forceLookY={showingPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
            </div>
          </div>

          {/* Black — middle */}
          <div
            ref={blackRef}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '240px', width: '120px', height: '310px',
              backgroundColor: '#2D2D2D',
              borderRadius: '8px 8px 0 0',
              zIndex: 2,
              transform: showingPassword
                ? 'skewX(0deg)'
                : isLookingAtEachOther
                  ? `skewX(${(bp.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                  : (isTyping || hidingPassword)
                    ? `skewX(${(bp.bodySkew || 0) * 1.5}deg)`
                    : `skewX(${bp.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-6 transition-all duration-700 ease-in-out"
              style={{
                left: showingPassword ? '10px' : isLookingAtEachOther ? '32px' : `${26 + bp.faceX}px`,
                top: showingPassword ? '28px' : isLookingAtEachOther ? '12px' : `${32 + bp.faceY}px`,
              }}
            >
              <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
                forceLookX={showingPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
                forceLookY={showingPassword ? -4 : isLookingAtEachOther ? -4 : undefined} />
              <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
                forceLookX={showingPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
                forceLookY={showingPassword ? -4 : isLookingAtEachOther ? -4 : undefined} />
            </div>
          </div>

          {/* Orange — front left */}
          <div
            ref={orangeRef}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '0px', width: '240px', height: '200px',
              backgroundColor: '#FF9B6B',
              borderRadius: '120px 120px 0 0',
              zIndex: 3,
              transform: showingPassword ? 'skewX(0deg)' : `skewX(${op.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-8 transition-all duration-200 ease-out"
              style={{
                left: showingPassword ? '50px' : `${82 + (op.faceX || 0)}px`,
                top: showingPassword ? '85px' : `${90 + (op.faceY || 0)}px`,
              }}
            >
              <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={showingPassword ? -5 : undefined} forceLookY={showingPassword ? -4 : undefined} />
              <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={showingPassword ? -5 : undefined} forceLookY={showingPassword ? -4 : undefined} />
            </div>
          </div>

          {/* Yellow — front right */}
          <div
            ref={yellowRef}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '310px', width: '140px', height: '230px',
              backgroundColor: '#E8D754',
              borderRadius: '70px 70px 0 0',
              zIndex: 4,
              transform: showingPassword ? 'skewX(0deg)' : `skewX(${yp.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            <div
              className="absolute flex gap-6 transition-all duration-200 ease-out"
              style={{
                left: showingPassword ? '20px' : `${52 + (yp.faceX || 0)}px`,
                top: showingPassword ? '35px' : `${40 + (yp.faceY || 0)}px`,
              }}
            >
              <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={showingPassword ? -5 : undefined} forceLookY={showingPassword ? -4 : undefined} />
              <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={showingPassword ? -5 : undefined} forceLookY={showingPassword ? -4 : undefined} />
            </div>
            <div
              className="absolute w-20 h-1 bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
              style={{
                left: showingPassword ? '10px' : `${40 + (yp.faceX || 0)}px`,
                top: showingPassword ? '88px' : `${88 + (yp.faceY || 0)}px`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="relative z-20 flex items-center gap-8 text-sm text-white/60">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Contact</a>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-1/4 right-1/4 size-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
    </div>
  );
}
