import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import CityPicker from "@/components/CityPicker";
import ClothingViewer3D from "@/components/ClothingViewer3D";
import StylistRegister from "@/pages/StylistRegister";
import StoreCabinet from "@/pages/StoreCabinet";

// ─────────────────────── TYPES ───────────────────────
type Tab = "catalog" | "ai" | "profile" | "orders" | "saved";
type SideView = "about" | "partners" | "catalogs" | "ads" | "stores" | "contacts" | "stylist-register" | "store-cabinet" | null;
type Gender = "male" | "female";
type BodyType = "athletic" | "slim" | "average" | "curvy" | "plus";
type OnboardStep = 1 | 2 | 3 | 4;

interface UserProfile {
  gender: Gender;
  bodyType: BodyType;
  firstName: string;
  lastName: string;
  city: string;
  avatar: string | null;
  age: number;
  height: number;
  weight: number;
  shoeSize: number;
  hairColor: string;
  skinTone: string;
  zodiac: string;
  phone: string;
  email: string;
}

// ─────────────────────── SKIN TONES MAP ───────────────────────
const SKIN_COLOR_MAP: Record<string, string> = {
  "Очень светлая": "#FDDBB4",
  "Светлая":       "#F5C89A",
  "Средняя":       "#D4956A",
  "Оливковая":     "#C07B45",
  "Смуглая":       "#8B5A2B",
  "Тёмная":        "#4A2912",
};

// ─────────────────────── DATA ───────────────────────
const CATALOG_ITEMS = [
  { id: 1, name: "Шерстяное пальто оверсайз", brand: "Zara", price: 12990, oldPrice: 17900, category: "Верхняя одежда", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/c4a1c0ba-ed27-4aaa-a323-95c938389c6c.jpg", tags: ["Тренд"], store: "Zara", inStock: true, rating: 4.8, sizes: ["XS","S","M","L"], events: ["театр","ужин","свидание"], gender: "female", stylist: "Анна Белова" },
  { id: 2, name: "Шёлковое платье-миди", brand: "H&M", price: 6499, oldPrice: null, category: "Платья", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/12aea226-dded-451f-af82-ceec84441516.jpg", tags: ["Бестселлер"], store: "H&M", inStock: true, rating: 4.6, sizes: ["XS","S","M","L","XL"], events: ["вечеринка","свидание","ужин"], gender: "female", stylist: "Анна Белова" },
  { id: 3, name: "Кожаные ботинки Chelsea", brand: "Mango", price: 9200, oldPrice: 12000, category: "Обувь", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/172d58c6-ad73-4e54-9b7a-b523408bf3b4.jpg", tags: ["Скидка"], store: "Mango", inStock: false, rating: 4.5, sizes: ["36","37","38","39","40"], events: ["офис","прогулка","театр"], gender: "both", stylist: null },
  { id: 4, name: "Cashmere свитер базовый", brand: "Zara", price: 5990, oldPrice: null, category: "Джемперы", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/c4a1c0ba-ed27-4aaa-a323-95c938389c6c.jpg", tags: ["Новинка"], store: "Zara", inStock: true, rating: 4.9, sizes: ["XS","S","M","L","XL"], events: ["офис","прогулка","casual"], gender: "both", stylist: "Дмитрий Ковалёв" },
  { id: 5, name: "Широкие брюки с защипами", brand: "H&M", price: 3799, oldPrice: 4999, category: "Брюки", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/12aea226-dded-451f-af82-ceec84441516.jpg", tags: ["Скидка","Тренд"], store: "H&M", inStock: true, rating: 4.4, sizes: ["XS","S","M","L"], events: ["офис","ужин","театр"], gender: "both", stylist: null },
  { id: 6, name: "Структурированный блейзер", brand: "Mango", price: 11500, oldPrice: null, category: "Пиджаки", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/172d58c6-ad73-4e54-9b7a-b523408bf3b4.jpg", tags: ["Бестселлер"], store: "Mango", inStock: true, rating: 4.7, sizes: ["S","M","L","XL"], events: ["офис","презентация","ужин"], gender: "both", stylist: "Дмитрий Ковалёв" },
  { id: 7, name: "Классические брюки slim", brand: "Boss", price: 14990, oldPrice: null, category: "Брюки", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/172d58c6-ad73-4e54-9b7a-b523408bf3b4.jpg", tags: ["Премиум"], store: "Boss", inStock: true, rating: 4.9, sizes: ["S","M","L","XL","XXL"], events: ["офис","презентация","ужин"], gender: "male", stylist: "Дмитрий Ковалёв" },
  { id: 8, name: "Оксфорды кожаные мужские", brand: "Mango Man", price: 11200, oldPrice: 13900, category: "Обувь", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/172d58c6-ad73-4e54-9b7a-b523408bf3b4.jpg", tags: ["Скидка"], store: "Mango", inStock: true, rating: 4.6, sizes: ["40","41","42","43","44","45"], events: ["офис","театр","ужин"], gender: "male", stylist: null },
  { id: 9, name: "Водолазка тонкой вязки", brand: "Zara Man", price: 3990, oldPrice: null, category: "Джемперы", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/c4a1c0ba-ed27-4aaa-a323-95c938389c6c.jpg", tags: ["Новинка"], store: "Zara", inStock: true, rating: 4.5, sizes: ["S","M","L","XL"], events: ["casual","прогулка","свидание"], gender: "male", stylist: "Дмитрий Ковалёв" },
];

const BODY_TYPES: { id: BodyType; label: string; desc: string }[] = [
  { id: "athletic", label: "Спортивное", desc: "Выраженный рельеф" },
  { id: "slim", label: "Подтянутое", desc: "Стройное, лёгкое" },
  { id: "average", label: "Среднее", desc: "Стандартные пропорции" },
  { id: "curvy", label: "Фигуристое", desc: "Плавные изгибы" },
  { id: "plus", label: "Пышное", desc: "Роскошные формы" },
];

const HAIR_COLORS = ["Чёрный", "Тёмно-русый", "Русый", "Светлый", "Рыжий", "Седой", "Окрашенный"];
const SKIN_TONES = ["Очень светлая", "Светлая", "Средняя", "Оливковая", "Смуглая", "Тёмная"];
const ZODIAC_SIGNS = ["Овен","Телец","Близнецы","Рак","Лев","Дева","Весы","Скорпион","Стрелец","Козерог","Водолей","Рыбы"];

const EVENTS = [
  { id: "office", label: "Офис", icon: "💼" },
  { id: "theater", label: "Театр", icon: "🎭" },
  { id: "date", label: "Свидание", icon: "🌹" },
  { id: "party", label: "Вечеринка", icon: "🎉" },
  { id: "dinner", label: "Ужин", icon: "🍷" },
  { id: "casual", label: "Casual", icon: "☕" },
  { id: "sport", label: "Спорт", icon: "🏃" },
  { id: "wedding", label: "Торжество", icon: "💍" },
];

const STORES = [
  { name: "Zara", category: "Мульти", cities: "По всей России", items: 2800 },
  { name: "H&M", category: "Мульти", cities: "60+ городов", items: 4200 },
  { name: "Mango", category: "Женский / Мужской", cities: "40+ городов", items: 1900 },
  { name: "Boss", category: "Премиум", cities: "Москва, СПб, Казань", items: 650 },
  { name: "Pull&Bear", category: "Молодёжный", cities: "30+ городов", items: 1200 },
  { name: "Bershka", category: "Молодёжный", cities: "25+ городов", items: 1100 },
  { name: "Massimo Dutti", category: "Премиум", cities: "Москва, СПб", items: 420 },
  { name: "Stradivarius", category: "Женский", cities: "20+ городов", items: 800 },
];

const ORDERS = [
  { id: "#BGS-4821", date: "12 апр 2026", items: ["Шерстяное пальто оверсайз"], status: "Доставлен", total: 12990 },
  { id: "#BGS-4719", date: "3 апр 2026", items: ["Шёлковое платье-миди", "Cashmere свитер"], status: "В пути", total: 12489 },
  { id: "#BGS-4601", date: "22 мар 2026", items: ["Широкие брюки с защипами"], status: "Обрабатывается", total: 3799 },
];

// ─────────────────────── SIZE CHART ───────────────────────
function getSizeRecommendation(weight: number, gender: Gender): string {
  if (gender === "female") {
    if (weight < 50) return "XS"; if (weight < 57) return "S";
    if (weight < 67) return "M";  if (weight < 78) return "L"; return "XL";
  } else {
    if (weight < 60) return "XS"; if (weight < 70) return "S";
    if (weight < 82) return "M";  if (weight < 96) return "L"; return "XL";
  }
}

// ─────────────────────── REALISTIC MANNEQUIN ───────────────────────
interface MannequinProps { gender: Gender; bodyType: BodyType; skinTone: string; height: number; weight: number; }

const Mannequin = ({ gender, bodyType, skinTone, height, weight }: MannequinProps) => {
  const skin = SKIN_COLOR_MAP[skinTone] || "#D4956A";
  const skinDark = skin; // used for shadows via opacity
  const isTall = height >= 175;
  const isShort = height < 163;

  // Female proportions
  if (gender === "female") {
    const bust  = bodyType === "curvy" ? 62 : bodyType === "plus" ? 70 : bodyType === "slim" ? 44 : 52;
    const waist = bodyType === "curvy" ? 36 : bodyType === "plus" ? 58 : bodyType === "slim" ? 28 : 40;
    const hip   = bodyType === "curvy" ? 70 : bodyType === "plus" ? 80 : bodyType === "slim" ? 46 : 60;
    const legLen = isTall ? 130 : isShort ? 108 : 120;
    const totalH = 50 + legLen;
    const vb = `0 0 120 ${totalH + 10}`;

    return (
      <svg viewBox={vb} className="w-full h-full" fill="none">
        <defs>
          <radialGradient id="skinF" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={skin} stopOpacity="1"/>
            <stop offset="100%" stopColor={skinDark} stopOpacity="0.75"/>
          </radialGradient>
          <radialGradient id="skinFDark" cx="60%" cy="65%" r="60%">
            <stop offset="0%" stopColor={skinDark} stopOpacity="0.6"/>
            <stop offset="100%" stopColor={skinDark} stopOpacity="0.2"/>
          </radialGradient>
        </defs>

        {/* Neck */}
        <rect x="54" y="27" width="12" height="12" rx="2"
          fill="url(#skinF)" stroke={skinDark} strokeWidth="0.4" strokeOpacity="0.4"/>

        {/* Torso — hourglass */}
        <path d={`M${60-bust/2} 38
          C${60-bust/2-3} 48 ${60-waist/2-2} 56 ${60-waist/2} 68
          C${60-hip/2-3} 78 ${60-hip/2} 88 ${60-hip/2} 92
          L${60+hip/2} 92
          C${60+hip/2} 88 ${60+hip/2+3} 78 ${60+waist/2} 68
          C${60+waist/2+2} 56 ${60+bust/2+3} 48 ${60+bust/2} 38 Z`}
          fill="url(#skinF)" stroke={skinDark} strokeWidth="0.5" strokeOpacity="0.3"/>
        {/* Body shadow */}
        <path d={`M${60-bust/2} 38
          C${60-bust/2-3} 48 ${60-waist/2-2} 56 ${60-waist/2} 68
          C${60-hip/2-3} 78 ${60-hip/2} 88 ${60-hip/2} 92
          L${60-hip/2+6} 92
          C${60-hip/2+6} 85 ${60-hip/2+3} 75 ${60-waist/2+3} 68
          C${60-waist/2+1} 56 ${60-bust/2+1} 48 ${60-bust/2} 38 Z`}
          fill={skinDark} fillOpacity="0.10"/>

        {/* Bust shaping */}
        <ellipse cx={`${60-bust/6}`} cy="52" rx={bust/8} ry={bust/10} fill={skinDark} fillOpacity="0.08"/>
        <ellipse cx={`${60+bust/6}`} cy="52" rx={bust/8} ry={bust/10} fill={skinDark} fillOpacity="0.08"/>

        {/* Left arm */}
        <path d={`M${60-bust/2+2} 42 C${60-bust/2-8} 52 ${60-bust/2-14} 66 ${60-bust/2-10} ${42+legLen*0.5}`}
          fill="none" stroke="url(#skinF)" strokeWidth={bodyType==="plus"?16:12} strokeLinecap="round"/>
        <path d={`M${60-bust/2+2} 42 C${60-bust/2-8} 52 ${60-bust/2-14} 66 ${60-bust/2-10} ${42+legLen*0.5}`}
          fill="none" stroke={skinDark} strokeWidth={bodyType==="plus"?16:12} strokeLinecap="round" strokeOpacity="0.12"/>

        {/* Right arm */}
        <path d={`M${60+bust/2-2} 42 C${60+bust/2+8} 52 ${60+bust/2+14} 66 ${60+bust/2+10} ${42+legLen*0.5}`}
          fill="none" stroke="url(#skinF)" strokeWidth={bodyType==="plus"?16:12} strokeLinecap="round"/>

        {/* Left leg */}
        <path d={`M${60-hip/2+6} 92 C${60-hip/2+4} ${92+legLen*0.45} ${60-16} ${92+legLen*0.75} ${60-14} ${92+legLen}`}
          fill="none" stroke="url(#skinF)" strokeWidth={bodyType==="plus"?20:16} strokeLinecap="round"/>
        <path d={`M${60-hip/2+6} 92 C${60-hip/2+4} ${92+legLen*0.45} ${60-16} ${92+legLen*0.75} ${60-14} ${92+legLen}`}
          fill="none" stroke={skinDark} strokeWidth={bodyType==="plus"?20:16} strokeLinecap="round" strokeOpacity="0.1"/>

        {/* Right leg */}
        <path d={`M${60+hip/2-6} 92 C${60+hip/2-4} ${92+legLen*0.45} ${60+16} ${92+legLen*0.75} ${60+14} ${92+legLen}`}
          fill="none" stroke="url(#skinF)" strokeWidth={bodyType==="plus"?20:16} strokeLinecap="round"/>

        {/* HEAD — no face, sphere-like */}
        <ellipse cx="60" cy="18" rx="15" ry="17"
          fill="url(#skinF)" stroke={skinDark} strokeWidth="0.5" strokeOpacity="0.3"/>
        {/* Head highlight */}
        <ellipse cx="55" cy="13" rx="6" ry="5" fill="white" fillOpacity="0.15"/>
      </svg>
    );
  }

  // Male proportions
  const shoulder = bodyType === "athletic" ? 68 : bodyType === "plus" ? 74 : bodyType === "slim" ? 54 : 62;
  const waistM   = bodyType === "athletic" ? 44 : bodyType === "plus" ? 66 : bodyType === "slim" ? 38 : 52;
  const hipM     = bodyType === "athletic" ? 58 : bodyType === "plus" ? 72 : bodyType === "slim" ? 48 : 58;
  const legLen   = isTall ? 132 : isShort ? 108 : 120;
  const totalH   = 52 + legLen;
  const vb       = `0 0 120 ${totalH + 10}`;

  return (
    <svg viewBox={vb} className="w-full h-full" fill="none">
      <defs>
        <radialGradient id="skinM" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={skin} stopOpacity="1"/>
          <stop offset="100%" stopColor={skinDark} stopOpacity="0.75"/>
        </radialGradient>
      </defs>

      {/* Neck */}
      <rect x="53" y="28" width="14" height="13" rx="2"
        fill="url(#skinM)" stroke={skinDark} strokeWidth="0.4" strokeOpacity="0.4"/>

      {/* Torso — trapezoid, broader shoulders */}
      <path d={`M${60-shoulder/2} 40
        C${60-shoulder/2-2} 50 ${60-waistM/2} 68 ${60-waistM/2} 80
        C${60-hipM/2-2} 85 ${60-hipM/2} 90 ${60-hipM/2} 94
        L${60+hipM/2} 94
        C${60+hipM/2} 90 ${60+hipM/2+2} 85 ${60+waistM/2} 80
        C${60+waistM/2} 68 ${60+shoulder/2+2} 50 ${60+shoulder/2} 40 Z`}
        fill="url(#skinM)" stroke={skinDark} strokeWidth="0.5" strokeOpacity="0.3"/>

      {/* Torso shadow side */}
      <path d={`M${60-shoulder/2} 40
        C${60-shoulder/2-2} 50 ${60-waistM/2} 68 ${60-waistM/2} 80
        C${60-hipM/2-2} 85 ${60-hipM/2} 90 ${60-hipM/2} 94
        L${60-hipM/2+8} 94
        C${60-hipM/2+8} 88 ${60-hipM/2+4} 82 ${60-waistM/2+4} 78
        C${60-waistM/2+4} 64 ${60-shoulder/2+4} 48 ${60-shoulder/2} 40 Z`}
        fill={skinDark} fillOpacity="0.12"/>

      {/* Chest muscles (for athletic) */}
      {bodyType === "athletic" && <>
        <ellipse cx={`${60-12}`} cy="54" rx="9" ry="7" fill={skinDark} fillOpacity="0.1"/>
        <ellipse cx={`${60+12}`} cy="54" rx="9" ry="7" fill={skinDark} fillOpacity="0.1"/>
        <line x1="60" y1="47" x2="60" y2="74" stroke={skinDark} strokeWidth="0.8" strokeOpacity="0.12"/>
      </>}

      {/* Left arm */}
      <path d={`M${60-shoulder/2+2} 44 C${60-shoulder/2-12} 58 ${60-shoulder/2-18} 74 ${60-shoulder/2-14} ${44+legLen*0.48}`}
        fill="none" stroke="url(#skinM)" strokeWidth={bodyType==="athletic"?18:bodyType==="plus"?20:15} strokeLinecap="round"/>
      <path d={`M${60-shoulder/2+2} 44 C${60-shoulder/2-12} 58 ${60-shoulder/2-18} 74 ${60-shoulder/2-14} ${44+legLen*0.48}`}
        fill="none" stroke={skinDark} strokeWidth={bodyType==="athletic"?18:bodyType==="plus"?20:15} strokeLinecap="round" strokeOpacity="0.12"/>

      {/* Right arm */}
      <path d={`M${60+shoulder/2-2} 44 C${60+shoulder/2+12} 58 ${60+shoulder/2+18} 74 ${60+shoulder/2+14} ${44+legLen*0.48}`}
        fill="none" stroke="url(#skinM)" strokeWidth={bodyType==="athletic"?18:bodyType==="plus"?20:15} strokeLinecap="round"/>

      {/* Left leg */}
      <path d={`M${60-hipM/2+5} 94 C${60-hipM/2+3} ${94+legLen*0.45} ${60-17} ${94+legLen*0.75} ${60-16} ${94+legLen}`}
        fill="none" stroke="url(#skinM)" strokeWidth={bodyType==="plus"?22:18} strokeLinecap="round"/>
      <path d={`M${60-hipM/2+5} 94 C${60-hipM/2+3} ${94+legLen*0.45} ${60-17} ${94+legLen*0.75} ${60-16} ${94+legLen}`}
        fill="none" stroke={skinDark} strokeWidth={bodyType==="plus"?22:18} strokeLinecap="round" strokeOpacity="0.1"/>

      {/* Right leg */}
      <path d={`M${60+hipM/2-5} 94 C${60+hipM/2-3} ${94+legLen*0.45} ${60+17} ${94+legLen*0.75} ${60+16} ${94+legLen}`}
        fill="none" stroke="url(#skinM)" strokeWidth={bodyType==="plus"?22:18} strokeLinecap="round"/>

      {/* HEAD */}
      <ellipse cx="60" cy="18" rx="16" ry="18"
        fill="url(#skinM)" stroke={skinDark} strokeWidth="0.5" strokeOpacity="0.3"/>
      <ellipse cx="55" cy="13" rx="6" ry="5" fill="white" fillOpacity="0.14"/>
    </svg>
  );
};

// ─────────────────────── SIDE MENU ───────────────────────
const SideMenu = ({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (v: SideView) => void }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const items: { id: SideView; label: string; icon: string }[] = [
    { id: "about", label: "О нас", icon: "Info" },
    { id: "partners", label: "Партнёрам", icon: "Handshake" },
    { id: "catalogs", label: "Каталоги", icon: "LayoutGrid" },
    { id: "ads", label: "Реклама", icon: "Megaphone" },
    { id: "stores", label: "Сети магазинов", icon: "Store" },
    { id: "contacts", label: "Контакты", icon: "Mail" },
    { id: "stylist-register", label: "Стать стилистом", icon: "Sparkles" },
    { id: "store-cabinet", label: "Кабинет магазина", icon: "ShoppingBag" },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm" onClick={onClose}/>}
      <div className={`fixed top-0 left-0 h-full z-50 w-72 bg-background border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div>
            <p className="font-display text-lg leading-tight">B & G — STYLE</p>
            <p className="text-[9px] tracking-[0.18em] text-muted-foreground uppercase mt-0.5">Boskh Project Studio</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded transition-colors">
            <Icon name="X" size={16}/>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {items.map(item => (
            <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-left hover:bg-secondary transition-colors group">
              <Icon name={item.icon as never} size={16} fallback="Circle" className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0"/>
              <span className="tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">© 2026 Boskh Project Studio</p>
        </div>
      </div>
    </>
  );
};

// ─────────────────────── SIDE PAGES ───────────────────────
const AboutPage = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4 gap-4">
      <button onClick={onBack}><Icon name="ArrowLeft" size={18}/></button>
      <span className="font-display text-base">О нас</span>
    </header>
    <div className="max-w-lg mx-auto px-6 py-10 space-y-8">
      <div>
        <p className="label-cap mb-3">Миссия</p>
        <h2 className="font-display text-4xl font-light leading-tight mb-4">Стиль доступен каждому</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">B & G — Style — платформа персонального подбора одежды на основе AI. Мы соединяем профессиональных стилистов, ведущие сети магазинов и технологии, чтобы каждый человек мог выглядеть безупречно.</p>
      </div>
      <div className="shimmer-line"/>
      <div>
        <p className="label-cap mb-4">Как это работает</p>
        {[
          ["01", "Создаёте профиль", "Указываете параметры тела, стиль жизни и предпочтения"],
          ["02", "AI анализирует", "Нейросеть, обученная профессиональными стилистами, формирует подборку"],
          ["03", "Выбираете образ", "Смотрите вещи в 3D, добавляете в корзину — доставка по России"],
        ].map(([n, t, d]) => (
          <div key={n} className="flex gap-4 mb-5">
            <span className="font-display text-3xl text-muted-foreground/30 leading-none mt-1 shrink-0 w-8">{n}</span>
            <div><p className="font-medium text-sm mb-0.5">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PartnersPage = ({ onBack, onStylist, onStore }: { onBack: () => void; onStylist: () => void; onStore: () => void }) => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4 gap-4">
      <button onClick={onBack}><Icon name="ArrowLeft" size={18}/></button>
      <span className="font-display text-base">Партнёрам</span>
    </header>
    <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
      <h2 className="font-display text-4xl font-light">Зарабатывайте вместе с нами</h2>
      <p className="text-sm text-muted-foreground">Три формата партнёрства — для магазинов, стилистов и сервисов доставки</p>
      {[
        { title: "Магазины одежды", desc: "Загружайте каталог, управляйте остатками, получайте заказы от AI-стилиста. Интеграция за 1 день.", cta: "Открыть кабинет", action: onStore },
        { title: "Профессиональные стилисты", desc: "Обучайте нейросеть, публикуйте образы со своей подписью, зарабатывайте на рекомендациях.", cta: "Стать стилистом", action: onStylist },
        { title: "Доставка", desc: "Яндекс Доставка и другие сервисы — интеграция API для быстрой доставки из любого магазина.", cta: "Обсудить интеграцию", action: () => {} },
      ].map(p => (
        <div key={p.title} className="border border-border p-6">
          <h3 className="font-display text-xl mb-2">{p.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
          <button onClick={p.action} className="btn-zara">{p.cta}</button>
        </div>
      ))}
    </div>
  </div>
);

const CatalogsPage = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4 gap-4">
      <button onClick={onBack}><Icon name="ArrowLeft" size={18}/></button>
      <span className="font-display text-base">Каталоги</span>
    </header>
    <div className="max-w-lg mx-auto px-6 py-10">
      <h2 className="font-display text-4xl font-light mb-2">Все коллекции</h2>
      <p className="text-sm text-muted-foreground mb-8">Актуальные каталоги партнёров — синхронизированы с остатками в реальном времени</p>
      <div className="space-y-3">
        {STORES.map(s => (
          <div key={s.name} className="flex items-center justify-between border border-border px-5 py-4 hover:bg-secondary transition-colors cursor-pointer">
            <div>
              <p className="font-medium text-sm">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.category} · {s.cities}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{s.items.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">товаров</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdsPage = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4 gap-4">
      <button onClick={onBack}><Icon name="ArrowLeft" size={18}/></button>
      <span className="font-display text-base">Реклама</span>
    </header>
    <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
      <h2 className="font-display text-4xl font-light">Рекламные форматы</h2>
      {[
        { title: "Баннер в каталоге", price: "от 5 000 ₽/нед", desc: "Статичный или анимированный баннер в ленте товаров. Охват — вся аудитория приложения." },
        { title: "Баннер стилиста", price: "от 3 000 ₽/нед", desc: "Рекомендация от конкретного стилиста с ссылкой на ваш профиль или магазин." },
        { title: "Спонсорский лук", price: "от 8 000 ₽/лук", desc: "Полный образ, собранный стилистом из ваших товаров с подписью бренда." },
        { title: "Push-уведомления", price: "от 2 000 ₽/кампания", desc: "Целевые уведомления пользователям по параметрам: город, размер, стиль." },
      ].map(f => (
        <div key={f.title} className="border border-border p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="font-medium">{f.title}</p>
            <p className="text-sm text-muted-foreground">{f.price}</p>
          </div>
          <p className="text-xs text-muted-foreground">{f.desc}</p>
        </div>
      ))}
      <button className="btn-zara w-full">Оставить заявку</button>
    </div>
  </div>
);

const StoresPage = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4 gap-4">
      <button onClick={onBack}><Icon name="ArrowLeft" size={18}/></button>
      <span className="font-display text-base">Сети магазинов</span>
    </header>
    <div className="max-w-lg mx-auto px-6 py-10">
      <h2 className="font-display text-4xl font-light mb-2">Партнёрские сети</h2>
      <p className="text-sm text-muted-foreground mb-8">Магазины, интегрированные в платформу B & G — Style</p>
      <div className="grid grid-cols-2 gap-3">
        {STORES.map(s => (
          <div key={s.name} className="border border-border p-4">
            <p className="font-display text-xl mb-1">{s.name}</p>
            <p className="text-xs text-muted-foreground mb-2">{s.category}</p>
            <p className="text-[10px] text-muted-foreground">{s.cities}</p>
            <p className="label-cap mt-2">{s.items.toLocaleString()} товаров</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactsPage = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 bg-background border-b border-border h-14 flex items-center px-4 gap-4">
      <button onClick={onBack}><Icon name="ArrowLeft" size={18}/></button>
      <span className="font-display text-base">Контакты</span>
    </header>
    <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
      <h2 className="font-display text-4xl font-light">Свяжитесь с нами</h2>
      {[
        { label: "Email", value: "hello@boskh.studio", icon: "Mail" },
        { label: "Telegram", value: "@boskh_style", icon: "MessageCircle" },
        { label: "Instagram", value: "@bg.style.official", icon: "Instagram" },
        { label: "Адрес", value: "Москва, Россия", icon: "MapPin" },
      ].map(c => (
        <div key={c.label} className="flex items-center gap-4 border-b border-border pb-5">
          <Icon name={c.icon as never} size={18} fallback="Circle" className="text-muted-foreground shrink-0"/>
          <div>
            <p className="label-cap mb-0.5">{c.label}</p>
            <p className="text-sm font-medium">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────── MAIN APP ───────────────────────
export default function Index() {
  const [onboarded, setOnboarded] = useState(false);
  const [onboardStep, setOnboardStep] = useState<OnboardStep>(1);
  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const [sideView, setSideView] = useState<SideView>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [viewer3D, setViewer3D] = useState<{ image: string; name: string } | null>(null);
  const [rerollCount, setRerollCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    gender: "female", bodyType: "average",
    firstName: "", lastName: "", city: "Москва", avatar: null,
    age: 28, height: 168, weight: 58, shoeSize: 38,
    hairColor: "Тёмно-русый", skinTone: "Светлая", zodiac: "Телец",
    phone: "", email: "",
  });

  const recSize = getSizeRecommendation(profile.weight, profile.gender);

  const catalogItems = CATALOG_ITEMS.filter(item => {
    const matchGender = item.gender === "both" || item.gender === profile.gender;
    const matchEvent  = !selectedEvent || item.events.includes(selectedEvent);
    const matchSearch = !catalogSearch || item.name.toLowerCase().includes(catalogSearch.toLowerCase()) || item.brand.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchGender && matchEvent && matchSearch && item.inStock;
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProfile(p => ({ ...p, avatar: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const toggleWishlist = (id: number) =>
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const statusColor = (s: string) => s === "Доставлен" ? "text-foreground" : s === "В пути" ? "text-muted-foreground" : "text-muted-foreground";
  const statusDot   = (s: string) => s === "Доставлен" ? "bg-foreground" : "bg-muted-foreground";

  // Side view routing
  if (sideView === "stylist-register") return <StylistRegister onBack={() => setSideView(null)}/>;
  if (sideView === "store-cabinet") return <StoreCabinet onBack={() => setSideView(null)}/>;
  if (sideView === "about") return <AboutPage onBack={() => setSideView(null)}/>;
  if (sideView === "partners") return <PartnersPage onBack={() => setSideView(null)} onStylist={() => setSideView("stylist-register")} onStore={() => setSideView("store-cabinet")}/>;
  if (sideView === "catalogs") return <CatalogsPage onBack={() => setSideView(null)}/>;
  if (sideView === "ads") return <AdsPage onBack={() => setSideView(null)}/>;
  if (sideView === "stores") return <StoresPage onBack={() => setSideView(null)}/>;
  if (sideView === "contacts") return <ContactsPage onBack={() => setSideView(null)}/>;

  // ── ONBOARDING ──
  if (!onboarded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <div className="flex flex-col items-center pt-8 pb-4">
          <p className="font-display text-2xl tracking-wide">B & G — STYLE</p>
          <p className="text-[9px] tracking-[0.2em] text-muted-foreground uppercase mt-0.5">Boskh Project Studio</p>
        </div>

        <div className="flex items-center gap-1.5 mb-6 px-8">
          {[1,2,3,4].map(s => (
            <div key={s} className="flex-1 h-px bg-border overflow-hidden">
              <div className={`h-full bg-foreground transition-all duration-500 ${onboardStep >= s ? "w-full" : "w-0"}`}/>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 max-w-lg mx-auto w-full">

          {/* STEP 1 */}
          {onboardStep === 1 && (
            <div className="animate-fade-in-up">
              <p className="label-cap mb-2 text-center">Шаг 1 из 4</p>
              <h2 className="font-display text-4xl font-light text-center mb-1">Ваш тип</h2>
              <p className="text-muted-foreground text-xs text-center mb-6">Для точного подбора одежды по фигуре</p>

              <p className="label-cap mb-3">Пол</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {(["female","male"] as Gender[]).map(g => (
                  <button key={g} onClick={() => setProfile(p => ({ ...p, gender: g }))}
                    className={`relative border-2 p-4 flex flex-col items-center gap-3 transition-all ${profile.gender === g ? "border-foreground bg-secondary" : "border-border hover:border-foreground/30"}`}>
                    <div className="w-20 h-32">
                      <Mannequin gender={g} bodyType={profile.bodyType} skinTone={profile.skinTone} height={profile.height} weight={profile.weight}/>
                    </div>
                    <span className="text-xs font-medium tracking-widest uppercase">{g === "female" ? "Женщина" : "Мужчина"}</span>
                    {profile.gender === g && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-foreground flex items-center justify-center">
                        <Icon name="Check" size={11} className="text-background"/>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <p className="label-cap mb-3">Телосложение</p>
              <div className="space-y-1.5 mb-8">
                {BODY_TYPES.map(bt => (
                  <button key={bt.id} onClick={() => setProfile(p => ({ ...p, bodyType: bt.id }))}
                    className={`w-full flex items-center gap-4 px-4 py-3 border transition-all text-left ${profile.bodyType === bt.id ? "border-foreground bg-secondary" : "border-border hover:border-foreground/20"}`}>
                    <div className="w-10 h-14 shrink-0">
                      <Mannequin gender={profile.gender} bodyType={bt.id} skinTone={profile.skinTone} height={profile.height} weight={profile.weight}/>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{bt.label}</p>
                      <p className="text-xs text-muted-foreground">{bt.desc}</p>
                    </div>
                    {profile.bodyType === bt.id && <Icon name="Check" size={14} className="ml-auto text-foreground"/>}
                  </button>
                ))}
              </div>

              <button onClick={() => setOnboardStep(2)} className="btn-zara w-full">
                Продолжить
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {onboardStep === 2 && (
            <div className="animate-fade-in-up">
              <p className="label-cap mb-2 text-center">Шаг 2 из 4</p>
              <h2 className="font-display text-4xl font-light text-center mb-1">О вас</h2>
              <p className="text-muted-foreground text-xs text-center mb-6">Имя, город и фото</p>

              <div className="flex flex-col items-center mb-6">
                <div onClick={() => fileRef.current?.click()}
                  className="relative w-24 h-24 rounded-full bg-secondary border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground transition-colors overflow-hidden group">
                  {profile.avatar
                    ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
                    : <div className="text-center">
                        <Icon name="Camera" size={22} className="text-muted-foreground group-hover:text-foreground mx-auto mb-1 transition-colors"/>
                        <span className="text-[9px] text-muted-foreground tracking-widest uppercase">Фото</span>
                      </div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload}/>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="label-cap mb-1.5">Имя</p>
                    <Input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                      placeholder="Анна" className="border-border bg-background focus-visible:ring-0 focus-visible:border-foreground rounded-none h-10"/>
                  </div>
                  <div>
                    <p className="label-cap mb-1.5">Фамилия</p>
                    <Input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                      placeholder="Соколова" className="border-border bg-background focus-visible:ring-0 focus-visible:border-foreground rounded-none h-10"/>
                  </div>
                </div>

                <div>
                  <p className="label-cap mb-2">Город</p>
                  <CityPicker value={profile.city} onChange={city => setProfile(p => ({ ...p, city }))}/>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setOnboardStep(1)} className="btn-ghost-zara flex-1">Назад</button>
                <button onClick={() => setOnboardStep(3)} disabled={!profile.firstName}
                  className="btn-zara flex-1 disabled:opacity-25">Продолжить</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {onboardStep === 3 && (
            <div className="animate-fade-in-up">
              <p className="label-cap mb-2 text-center">Шаг 3 из 4</p>
              <h2 className="font-display text-4xl font-light text-center mb-1">Параметры</h2>
              <p className="text-muted-foreground text-xs text-center mb-6">Для точного размера и подбора</p>

              <div className="space-y-5">
                {[
                  { key: "age" as const, label: "Возраст", min: 14, max: 80, unit: "лет" },
                  { key: "height" as const, label: "Рост", min: 145, max: 205, unit: "см" },
                  { key: "weight" as const, label: "Вес", min: 40, max: 140, unit: "кг" },
                  { key: "shoeSize" as const, label: "Размер обуви", min: 34, max: 47, unit: "" },
                ].map(({ key, label, min, max, unit }) => (
                  <div key={key} className="border border-border p-4">
                    <div className="flex justify-between text-xs mb-3">
                      <span className="text-muted-foreground tracking-widest uppercase">{label}</span>
                      <span className="font-medium">{profile[key]}{unit && ` ${unit}`}</span>
                    </div>
                    <Slider value={[profile[key]]} onValueChange={v => setProfile(p => ({ ...p, [key]: v[0] }))}
                      min={min} max={max} step={1}
                      className="[&_[role=slider]]:bg-foreground [&_[role=slider]]:border-foreground [&_[role=slider]]:rounded-none"/>
                  </div>
                ))}

                <div>
                  <p className="label-cap mb-2">Цвет волос</p>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map(h => (
                      <button key={h} onClick={() => setProfile(p=>({...p,hairColor:h}))}
                        className={`tag-pill ${profile.hairColor === h ? "active" : ""}`}>{h}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-cap mb-2">Оттенок кожи</p>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TONES.map(s => (
                      <button key={s} onClick={() => setProfile(p=>({...p,skinTone:s}))}
                        className={`flex items-center gap-1.5 tag-pill ${profile.skinTone === s ? "active" : ""}`}>
                        <span className="w-3 h-3 rounded-full inline-block shrink-0" style={{ background: SKIN_COLOR_MAP[s] }}/>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-cap mb-2">Знак зодиака</p>
                  <div className="flex flex-wrap gap-2">
                    {ZODIAC_SIGNS.map(z => (
                      <button key={z} onClick={() => setProfile(p=>({...p,zodiac:z}))}
                        className={`tag-pill ${profile.zodiac === z ? "active" : ""}`}>{z}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="label-cap mb-1.5">Телефон</p>
                    <Input value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}
                      placeholder="+7 (000) 000-00-00" className="border-border bg-background focus-visible:ring-0 focus-visible:border-foreground rounded-none h-10"/>
                  </div>
                  <div>
                    <p className="label-cap mb-1.5">Email</p>
                    <Input value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))}
                      type="email" placeholder="you@example.com" className="border-border bg-background focus-visible:ring-0 focus-visible:border-foreground rounded-none h-10"/>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setOnboardStep(2)} className="btn-ghost-zara flex-1">Назад</button>
                <button onClick={() => setOnboardStep(4)} className="btn-zara flex-1">Создать профиль</button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {onboardStep === 4 && (
            <div className="animate-fade-in-up text-center">
              <p className="label-cap mb-2">Профиль создан</p>
              <h2 className="font-display text-4xl font-light mb-6">
                {profile.firstName ? `Привет, ${profile.firstName}` : "Готово"}
              </h2>

              {/* Mannequin profile card */}
              <div className="relative mx-auto w-44 h-64 mb-6 border border-border bg-secondary flex items-end justify-center pb-4 px-6">
                <Mannequin gender={profile.gender} bodyType={profile.bodyType} skinTone={profile.skinTone} height={profile.height} weight={profile.weight}/>
                {profile.avatar && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-2 border-foreground overflow-hidden">
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 tracking-widest">
                  {recSize}
                </div>
              </div>

              <div className="text-left border border-border p-5 mb-5">
                <p className="font-display text-xl mb-3">{profile.firstName} {profile.lastName}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Город", profile.city], ["Возраст", `${profile.age} лет`],
                    ["Рост", `${profile.height} см`], ["Вес", `${profile.weight} кг`],
                    ["Обувь", `${profile.shoeSize} р.`], ["Кожа", profile.skinTone],
                    ["Волосы", profile.hairColor], ["Размер", recSize],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-secondary p-2">
                      <p className="label-cap">{l}</p>
                      <p className="font-medium mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setOnboarded(true)} className="btn-zara w-full text-sm tracking-widest">
                Подобрать образ
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN APP ──
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* 3D viewer modal */}
      {viewer3D && <ClothingViewer3D image={viewer3D.image} name={viewer3D.name} onClose={() => setViewer3D(null)}/>}

      {/* Side menu */}
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={setSideView}/>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center gap-4">
          {/* Burger */}
          <button onClick={() => setMenuOpen(true)} className="flex flex-col gap-[5px] p-1 hover:opacity-60 transition-opacity shrink-0">
            <span className="w-5 h-px bg-foreground"/>
            <span className="w-5 h-px bg-foreground"/>
            <span className="w-5 h-px bg-foreground"/>
          </button>

          {/* Logo */}
          <div className="flex-1 text-center">
            <p className="font-display text-base tracking-wide leading-none">B & G — STYLE</p>
            <p className="text-[8px] tracking-[0.16em] text-muted-foreground uppercase">Boskh Project Studio</p>
          </div>

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-5">
            {(["catalog","ai","profile","orders","saved"] as Tab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`nav-link ${activeTab === tab ? "text-foreground active" : "text-muted-foreground hover:text-foreground"}`}>
                {tab === "catalog" && "Каталог"}
                {tab === "ai" && "AI-стилист"}
                {tab === "profile" && "Профиль"}
                {tab === "orders" && "Заказы"}
                {tab === "saved" && "Избранное"}
              </button>
            ))}
          </div>

          {/* Avatar */}
          <button onClick={() => setActiveTab("profile")} className="w-8 h-8 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center hover:border-foreground transition-colors shrink-0">
            {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover"/> : <Icon name="User" size={15} className="text-muted-foreground"/>}
          </button>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto px-4 pb-24 md:pb-8">

        {/* ── CATALOG ── */}
        {activeTab === "catalog" && (
          <div className="animate-fade-in-up">
            <div className="pt-8 pb-5">
              <p className="label-cap mb-2">Персональный подбор</p>
              <h1 className="font-display text-4xl md:text-5xl font-light leading-tight mb-1">
                {selectedEvent ? EVENTS.find(e=>e.id===selectedEvent)?.label : "Выберите событие"}
              </h1>
              <p className="text-muted-foreground text-xs">{profile.city} · размер {recSize} · обувь {profile.shoeSize}</p>
            </div>

            {/* Events */}
            <div className="mb-5">
              <p className="label-cap mb-3">Куда идём?</p>
              <div className="flex gap-2 flex-wrap">
                {EVENTS.map(ev => (
                  <button key={ev.id} onClick={() => setSelectedEvent(selectedEvent === ev.id ? null : ev.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs transition-all ${selectedEvent === ev.id ? "border-foreground bg-secondary text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"}`}>
                    <span>{ev.icon}</span>{ev.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mb-4">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                placeholder="Поиск по названию или бренду..."
                className="pl-8 border-border bg-background h-9 text-sm focus-visible:ring-0 focus-visible:border-foreground rounded-none text-xs"/>
            </div>

            {selectedEvent && (
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <span className="text-xs text-muted-foreground">Размер <span className="text-foreground font-medium">{recSize}</span> · обувь <span className="text-foreground font-medium">{profile.shoeSize}</span></span>
                <button onClick={() => setRerollCount(c=>c+1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="RefreshCw" size={12}/>Обновить подборку
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {catalogItems.map((item, i) => (
                <div key={`${item.id}-${rerollCount}`} className="border border-border bg-card card-hover"
                  style={{ animation: `fade-in-up 0.4s ease ${i * 0.06}s both` }}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary cursor-pointer"
                    onClick={() => setViewer3D({ image: item.image, name: item.name })}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"/>
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-2 py-0.5 bg-foreground text-background tracking-widest uppercase">{tag}</span>
                      ))}
                    </div>
                    <button onClick={e => { e.stopPropagation(); toggleWishlist(item.id); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-background/80 flex items-center justify-center hover:scale-110 transition-transform">
                      <Icon name="Heart" size={13} className={wishlist.includes(item.id) ? "fill-foreground text-foreground" : "text-foreground"}/>
                    </button>
                    {/* 3D hint */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/70 px-2 py-0.5">
                      <Icon name="RotateCcw" size={10} className="text-muted-foreground"/>
                      <span className="text-[9px] text-muted-foreground tracking-widest">3D</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="label-cap mb-1">{item.store}</p>
                    <p className="text-xs font-medium leading-snug mb-2 line-clamp-2">{item.name}</p>
                    {item.stylist && (
                      <p className="text-[9px] text-muted-foreground mb-2 flex items-center gap-1">
                        <Icon name="Sparkles" size={9}/> Стилист: {item.stylist}
                      </p>
                    )}
                    <div className="flex gap-1 flex-wrap mb-2">
                      {item.sizes.map(s => (
                        <span key={s} className={`text-[9px] px-1.5 py-0.5 border ${s === recSize || s === String(profile.shoeSize) ? "border-foreground text-foreground bg-secondary" : "border-border text-muted-foreground"}`}>{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-medium">{item.price.toLocaleString()} ₽</span>
                        {item.oldPrice && <span className="text-[10px] text-muted-foreground line-through ml-1">{item.oldPrice.toLocaleString()}</span>}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Icon name="Star" size={10} className="fill-foreground text-foreground"/>
                        <span className="text-[10px] text-muted-foreground">{item.rating}</span>
                      </div>
                    </div>
                    <button className="btn-zara w-full h-8 text-[10px]">В корзину</button>
                  </div>
                </div>
              ))}
            </div>

            {catalogItems.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="SearchX" size={36} className="mx-auto mb-3 opacity-20"/>
                <p className="font-display text-2xl font-light">Ничего не найдено</p>
                <p className="text-xs mt-1">Попробуйте выбрать другое событие</p>
              </div>
            )}
          </div>
        )}

        {/* ── AI STYLIST ── */}
        {activeTab === "ai" && (
          <div className="animate-fade-in-up max-w-lg">
            <div className="pt-8 pb-6">
              <p className="label-cap mb-2">Умный подбор</p>
              <h1 className="font-display text-4xl font-light">AI‑стилист</h1>
              <p className="text-muted-foreground text-xs mt-1">Персональные рекомендации на основе вашего профиля</p>
            </div>

            <div className="border border-border p-5 mb-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-20 shrink-0">
                  <Mannequin gender={profile.gender} bodyType={profile.bodyType} skinTone={profile.skinTone} height={profile.height} weight={profile.weight}/>
                </div>
                <div>
                  <p className="font-medium text-sm">{profile.firstName || "Ваш профиль"}</p>
                  <p className="text-xs text-muted-foreground">Размер {recSize} · {BODY_TYPES.find(b=>b.id===profile.bodyType)?.label}</p>
                  <p className="text-xs text-muted-foreground">{profile.skinTone} кожа · {profile.hairColor} волосы</p>
                </div>
              </div>
              <div className="shimmer-line mb-4"/>
              <p className="label-cap mb-3">Выберите повод:</p>
              <div className="grid grid-cols-2 gap-2">
                {EVENTS.slice(0,6).map(ev => (
                  <button key={ev.id}
                    onClick={() => { setSelectedEvent(ev.id); setActiveTab("catalog"); }}
                    className="flex items-center gap-2 px-3 py-2.5 border border-border text-left hover:border-foreground transition-all group">
                    <span className="text-base">{ev.icon}</span>
                    <span className="text-xs group-hover:text-foreground text-muted-foreground transition-colors">{ev.label}</span>
                    <Icon name="ArrowRight" size={12} className="ml-auto text-muted-foreground group-hover:text-foreground transition-colors"/>
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-border p-4 flex items-start gap-3">
              <Icon name="Info" size={14} className="text-muted-foreground shrink-0 mt-0.5"/>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                AI подбирает вещи по вашему размеру <strong>{recSize}</strong> и телосложению. Подборка обновляется стилистами-партнёрами платформы.
              </p>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div className="animate-fade-in-up max-w-lg">
            <div className="pt-8 pb-6">
              <p className="label-cap mb-2">Личный кабинет</p>
              <h1 className="font-display text-4xl font-light">Мой профиль</h1>
            </div>

            <div className="border border-border p-6 mb-4">
              <div className="flex items-center gap-5 mb-5">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center">
                    {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover"/> : <Icon name="User" size={32} className="text-muted-foreground"/>}
                  </div>
                  <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-foreground flex items-center justify-center hover:opacity-70 transition-opacity">
                    <Icon name="Camera" size={12} className="text-background"/>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload}/>
                </div>
                <div>
                  <p className="font-display text-2xl font-light">{profile.firstName} {profile.lastName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{profile.email || "—"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Icon name="MapPin" size={10}/>{profile.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-secondary p-4">
                <div className="w-16 h-24 shrink-0">
                  <Mannequin gender={profile.gender} bodyType={profile.bodyType} skinTone={profile.skinTone} height={profile.height} weight={profile.weight}/>
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1 text-xs">
                  {[
                    ["Рост", `${profile.height} см`], ["Вес", `${profile.weight} кг`],
                    ["Возраст", `${profile.age} лет`], ["Обувь", `${profile.shoeSize} р.`],
                    ["Одежда", recSize], ["Зодиак", profile.zodiac],
                  ].map(([l,v]) => (
                    <div key={l}>
                      <span className="text-muted-foreground">{l}: </span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: "Package", label: "Заказов", value: "3" },
                { icon: "Heart", label: "Избранное", value: String(wishlist.length) },
                { icon: "Sparkles", label: "Подборок", value: "1" },
              ].map(s => (
                <div key={s.label} className="border border-border p-4 text-center">
                  <Icon name={s.icon as never} size={18} fallback="Star" className="mx-auto mb-1 text-muted-foreground"/>
                  <p className="font-display text-2xl font-light">{s.value}</p>
                  <p className="label-cap mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <button onClick={() => { setOnboarded(false); setOnboardStep(1); }}
              className="btn-ghost-zara w-full text-xs">
              Обновить профиль
            </button>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div className="animate-fade-in-up max-w-lg">
            <div className="pt-8 pb-6">
              <p className="label-cap mb-2">История покупок</p>
              <h1 className="font-display text-4xl font-light">Мои заказы</h1>
            </div>
            <div className="space-y-3">
              {ORDERS.map((order, i) => (
                <div key={order.id} className="border border-border p-5"
                  style={{ animation: `fade-in-up 0.4s ease ${i * 0.08}s both` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium">{order.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${statusColor(order.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(order.status)}`}/>
                      {order.status}
                    </div>
                  </div>
                  <div className="shimmer-line mb-3"/>
                  <div className="space-y-1 mb-3">
                    {order.items.map(item => (
                      <p key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                        <Icon name="Package2" size={11} className="shrink-0"/>{item}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{order.total.toLocaleString()} ₽</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">🚀 Яндекс Доставка</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SAVED ── */}
        {activeTab === "saved" && (
          <div className="animate-fade-in-up">
            <div className="pt-8 pb-6">
              <p className="label-cap mb-2">Мои сохранения</p>
              <h1 className="font-display text-4xl font-light">Избранное</h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATALOG_ITEMS.filter(i => wishlist.includes(i.id)).map(item => (
                <div key={item.id} className="border border-border bg-card">
                  <div className="aspect-square overflow-hidden bg-secondary cursor-pointer"
                    onClick={() => setViewer3D({ image: item.image, name: item.name })}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
                  </div>
                  <div className="p-3">
                    <p className="label-cap mb-0.5">{item.brand}</p>
                    <p className="text-xs font-medium line-clamp-2 mb-2">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.price.toLocaleString()} ₽</span>
                      <button onClick={() => toggleWishlist(item.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Icon name="X" size={13}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {wishlist.length === 0 && (
                <div className="col-span-2 md:col-span-4 text-center py-16 text-muted-foreground">
                  <Icon name="Heart" size={36} className="mx-auto mb-3 opacity-20"/>
                  <p className="font-display text-2xl font-light">Список пуст</p>
                  <p className="text-xs mt-1">Добавляйте вещи из каталога</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border">
        <div className="flex">
          {(["catalog","ai","profile","orders","saved"] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${activeTab === tab ? "text-foreground" : "text-muted-foreground"}`}>
              <Icon name={tab==="catalog"?"LayoutGrid":tab==="ai"?"Sparkles":tab==="profile"?"User":tab==="orders"?"Package":"Heart"} size={18} fallback="Circle"/>
              <span className="text-[8px] tracking-widest uppercase">
                {tab==="catalog"&&"Каталог"}{tab==="ai"&&"AI"}{tab==="profile"&&"Профиль"}{tab==="orders"&&"Заказы"}{tab==="saved"&&"Избранное"}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
