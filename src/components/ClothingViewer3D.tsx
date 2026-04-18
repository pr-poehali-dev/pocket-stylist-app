import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClothingViewer3DProps {
  image: string;
  name: string;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FACE_COUNT = 4;
const FACE_DEG = 360 / FACE_COUNT; // 90

// Per-face rendering config: label, rotateY position, CSS filter to simulate lighting
const FACES: {
  label: string;
  faceRotateY: number; // the face's own rotateY in the cube
  brightness: number;
  saturate: number;
  scaleX: number; // flip for back/detail views
}[] = [
  { label: "Front",        faceRotateY: 0,   brightness: 1.0,  saturate: 1.0,  scaleX:  1 },
  { label: "Right detail", faceRotateY: 90,  brightness: 0.88, saturate: 0.9,  scaleX:  1 },
  { label: "Back",         faceRotateY: 180, brightness: 0.78, saturate: 0.82, scaleX: -1 },
  { label: "Left detail",  faceRotateY: 270, brightness: 0.88, saturate: 0.9,  scaleX: -1 },
];

// Cube half-size in px — the translateZ offset for each face
const CUBE_HALF = 200; // px

// Auto-rotation speed (degrees per second)
const AUTO_ROTATE_DEG_PER_SEC = 18;

// Drag sensitivity: degrees per pixel dragged
const DRAG_SENSITIVITY = 0.4;

// Momentum friction coefficient per frame (at 60fps)
const FRICTION = 0.92;

// Snap animation duration (ms)
const SNAP_DURATION = 380;

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClothingViewer3D({
  image,
  name,
  onClose,
}: ClothingViewer3DProps) {
  // Current rotation in degrees (continuous, not clamped)
  const [rotateY, setRotateY] = useState<number>(0);
  // Whether we are in a snapping animation
  const [isSnapping, setIsSnapping] = useState<boolean>(false);

  // Which face index (0-3) is currently facing front
  const activeFace = ((Math.round(-rotateY / FACE_DEG) % FACE_COUNT) + FACE_COUNT) % FACE_COUNT;

  // -------------------------------------------------------------------------
  // Refs for imperative animation / event state
  // -------------------------------------------------------------------------
  const rotateYRef = useRef<number>(0);           // live value (avoids stale closure)
  const isDraggingRef = useRef<boolean>(false);
  const lastXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);          // deg/s
  const autoRotateRef = useRef<boolean>(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const snapRafRef = useRef<number | null>(null);
  const isSnappingRef = useRef<boolean>(false);

  // Sync ref with state so animation loops always read current value
  const syncRotate = useCallback((deg: number) => {
    rotateYRef.current = deg;
    setRotateY(deg);
  }, []);

  // -------------------------------------------------------------------------
  // Auto-rotation loop
  // -------------------------------------------------------------------------
  const startAutoRotate = useCallback(() => {
    autoRotateRef.current = true;

    const tick = (prev: number) => {
      if (!autoRotateRef.current) return;
      const now = performance.now();
      if (tick.last === undefined) tick.last = now;
      const dt = (now - tick.last) / 1000;
      tick.last = now;

      const next = rotateYRef.current - AUTO_ROTATE_DEG_PER_SEC * dt;
      syncRotate(next);
      rafRef.current = requestAnimationFrame(tick as unknown as FrameRequestCallback);
    };
    (tick as unknown as { last: number }).last = performance.now();
    rafRef.current = requestAnimationFrame(tick as unknown as FrameRequestCallback);
  }, [syncRotate]);

  const stopAutoRotate = useCallback(() => {
    autoRotateRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Reset idle timer — after 2.5 s of no interaction, resume auto-rotate
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current && !isSnappingRef.current) {
        startAutoRotate();
      }
    }, 2500);
  }, [startAutoRotate]);

  // -------------------------------------------------------------------------
  // Snap-to-face logic
  // -------------------------------------------------------------------------
  const snapToNearestFace = useCallback(() => {
    stopAutoRotate();
    if (snapRafRef.current !== null) cancelAnimationFrame(snapRafRef.current);

    const from = rotateYRef.current;
    // Find nearest multiple of 90 in the negative direction (we rotate negative)
    const nearest = Math.round(from / FACE_DEG) * FACE_DEG;

    if (Math.abs(nearest - from) < 0.5) {
      syncRotate(nearest);
      isSnappingRef.current = false;
      setIsSnapping(false);
      resetIdleTimer();
      return;
    }

    isSnappingRef.current = true;
    setIsSnapping(true);

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / SNAP_DURATION, 1);
      const eased = easeOutCubic(t);
      const current = from + (nearest - from) * eased;
      syncRotate(current);

      if (t < 1) {
        snapRafRef.current = requestAnimationFrame(step);
      } else {
        syncRotate(nearest);
        isSnappingRef.current = false;
        setIsSnapping(false);
        resetIdleTimer();
      }
    };

    snapRafRef.current = requestAnimationFrame(step);
  }, [stopAutoRotate, syncRotate, resetIdleTimer]);

  // -------------------------------------------------------------------------
  // Momentum after drag release
  // -------------------------------------------------------------------------
  const startMomentum = useCallback(() => {
    if (snapRafRef.current !== null) cancelAnimationFrame(snapRafRef.current);

    let velocity = velocityRef.current; // deg/s
    let lastFrame = performance.now();

    const step = (now: number) => {
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;

      velocity *= Math.pow(FRICTION, dt * 60);
      const next = rotateYRef.current + velocity * dt;
      syncRotate(next);

      if (Math.abs(velocity) > 5) {
        snapRafRef.current = requestAnimationFrame(step);
      } else {
        snapToNearestFace();
      }
    };

    snapRafRef.current = requestAnimationFrame(step);
  }, [syncRotate, snapToNearestFace]);

  // -------------------------------------------------------------------------
  // Pointer interaction helpers
  // -------------------------------------------------------------------------
  const handleDragStart = useCallback(
    (clientX: number) => {
      stopAutoRotate();
      if (snapRafRef.current !== null) {
        cancelAnimationFrame(snapRafRef.current);
        snapRafRef.current = null;
      }
      isSnappingRef.current = false;
      setIsSnapping(false);
      isDraggingRef.current = true;
      lastXRef.current = clientX;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
    },
    [stopAutoRotate]
  );

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dx = clientX - lastXRef.current;
    const dt = (now - lastTimeRef.current) / 1000;

    const deltaDeg = dx * DRAG_SENSITIVITY;
    const next = rotateYRef.current + deltaDeg;
    syncRotate(next);

    if (dt > 0) {
      // deg/s — smooth with a small EMA
      const rawVel = deltaDeg / dt;
      velocityRef.current = velocityRef.current * 0.6 + rawVel * 0.4;
    }

    lastXRef.current = clientX;
    lastTimeRef.current = now;
  }, [syncRotate]);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (Math.abs(velocityRef.current) > 20) {
      startMomentum();
    } else {
      snapToNearestFace();
    }
  }, [startMomentum, snapToNearestFace]);

  // -------------------------------------------------------------------------
  // Mouse events
  // -------------------------------------------------------------------------
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const onUp = () => handleDragEnd();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [handleDragMove, handleDragEnd]);

  // -------------------------------------------------------------------------
  // Touch events
  // -------------------------------------------------------------------------
  const viewerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX);
    },
    [handleDragStart]
  );

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      handleDragMove(e.touches[0].clientX);
    };
    const onEnd = () => handleDragEnd();
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // -------------------------------------------------------------------------
  // Keyboard: left/right arrow to rotate by one face
  // -------------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        stopAutoRotate();
        if (snapRafRef.current !== null) cancelAnimationFrame(snapRafRef.current);
        velocityRef.current = e.key === "ArrowRight" ? -300 : 300;
        startMomentum();
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stopAutoRotate, startMomentum, onClose]);

  // -------------------------------------------------------------------------
  // Mount / unmount
  // -------------------------------------------------------------------------
  useEffect(() => {
    startAutoRotate();
    return () => {
      stopAutoRotate();
      if (snapRafRef.current !== null) cancelAnimationFrame(snapRafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [startAutoRotate, stopAutoRotate]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // -------------------------------------------------------------------------
  // Derived display values
  // -------------------------------------------------------------------------
  const faceLabel = FACES[activeFace].label;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`3D viewer: ${name}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Close button                                                         */}
      {/* ------------------------------------------------------------------ */}
      <button
        onClick={onClose}
        aria-label="Close viewer"
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          transition: "background 0.15s",
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#f0f0f0";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <line x1="1" y1="1" x2="17" y2="17" stroke="#111" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="1" x2="1" y2="17" stroke="#111" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {/* ------------------------------------------------------------------ */}
      {/* Face label badge                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#888",
          pointerEvents: "none",
          transition: "opacity 0.25s",
        }}
      >
        {faceLabel}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3D scene                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={viewerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          width: 320,
          height: 420,
          perspective: "1000px",
          cursor: isDraggingRef.current ? "grabbing" : "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
          flexShrink: 0,
        }}
      >
        {/* Cube wrapper — rotates in 3D */}
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotateY}deg)`,
            transition: isSnapping ? `transform ${SNAP_DURATION}ms cubic-bezier(0.33,1,0.68,1)` : "none",
          }}
        >
          {FACES.map((face, i) => (
            <CubeFace
              key={i}
              image={image}
              faceRotateY={face.faceRotateY}
              translateZ={CUBE_HALF}
              brightness={face.brightness}
              saturate={face.saturate}
              scaleX={face.scaleX}
            />
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Dot indicators                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 28,
        }}
      >
        {FACES.map((face, i) => (
          <button
            key={i}
            aria-label={`Go to ${face.label}`}
            onClick={() => {
              stopAutoRotate();
              if (snapRafRef.current !== null) cancelAnimationFrame(snapRafRef.current);
              // Snap to the target face by animating
              const target = -(i * FACE_DEG);
              // Find the nearest equivalent angle to current rotation
              const current = rotateYRef.current;
              const diff = ((target - current) % 360 + 540) % 360 - 180;
              velocityRef.current = 0;
              const dest = current + diff;

              isSnappingRef.current = true;
              setIsSnapping(false); // we'll use our own RAF here
              const from = current;
              const startTime = performance.now();

              const step = (now: number) => {
                const elapsed = now - startTime;
                const t = Math.min(elapsed / SNAP_DURATION, 1);
                const eased = easeOutCubic(t);
                syncRotate(from + (dest - from) * eased);
                if (t < 1) {
                  snapRafRef.current = requestAnimationFrame(step);
                } else {
                  syncRotate(dest);
                  isSnappingRef.current = false;
                  resetIdleTimer();
                }
              };
              snapRafRef.current = requestAnimationFrame(step);
            }}
            style={{
              width: i === activeFace ? 20 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              background: i === activeFace ? "#111" : "#ccc",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.25s, background 0.25s",
            }}
          />
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom info                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#111",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          {name}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "#aaa",
            marginTop: 6,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Drag to rotate
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CubeFace sub-component
// ---------------------------------------------------------------------------

interface CubeFaceProps {
  image: string;
  faceRotateY: number;
  translateZ: number;
  brightness: number;
  saturate: number;
  scaleX: number;
}

function CubeFace({
  image,
  faceRotateY,
  translateZ,
  brightness,
  saturate,
  scaleX,
}: CubeFaceProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `rotateY(${faceRotateY}deg) translateZ(${translateZ}px)`,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
      }}
    >
      {/* Background card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#f8f8f8",
          borderRadius: 16,
        }}
      />

      {/* Clothing image */}
      <img
        src={image}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          padding: 24,
          boxSizing: "border-box",
          transform: `scaleX(${scaleX})`,
          filter: `brightness(${brightness}) saturate(${saturate})`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Lighting overlay — adds a subtle gradient sheen per face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            faceRotateY === 0
              ? "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)"
              : faceRotateY === 90
              ? "linear-gradient(225deg, rgba(0,0,0,0.08) 0%, transparent 60%)"
              : faceRotateY === 180
              ? "linear-gradient(315deg, rgba(0,0,0,0.14) 0%, transparent 60%)"
              : "linear-gradient(45deg, rgba(0,0,0,0.08) 0%, transparent 60%)",
          borderRadius: 16,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
