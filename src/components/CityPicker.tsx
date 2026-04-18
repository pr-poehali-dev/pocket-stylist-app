import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CITIES: string[] = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Омск",
  "Ростов-на-Дону",
  "Уфа",
  "Красноярск",
  "Воронеж",
  "Пермь",
  "Волгоград",
  "Краснодар",
  "Саратов",
  "Тюмень",
  "Тольятти",
  "Ижевск",
  "Барнаул",
  "Ульяновск",
  "Иркутск",
  "Хабаровск",
  "Ярославль",
  "Владивосток",
  "Махачкала",
  "Томск",
  "Оренбург",
  "Кемерово",
  "Новокузнецк",
  "Рязань",
  "Астрахань",
  "Набережные Челны",
  "Пенза",
  "Липецк",
  "Киров",
  "Чебоксары",
  "Тула",
  "Калининград",
  "Балашиха",
  "Курск",
  "Улан-Удэ",
  "Ставрополь",
  "Сочи",
  "Тверь",
  "Магнитогорск",
  "Иваново",
  "Брянск",
  "Белгород",
  "Сургут",
  "Владимир",
  "Нижний Тагил",
  "Архангельск",
  "Чита",
  "Калуга",
  "Смоленск",
  "Волжский",
  "Якутск",
  "Саранск",
  "Нижневартовск",
  "Череповец",
  "Курган",
  "Вологда",
  "Орёл",
  "Владикавказ",
  "Мурманск",
  "Тамбов",
  "Грозный",
  "Петрозаводск",
  "Стерлитамак",
  "Кострома",
  "Нальчик",
  "Нижнекамск",
  "Новороссийск",
  "Йошкар-Ола",
  "Таганрог",
  "Комсомольск-на-Амуре",
  "Сыктывкар",
  "Мытищи",
  "Люберцы",
  "Подольск",
  "Химки",
  "Орск",
  "Нефтеюганск",
  "Псков",
  "Бийск",
  "Абакан",
  "Армавир",
  "Пятигорск",
  "Рыбинск",
  "Великий Новгород",
  "Благовещенск",
  "Петропавловск-Камчатский",
  "Анапа",
  "Геленджик",
  "Симферополь",
  "Севастополь",
  "Ханты-Мансийск",
  "Дербент",
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ITEM_HEIGHT = 44; // px
const VISIBLE_ITEMS = 5; // must be odd
const HALF = Math.floor(VISIBLE_ITEMS / 2); // 2
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS; // 220

// Per-slot visual properties indexed by distance from center (0, 1, 2)
const SLOT_STYLE: Record<number, { scale: number; opacity: number }> = {
  0: { scale: 1.0, opacity: 1 },
  1: { scale: 0.85, opacity: 0.5 },
  2: { scale: 0.7, opacity: 0.25 },
};

// ---------------------------------------------------------------------------
// Web Audio tick
// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioCtx;
}

function playTick(): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.02);
  } catch {
    // Silently ignore if AudioContext is unavailable
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampIndex(index: number): number {
  return Math.max(0, Math.min(CITIES.length - 1, index));
}

function cityToIndex(city: string): number {
  const idx = CITIES.indexOf(city);
  return idx >= 0 ? idx : 0;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CityPickerProps {
  value: string;
  onChange: (city: string) => void;
}

export default function CityPicker({ value, onChange }: CityPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(() =>
    cityToIndex(value)
  );

  // Fractional offset during drag/momentum (in item units, not px)
  const [dragOffset, setDragOffset] = useState<number>(0);

  // Keep previous value in sync when prop changes externally
  const prevValueRef = useRef<string>(value);
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      const idx = cityToIndex(value);
      setSelectedIndex(idx);
      setDragOffset(0);
    }
  }, [value]);

  // Notify parent when selectedIndex stabilises
  const prevIndexRef = useRef<number>(selectedIndex);
  useEffect(() => {
    if (selectedIndex !== prevIndexRef.current) {
      prevIndexRef.current = selectedIndex;
      prevValueRef.current = CITIES[selectedIndex];
      onChange(CITIES[selectedIndex]);
      playTick();
    }
  }, [selectedIndex, onChange]);

  // -------------------------------------------------------------------------
  // Momentum / animation state (kept in refs to avoid re-renders)
  // -------------------------------------------------------------------------
  const rafRef = useRef<number | null>(null);
  const velocityRef = useRef<number>(0); // items/s
  const continuousOffsetRef = useRef<number>(0); // fractional item offset during drag
  const isDraggingRef = useRef<boolean>(false);
  const lastYRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // dragOffset drives the visual shift, we keep a React state for it
  const dragOffsetStateRef = useRef<number>(0);

  const commitOffset = useCallback(
    (rawOffset: number) => {
      // rawOffset: fractional items scrolled (positive = scroll down = index up)
      const clamped = clampIndex(
        Math.round(selectedIndex + rawOffset)
      );
      const snapped = clamped - selectedIndex;
      setDragOffset(0);
      dragOffsetStateRef.current = 0;
      continuousOffsetRef.current = 0;

      if (clamped !== selectedIndex) {
        // Tick count = number of items crossed
        const steps = Math.abs(clamped - selectedIndex);
        for (let i = 0; i < Math.min(steps, 8); i++) {
          setTimeout(() => playTick(), i * 15);
        }
        setSelectedIndex(clamped);
      }

      return snapped;
    },
    [selectedIndex]
  );

  const cancelMomentum = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startMomentum = useCallback(() => {
    cancelMomentum();

    let velocity = velocityRef.current; // items / second
    let lastFrame = performance.now();
    let accumulated = continuousOffsetRef.current;

    const step = (now: number) => {
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;

      accumulated += velocity * dt;
      velocity *= Math.pow(0.88, dt * 60); // friction

      const newDragOffset = accumulated;
      dragOffsetStateRef.current = newDragOffset;
      setDragOffset(newDragOffset);

      if (Math.abs(velocity) < 0.05) {
        // Snap to nearest
        commitOffset(accumulated);
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [cancelMomentum, commitOffset]);

  // -------------------------------------------------------------------------
  // Mouse events
  // -------------------------------------------------------------------------
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      cancelMomentum();
      isDraggingRef.current = true;
      lastYRef.current = e.clientY;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
      continuousOffsetRef.current = dragOffsetStateRef.current;
      e.preventDefault();
    },
    [cancelMomentum]
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dy = e.clientY - lastYRef.current;
    const dt = (now - lastTimeRef.current) / 1000;

    // Positive dy (finger/mouse moving down) -> scroll up -> lower index
    const deltaItems = -dy / ITEM_HEIGHT;
    continuousOffsetRef.current += deltaItems;
    dragOffsetStateRef.current = continuousOffsetRef.current;

    if (dt > 0) {
      velocityRef.current = deltaItems / dt;
    }

    lastYRef.current = e.clientY;
    lastTimeRef.current = now;

    setDragOffset(continuousOffsetRef.current);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startMomentum();
  }, [startMomentum]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // -------------------------------------------------------------------------
  // Touch events
  // -------------------------------------------------------------------------
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      cancelMomentum();
      isDraggingRef.current = true;
      lastYRef.current = e.touches[0].clientY;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
      continuousOffsetRef.current = dragOffsetStateRef.current;
    },
    [cancelMomentum]
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dy = e.touches[0].clientY - lastYRef.current;
    const dt = (now - lastTimeRef.current) / 1000;
    const deltaItems = -dy / ITEM_HEIGHT;

    continuousOffsetRef.current += deltaItems;
    dragOffsetStateRef.current = continuousOffsetRef.current;

    if (dt > 0) {
      velocityRef.current = deltaItems / dt;
    }

    lastYRef.current = e.touches[0].clientY;
    lastTimeRef.current = now;

    setDragOffset(continuousOffsetRef.current);
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startMomentum();
  }, [startMomentum]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  // -------------------------------------------------------------------------
  // Wheel event
  // -------------------------------------------------------------------------
  const wheelAccumRef = useRef<number>(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      cancelMomentum();

      const delta = e.deltaY / ITEM_HEIGHT;
      wheelAccumRef.current += delta;

      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        const newIdx = clampIndex(
          Math.round(selectedIndex + wheelAccumRef.current)
        );
        const steps = Math.abs(newIdx - selectedIndex);
        for (let i = 0; i < Math.min(steps, 8); i++) {
          setTimeout(() => playTick(), i * 30);
        }
        setSelectedIndex(newIdx);
        wheelAccumRef.current = 0;
        setDragOffset(0);
        dragOffsetStateRef.current = 0;
      }, 80);

      const tentativeOffset = wheelAccumRef.current;
      setDragOffset(tentativeOffset);
      dragOffsetStateRef.current = tentativeOffset;
    },
    [cancelMomentum, selectedIndex]
  );

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      cancelMomentum();
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [cancelMomentum]);

  // -------------------------------------------------------------------------
  // Render items
  // -------------------------------------------------------------------------
  // The visual fractional offset from center (in item units)
  const totalOffset = dragOffset; // positive = scroll down list (higher city index)

  // Which range of cities to render (always render VISIBLE_ITEMS + 2 buffer)
  const renderItems = () => {
    const items: React.ReactNode[] = [];

    for (let slot = -HALF; slot <= HALF; slot++) {
      const cityIndex = clampIndex(
        Math.round(selectedIndex + totalOffset) + slot
      );

      // Visual position relative to center
      const visualPos = slot - (totalOffset - Math.round(totalOffset));
      const dist = Math.abs(visualPos);

      let scale: number;
      let opacity: number;

      if (dist <= 0.5) {
        // Between center and adjacent
        const t = dist * 2;
        scale = SLOT_STYLE[0].scale + t * (SLOT_STYLE[1].scale - SLOT_STYLE[0].scale);
        opacity =
          SLOT_STYLE[0].opacity +
          t * (SLOT_STYLE[1].opacity - SLOT_STYLE[0].opacity);
      } else if (dist <= 1.5) {
        const t = (dist - 0.5) * 1;
        scale = SLOT_STYLE[1].scale + t * (SLOT_STYLE[2].scale - SLOT_STYLE[1].scale);
        opacity =
          SLOT_STYLE[1].opacity +
          t * (SLOT_STYLE[2].opacity - SLOT_STYLE[1].opacity);
      } else {
        scale = SLOT_STYLE[2].scale;
        opacity = SLOT_STYLE[2].opacity;
      }

      const isCenter = dist < 0.5;
      const translateY =
        (slot - (totalOffset - Math.round(totalOffset))) * ITEM_HEIGHT;

      items.push(
        <div
          key={slot}
          aria-selected={isCenter}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            top: HALF * ITEM_HEIGHT,
            transform: `translateY(${translateY - ITEM_HEIGHT / 2}px) scale(${scale})`,
            opacity,
            transition: isDraggingRef.current ? "none" : "transform 0.05s, opacity 0.05s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: isCenter ? "700" : "400",
            fontSize: isCenter ? "17px" : "15px",
            color: isCenter ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            paddingLeft: "12px",
            paddingRight: "12px",
            letterSpacing: isCenter ? "0.01em" : "0",
          }}
        >
          {CITIES[cityIndex]}
        </div>
      );
    }

    return items;
  };

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Выбор города"
      style={{
        position: "relative",
        width: "100%",
        height: CONTAINER_HEIGHT,
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none",
        fontFamily: "Inter, sans-serif",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
    >
      {/* Scrollable items layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        {renderItems()}
      </div>

      {/* Center selection indicator lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: HALF * ITEM_HEIGHT,
          height: ITEM_HEIGHT,
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {/* Top line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "12px",
            right: "12px",
            height: "1px",
            background: "hsl(var(--border))",
            opacity: 0.8,
          }}
        />
        {/* Bottom line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "12px",
            right: "12px",
            height: "1px",
            background: "hsl(var(--border))",
            opacity: 0.8,
          }}
        />
      </div>

      {/* Top fade gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HALF * ITEM_HEIGHT,
          background:
            "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Bottom fade gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: HALF * ITEM_HEIGHT,
          background:
            "linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
    </div>
  );
}
