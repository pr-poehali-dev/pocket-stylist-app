import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// ─────────────────────── TYPES ───────────────────────
type Tab = "catalog" | "ai" | "profile" | "orders" | "saved" | "partners";
type Gender = "male" | "female";
type BodyType = "athletic" | "slim" | "average" | "curvy" | "plus";
type OnboardStep = 1 | 2 | 3 | 4; // 1=пол+телосложение, 2=имя+город+фото, 3=параметры, 4=результат

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

// ─────────────────────── DATA ───────────────────────
const CATALOG_ITEMS = [
  { id: 1, name: "Шерстяное пальто оверсайз", brand: "Zara", price: 12990, oldPrice: 17900, category: "Верхняя одежда", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/c4a1c0ba-ed27-4aaa-a323-95c938389c6c.jpg", tags: ["Тренд"], store: "Zara", inStock: true, rating: 4.8, sizes: ["XS","S","M","L"], events: ["театр","ужин","свидание"] },
  { id: 2, name: "Шёлковое платье-миди", brand: "H&M", price: 6499, oldPrice: null, category: "Платья", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/12aea226-dded-451f-af82-ceec84441516.jpg", tags: ["Бестселлер"], store: "H&M", inStock: true, rating: 4.6, sizes: ["XS","S","M","L","XL"], events: ["вечеринка","свидание","ужин"] },
  { id: 3, name: "Кожаные ботинки Chelsea", brand: "Mango", price: 9200, oldPrice: 12000, category: "Обувь", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/172d58c6-ad73-4e54-9b7a-b523408bf3b4.jpg", tags: ["Скидка"], store: "Mango", inStock: false, rating: 4.5, sizes: ["36","37","38","39","40"], events: ["офис","прогулка","театр"] },
  { id: 4, name: "Cashmere свитер базовый", brand: "Zara", price: 5990, oldPrice: null, category: "Джемперы", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/c4a1c0ba-ed27-4aaa-a323-95c938389c6c.jpg", tags: ["Новинка"], store: "Zara", inStock: true, rating: 4.9, sizes: ["XS","S","M","L","XL"], events: ["офис","прогулка","casual"] },
  { id: 5, name: "Широкие брюки с защипами", brand: "H&M", price: 3799, oldPrice: 4999, category: "Брюки", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/12aea226-dded-451f-af82-ceec84441516.jpg", tags: ["Скидка","Тренд"], store: "H&M", inStock: true, rating: 4.4, sizes: ["XS","S","M","L"], events: ["офис","ужин","театр"] },
  { id: 6, name: "Структурированный блейзер", brand: "Mango", price: 11500, oldPrice: null, category: "Пиджаки", image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/172d58c6-ad73-4e54-9b7a-b523408bf3b4.jpg", tags: ["Бестселлер"], store: "Mango", inStock: true, rating: 4.7, sizes: ["S","M","L","XL"], events: ["офис","презентация","ужин"] },
];

const BODY_TYPES: { id: BodyType; label: string; desc: string; icon: string }[] = [
  { id: "athletic", label: "Спортивное", desc: "Выраженный рельеф", icon: "⚡" },
  { id: "slim", label: "Подтянутое", desc: "Стройное, лёгкое", icon: "✦" },
  { id: "average", label: "Среднее", desc: "Стандартные пропорции", icon: "◎" },
  { id: "curvy", label: "Фигуристое", desc: "Женственные изгибы", icon: "❋" },
  { id: "plus", label: "Пышное", desc: "Роскошные формы", icon: "♛" },
];

const HAIR_COLORS = ["Чёрный", "Тёмно-русый", "Русый", "Светлый", "Рыжий", "Седой", "Окрашенный"];
const SKIN_TONES = ["Очень светлая", "Светлая", "Средняя", "Оливковая", "Смуглая", "Тёмная"];
const ZODIAC_SIGNS = ["Овен","Телец","Близнецы","Рак","Лев","Дева","Весы","Скорпион","Стрелец","Козерог","Водолей","Рыбы"];
const CITIES = ["Москва","Санкт-Петербург","Казань","Екатеринбург","Новосибирск","Нижний Новгород","Краснодар","Ростов-на-Дону"];

const EVENTS = [
  { id: "office", label: "Офис", icon: "💼", desc: "Деловой дресс-код" },
  { id: "theater", label: "Театр / опера", icon: "🎭", desc: "Smart casual / вечерний" },
  { id: "date", label: "Свидание", icon: "🌹", desc: "Романтичный образ" },
  { id: "party", label: "Вечеринка", icon: "🎉", desc: "Яркий и запоминающийся" },
  { id: "dinner", label: "Ужин в ресторане", icon: "🍷", desc: "Элегантный look" },
  { id: "casual", label: "Прогулка / casual", icon: "☕", desc: "Комфорт и стиль" },
  { id: "sport", label: "Активный отдых", icon: "🏃", desc: "Спортивный стиль" },
  { id: "wedding", label: "Свадьба / торжество", icon: "💍", desc: "Праздничный наряд" },
];

const PARTNERS = [
  { id: 1, type: "store", name: "Zara", desc: "Официальный партнёр каталога", logo: "👗", tag: "Магазин", color: "from-zinc-800 to-zinc-900" },
  { id: 2, type: "store", name: "H&M", desc: "Интеграция с реальным каталогом", logo: "🛍", tag: "Магазин", color: "from-red-900/40 to-zinc-900" },
  { id: 3, type: "store", name: "Mango", desc: "Актуальные коллекции и скидки", logo: "✦", tag: "Магазин", color: "from-amber-900/30 to-zinc-900" },
  { id: 4, type: "stylist", name: "Анна Белова", desc: "Персональный стилист, 8 лет опыта. Обучает AI-модель.", logo: "👩‍🎨", tag: "Стилист", color: "from-purple-900/30 to-zinc-900" },
  { id: 5, type: "stylist", name: "Дмитрий Ковалёв", desc: "Мужской стиль и бизнес-образы", logo: "🧑‍💼", tag: "Стилист", color: "from-blue-900/30 to-zinc-900" },
  { id: 6, type: "delivery", name: "Яндекс Доставка", desc: "Быстрая доставка из магазинов за 2 часа", logo: "🚀", tag: "Доставка", color: "from-yellow-900/40 to-zinc-900" },
];

const ORDERS = [
  { id: "#VST-4821", date: "12 апр 2026", items: ["Шерстяное пальто оверсайз"], status: "Доставлен", total: 12990 },
  { id: "#VST-4719", date: "3 апр 2026", items: ["Шёлковое платье-миди", "Cashmere свитер"], status: "В пути", total: 12489 },
  { id: "#VST-4601", date: "22 мар 2026", items: ["Широкие брюки с защипами"], status: "Обрабатывается", total: 3799 },
];

// ─────────────────────── SILHOUETTES ───────────────────────
const MaleSilhouette = ({ bodyType }: { bodyType: BodyType }) => {
  const w = bodyType === "athletic" ? 52 : bodyType === "plus" ? 72 : bodyType === "slim" ? 44 : 58;
  const shoulder = bodyType === "athletic" ? 64 : bodyType === "plus" ? 72 : 58;
  return (
    <svg viewBox="0 0 120 240" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="bodyGradM" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(42,65%,62%)" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="hsl(42,65%,40%)" stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="outlineM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(42,65%,75%)"/>
          <stop offset="100%" stopColor="hsl(42,65%,45%)"/>
        </linearGradient>
      </defs>
      {/* Head */}
      <ellipse cx="60" cy="22" rx="16" ry="19" fill="url(#bodyGradM)" stroke="url(#outlineM)" strokeWidth="1.5"/>
      {/* Neck */}
      <rect x="54" y="38" width="12" height="10" rx="3" fill="url(#bodyGradM)" stroke="url(#outlineM)" strokeWidth="1"/>
      {/* Torso */}
      <path d={`M${60-shoulder/2} 48 Q${60-shoulder/2-4} 52 ${60-w/2} 110 Q60 116 ${60+w/2} 110 Q${60+shoulder/2+4} 52 ${60+shoulder/2} 48 Z`}
        fill="url(#bodyGradM)" stroke="url(#outlineM)" strokeWidth="1.5"/>
      {/* Left arm */}
      <path d={`M${60-shoulder/2} 52 Q${60-shoulder/2-14} 80 ${60-shoulder/2-10} 130`}
        stroke="url(#outlineM)" strokeWidth={bodyType==="athletic"?14:11} strokeLinecap="round" fill="none"/>
      {/* Right arm */}
      <path d={`M${60+shoulder/2} 52 Q${60+shoulder/2+14} 80 ${60+shoulder/2+10} 130`}
        stroke="url(#outlineM)" strokeWidth={bodyType==="athletic"?14:11} strokeLinecap="round" fill="none"/>
      {/* Legs */}
      <path d={`M${60-w/2+6} 110 Q${60-w/4} 160 ${60-14} 235`}
        stroke="url(#outlineM)" strokeWidth={bodyType==="plus"?18:14} strokeLinecap="round" fill="none"/>
      <path d={`M${60+w/2-6} 110 Q${60+w/4} 160 ${60+14} 235`}
        stroke="url(#outlineM)" strokeWidth={bodyType==="plus"?18:14} strokeLinecap="round" fill="none"/>
    </svg>
  );
};

const FemaleSilhouette = ({ bodyType }: { bodyType: BodyType }) => {
  const bust = bodyType === "curvy" || bodyType === "plus" ? 60 : 50;
  const waist = bodyType === "curvy" ? 38 : bodyType === "plus" ? 56 : bodyType === "slim" ? 30 : 42;
  const hip = bodyType === "curvy" ? 68 : bodyType === "plus" ? 78 : bodyType === "slim" ? 44 : 58;
  return (
    <svg viewBox="0 0 120 240" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="bodyGradF" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(42,65%,62%)" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="hsl(320,40%,50%)" stopOpacity="0.1"/>
        </linearGradient>
        <linearGradient id="outlineF" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(42,65%,75%)"/>
          <stop offset="100%" stopColor="hsl(320,50%,60%)"/>
        </linearGradient>
      </defs>
      {/* Head */}
      <ellipse cx="60" cy="21" rx="15" ry="18" fill="url(#bodyGradF)" stroke="url(#outlineF)" strokeWidth="1.5"/>
      {/* Hair */}
      <path d={`M46 16 Q44 6 52 4 Q60 2 68 4 Q76 6 74 16`} stroke="url(#outlineF)" strokeWidth="2" fill="url(#bodyGradF)"/>
      {/* Neck */}
      <rect x="55" y="37" width="10" height="9" rx="3" fill="url(#bodyGradF)" stroke="url(#outlineF)" strokeWidth="1"/>
      {/* Torso - hourglass */}
      <path d={`M${60-bust/2} 46 Q${60-bust/2-2} 60 ${60-waist/2} 82 Q${60-hip/2-4} 100 ${60-hip/2} 115 L${60+hip/2} 115 Q${60+hip/2+4} 100 ${60+waist/2} 82 Q${60+bust/2+2} 60 ${60+bust/2} 46 Z`}
        fill="url(#bodyGradF)" stroke="url(#outlineF)" strokeWidth="1.5"/>
      {/* Left arm */}
      <path d={`M${60-bust/2} 52 Q${60-bust/2-12} 76 ${60-bust/2-8} 122`}
        stroke="url(#outlineF)" strokeWidth="10" strokeLinecap="round" fill="none"/>
      {/* Right arm */}
      <path d={`M${60+bust/2} 52 Q${60+bust/2+12} 76 ${60+bust/2+8} 122`}
        stroke="url(#outlineF)" strokeWidth="10" strokeLinecap="round" fill="none"/>
      {/* Skirt / legs */}
      <path d={`M${60-hip/2} 115 Q${60-hip/2-4} 150 ${60-18} 235`}
        stroke="url(#outlineF)" strokeWidth="16" strokeLinecap="round" fill="none"/>
      <path d={`M${60+hip/2} 115 Q${60+hip/2+4} 150 ${60+18} 235`}
        stroke="url(#outlineF)" strokeWidth="16" strokeLinecap="round" fill="none"/>
    </svg>
  );
};

// ─────────────────────── SIZE CHART ───────────────────────
function getSizeRecommendation(height: number, weight: number, gender: Gender): string {
  if (gender === "female") {
    if (weight < 50) return "XS";
    if (weight < 57) return "S";
    if (weight < 67) return "M";
    if (weight < 78) return "L";
    return "XL";
  } else {
    if (weight < 60) return "XS";
    if (weight < 70) return "S";
    if (weight < 82) return "M";
    if (weight < 96) return "L";
    return "XL";
  }
}

// ─────────────────────── MAIN APP ───────────────────────
export default function Index() {
  const [onboarded, setOnboarded] = useState(false);
  const [onboardStep, setOnboardStep] = useState<OnboardStep>(1);
  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [rerollCount, setRerollCount] = useState(0);
  const [regionOpen, setRegionOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile>({
    gender: "female",
    bodyType: "average",
    firstName: "",
    lastName: "",
    city: "Москва",
    avatar: null,
    age: 28,
    height: 168,
    weight: 58,
    shoeSize: 38,
    hairColor: "Тёмно-русый",
    skinTone: "Светлая",
    zodiac: "Телец",
    phone: "",
    email: "",
  });

  const recSize = getSizeRecommendation(profile.height, profile.weight, profile.gender);

  const catalogItems = CATALOG_ITEMS.filter(item => {
    const matchEvent = !selectedEvent || item.events.includes(selectedEvent);
    const matchSearch = !catalogSearch ||
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.brand.toLowerCase().includes(catalogSearch.toLowerCase());
    const hasSize = item.sizes.some(s =>
      s === recSize ||
      (item.category === "Обувь" && s === String(profile.shoeSize))
    );
    return matchEvent && matchSearch && (selectedEvent ? hasSize : true);
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

  const statusColor = (s: string) => s === "Доставлен" ? "text-emerald-400" : s === "В пути" ? "text-gold" : "text-muted-foreground";
  const statusDot = (s: string) => s === "Доставлен" ? "bg-emerald-400" : s === "В пути" ? "bg-yellow-400" : "bg-muted-foreground";

  // ── ONBOARDING ──
  if (!onboarded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Top logo */}
        <div className="flex items-center justify-center pt-8 pb-4 gap-2">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
            <span className="text-xs font-display font-semibold text-background">V</span>
          </div>
          <span className="font-display text-xl tracking-[0.15em]">VESTIS</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6 px-8">
          {[1,2,3,4].map(s => (
            <div key={s} className="flex-1 h-0.5 rounded-full overflow-hidden bg-border">
              <div className={`h-full rounded-full transition-all duration-500 bg-gold ${onboardStep >= s ? "w-full" : "w-0"}`}/>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 max-w-lg mx-auto w-full">

          {/* STEP 1: Пол + телосложение */}
          {onboardStep === 1 && (
            <div className="animate-fade-in-up">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2 text-center">Шаг 1 из 4</p>
              <h2 className="font-display text-3xl font-light text-center mb-1">Ваш тип</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Это поможет подобрать одежду точно по фигуре</p>

              {/* Gender */}
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Пол</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {(["female","male"] as Gender[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setProfile(p => ({ ...p, gender: g }))}
                    className={`relative rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${profile.gender === g ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"}`}
                  >
                    <div className="w-20 h-28">
                      {g === "female"
                        ? <FemaleSilhouette bodyType={profile.bodyType} />
                        : <MaleSilhouette bodyType={profile.bodyType} />
                      }
                    </div>
                    <span className="text-sm font-medium">{g === "female" ? "Женщина" : "Мужчина"}</span>
                    {profile.gender === g && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                        <Icon name="Check" size={11} className="text-background"/>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Body type */}
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Телосложение</p>
              <div className="space-y-2 mb-8">
                {BODY_TYPES.map(bt => (
                  <button
                    key={bt.id}
                    onClick={() => setProfile(p => ({ ...p, bodyType: bt.id }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${profile.bodyType === bt.id ? "border-gold bg-gold/5 text-foreground" : "border-border hover:border-gold/30 text-muted-foreground"}`}
                  >
                    <span className="text-xl w-7 text-center">{bt.icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${profile.bodyType === bt.id ? "text-gold" : ""}`}>{bt.label}</p>
                      <p className="text-xs text-muted-foreground">{bt.desc}</p>
                    </div>
                    {profile.bodyType === bt.id && <Icon name="Check" size={15} className="ml-auto text-gold"/>}
                  </button>
                ))}
              </div>

              <Button onClick={() => setOnboardStep(2)} className="w-full h-12 bg-gold text-background hover:bg-gold/80 font-medium">
                Продолжить
                <Icon name="ArrowRight" size={16} className="ml-2"/>
              </Button>
            </div>
          )}

          {/* STEP 2: Имя + город + фото */}
          {onboardStep === 2 && (
            <div className="animate-fade-in-up">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2 text-center">Шаг 2 из 4</p>
              <h2 className="font-display text-3xl font-light text-center mb-1">О вас</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Имя, город и фото для персонального профиля</p>

              {/* Avatar upload */}
              <div className="flex flex-col items-center mb-6">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-gold/40 flex items-center justify-center cursor-pointer hover:border-gold transition-colors overflow-hidden group"
                >
                  {profile.avatar
                    ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
                    : <div className="text-center">
                        <Icon name="Camera" size={24} className="text-gold/50 group-hover:text-gold mx-auto mb-1 transition-colors"/>
                        <span className="text-[10px] text-muted-foreground">Добавить фото</span>
                      </div>
                  }
                  {profile.avatar && (
                    <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Icon name="Camera" size={20} className="text-gold"/>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload}/>
                <p className="text-xs text-muted-foreground mt-2">Нажмите, чтобы загрузить</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Имя</label>
                    <Input
                      value={profile.firstName}
                      onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                      placeholder="Анна"
                      className="bg-card border-border focus-visible:ring-gold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Фамилия</label>
                    <Input
                      value={profile.lastName}
                      onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                      placeholder="Соколова"
                      className="bg-card border-border focus-visible:ring-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Город</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CITIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setProfile(p => ({ ...p, city: c }))}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all text-left ${profile.city === c ? "border-gold text-gold bg-gold/5" : "border-border text-muted-foreground hover:border-gold/30"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setOnboardStep(1)} className="flex-1 border-border text-muted-foreground hover:text-foreground">
                  <Icon name="ArrowLeft" size={16} className="mr-2"/>Назад
                </Button>
                <Button
                  onClick={() => setOnboardStep(3)}
                  disabled={!profile.firstName}
                  className="flex-1 h-12 bg-gold text-background hover:bg-gold/80 disabled:opacity-30"
                >
                  Продолжить<Icon name="ArrowRight" size={16} className="ml-2"/>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Параметры */}
          {onboardStep === 3 && (
            <div className="animate-fade-in-up">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2 text-center">Шаг 3 из 4</p>
              <h2 className="font-display text-3xl font-light text-center mb-1">Параметры</h2>
              <p className="text-muted-foreground text-sm text-center mb-6">Помогут точно подобрать размер</p>

              <div className="space-y-5">
                {/* Age */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Возраст</span>
                    <span className="text-gold font-semibold">{profile.age} лет</span>
                  </div>
                  <Slider value={[profile.age]} onValueChange={v => setProfile(p=>({...p,age:v[0]}))} min={14} max={80} step={1} className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"/>
                </div>

                {/* Height */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Рост</span>
                    <span className="text-gold font-semibold">{profile.height} см</span>
                  </div>
                  <Slider value={[profile.height]} onValueChange={v => setProfile(p=>({...p,height:v[0]}))} min={150} max={200} step={1} className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"/>
                </div>

                {/* Weight */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Вес</span>
                    <span className="text-gold font-semibold">{profile.weight} кг</span>
                  </div>
                  <Slider value={[profile.weight]} onValueChange={v => setProfile(p=>({...p,weight:v[0]}))} min={40} max={130} step={1} className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"/>
                </div>

                {/* Shoe size */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Размер обуви</span>
                    <span className="text-gold font-semibold">{profile.shoeSize}</span>
                  </div>
                  <Slider value={[profile.shoeSize]} onValueChange={v => setProfile(p=>({...p,shoeSize:v[0]}))} min={34} max={47} step={1} className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"/>
                </div>

                {/* Hair color */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Цвет волос</p>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map(h => (
                      <button key={h} onClick={() => setProfile(p=>({...p,hairColor:h}))}
                        className={`tag-pill ${profile.hairColor === h ? "active" : ""}`}>{h}</button>
                    ))}
                  </div>
                </div>

                {/* Skin tone */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Оттенок кожи</p>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TONES.map(s => (
                      <button key={s} onClick={() => setProfile(p=>({...p,skinTone:s}))}
                        className={`tag-pill ${profile.skinTone === s ? "active" : ""}`}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Zodiac */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Знак зодиака</p>
                  <div className="flex flex-wrap gap-2">
                    {ZODIAC_SIGNS.map(z => (
                      <button key={z} onClick={() => setProfile(p=>({...p,zodiac:z}))}
                        className={`tag-pill ${profile.zodiac === z ? "active" : ""}`}>{z}</button>
                    ))}
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Номер телефона</label>
                    <Input value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))}
                      placeholder="+7 (___) ___-__-__" className="bg-card border-border focus-visible:ring-gold"/>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                    <Input value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))}
                      type="email" placeholder="you@example.com" className="bg-card border-border focus-visible:ring-gold"/>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setOnboardStep(2)} className="flex-1 border-border text-muted-foreground hover:text-foreground">
                  <Icon name="ArrowLeft" size={16} className="mr-2"/>Назад
                </Button>
                <Button onClick={() => setOnboardStep(4)} className="flex-1 h-12 bg-gold text-background hover:bg-gold/80">
                  Создать профиль<Icon name="ArrowRight" size={16} className="ml-2"/>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Результат / визуальный профиль */}
          {onboardStep === 4 && (
            <div className="animate-fade-in-up text-center">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Профиль создан</p>
              <h2 className="font-display text-3xl font-light mb-6">
                {profile.firstName ? `Привет, ${profile.firstName}!` : "Ваш профиль готов"}
              </h2>

              {/* Visual avatar */}
              <div className="relative mx-auto w-48 h-64 mb-6">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-gold/10 to-gold/5 border border-gold/20"/>
                <div className="absolute inset-0 flex items-end justify-center pb-6 px-8">
                  {profile.gender === "female"
                    ? <FemaleSilhouette bodyType={profile.bodyType}/>
                    : <MaleSilhouette bodyType={profile.bodyType}/>
                  }
                </div>
                {/* Avatar photo overlay top-center */}
                {profile.avatar && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-gold overflow-hidden">
                    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
                  </div>
                )}
                {!profile.avatar && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-gold/40 bg-secondary flex items-center justify-center">
                    <Icon name="User" size={24} className="text-muted-foreground"/>
                  </div>
                )}
                {/* Size badge */}
                <div className="absolute bottom-2 right-2 bg-gold text-background text-xs font-bold px-2 py-1 rounded-full">
                  {recSize}
                </div>
              </div>

              {/* Profile summary */}
              <div className="text-left bg-card rounded-2xl border border-border p-5 mb-4 space-y-2">
                <p className="font-display text-xl font-light mb-3">{profile.firstName} {profile.lastName}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Город", profile.city],
                    ["Возраст", `${profile.age} лет`],
                    ["Рост / Вес", `${profile.height} см / ${profile.weight} кг`],
                    ["Обувь", `${profile.shoeSize} р.`],
                    ["Волосы", profile.hairColor],
                    ["Кожа", profile.skinTone],
                    ["Зодиак", profile.zodiac],
                    ["Размер одежды", recSize],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-secondary rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setOnboarded(true)}
                className="w-full h-12 bg-gold text-background hover:bg-gold/80 font-medium text-base ai-glow"
              >
                <Icon name="Sparkles" size={18} className="mr-2"/>
                Подобрать образ
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN APP ──
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-screen-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <span className="text-xs font-display font-semibold text-background">V</span>
            </div>
            <span className="font-display text-xl tracking-[0.15em]">VESTIS</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {(["catalog","ai","profile","orders","saved","partners"] as Tab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`nav-link text-sm tracking-wide transition-colors ${activeTab === tab ? "text-gold active" : "text-muted-foreground hover:text-foreground"}`}>
                {tab === "catalog" && "Каталог"}
                {tab === "ai" && "AI-стилист"}
                {tab === "profile" && "Профиль"}
                {tab === "orders" && "Заказы"}
                {tab === "saved" && "Избранное"}
                {tab === "partners" && "Партнёры"}
              </button>
            ))}
          </div>

          {/* Avatar chip */}
          <button onClick={() => setActiveTab("profile")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-secondary border border-gold/40 overflow-hidden flex items-center justify-center">
              {profile.avatar
                ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover"/>
                : <Icon name="User" size={16} className="text-muted-foreground"/>
              }
            </div>
            <span className="text-sm text-muted-foreground hidden sm:block">{profile.firstName || "Профиль"}</span>
          </button>
        </div>
      </header>

      <main className="max-w-screen-lg mx-auto px-4 pb-24 md:pb-8">

        {/* ── CATALOG ── */}
        {activeTab === "catalog" && (
          <div className="animate-fade-in-up">
            <div className="pt-8 pb-5">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Персональный каталог</p>
              <h1 className="font-display text-4xl md:text-5xl font-light leading-tight mb-1">
                {selectedEvent
                  ? `Образы для: ${EVENTS.find(e=>e.id===selectedEvent)?.label}`
                  : "Выберите событие"
                }
              </h1>
              <p className="text-muted-foreground text-sm">
                {profile.city} · размер {recSize} · обувь {profile.shoeSize}
              </p>
            </div>

            {/* Event selector */}
            <div className="mb-5">
              <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">Куда идём?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EVENTS.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(selectedEvent === ev.id ? null : ev.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${selectedEvent === ev.id ? "border-gold bg-gold/5 text-gold" : "border-border text-muted-foreground hover:border-gold/30"}`}
                  >
                    <span className="text-base">{ev.icon}</span>
                    <div>
                      <p className={`text-xs font-medium ${selectedEvent === ev.id ? "text-gold" : "text-foreground"}`}>{ev.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-5">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
              <Input value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                placeholder="Поиск по названию, бренду..."
                className="pl-9 bg-card border-border h-10 text-sm focus-visible:ring-gold"/>
            </div>

            {/* Reroll */}
            {selectedEvent && (
              <div className="flex items-center justify-between mb-4 bg-card rounded-xl border border-gold/20 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon name="Sparkles" size={14} className="text-gold"/>
                  <span className="text-sm text-muted-foreground">Подбор по размеру <span className="text-gold font-medium">{recSize}</span></span>
                </div>
                <button
                  onClick={() => setRerollCount(c => c+1)}
                  className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/70 transition-colors"
                >
                  <Icon name="RefreshCw" size={13}/>
                  Другие варианты
                </button>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {catalogItems.map((item, i) => (
                <div key={`${item.id}-${rerollCount}`} className="bg-card rounded-2xl overflow-hidden card-hover border border-border"
                  style={{ animation: `fade-in-up 0.5s ease ${i * 0.07}s both` }}>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"/>
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gold/90 text-background font-medium">{tag}</span>
                      ))}
                    </div>
                    <button onClick={() => toggleWishlist(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/60 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
                      <Icon name="Heart" size={15} className={wishlist.includes(item.id) ? "fill-yellow-500 text-yellow-500" : "text-foreground"}/>
                    </button>
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">Нет в наличии</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-gold tracking-widest uppercase mb-1">{item.store}</p>
                    <p className="text-sm font-medium leading-snug mb-2 line-clamp-2">{item.name}</p>
                    {/* Size badges */}
                    <div className="flex gap-1 flex-wrap mb-2">
                      {item.sizes.map(s => (
                        <span key={s} className={`text-[10px] px-1.5 py-0.5 rounded border ${s === recSize || s === String(profile.shoeSize) ? "border-gold text-gold bg-gold/10" : "border-border text-muted-foreground"}`}>{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-semibold">{item.price.toLocaleString()} ₽</span>
                        {item.oldPrice && <span className="text-xs text-muted-foreground line-through ml-1.5">{item.oldPrice.toLocaleString()}</span>}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Icon name="Star" size={11} className="fill-yellow-500 text-yellow-500"/>
                        <span className="text-xs text-muted-foreground">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <Button size="sm" disabled={!item.inStock} className="w-full h-8 text-xs bg-gold text-background hover:bg-gold/80 disabled:opacity-30">
                      {item.inStock ? "В корзину" : "Уведомить"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {catalogItems.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="SearchX" size={40} className="mx-auto mb-3 opacity-30"/>
                <p className="font-display text-xl">Ничего не найдено</p>
                <p className="text-sm mt-1">Попробуйте выбрать другое событие</p>
              </div>
            )}
          </div>
        )}

        {/* ── AI STYLIST ── */}
        {activeTab === "ai" && (
          <div className="animate-fade-in-up max-w-lg">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Умный подбор</p>
              <h1 className="font-display text-4xl font-light">AI‑стилист</h1>
              <p className="text-muted-foreground text-sm mt-1">Персональные рекомендации на основе вашего профиля</p>
            </div>

            <div className="bg-card rounded-2xl border border-gold/20 p-5 mb-5 ai-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-gold/30 shrink-0">
                  {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover"/> : <Icon name="User" size={20} className="text-muted-foreground"/>}
                </div>
                <div>
                  <p className="font-medium">{profile.firstName || "Вы"}</p>
                  <p className="text-xs text-muted-foreground">Размер {recSize} · {BODY_TYPES.find(b=>b.id===profile.bodyType)?.label} телосложение</p>
                </div>
              </div>
              <div className="shimmer-line mb-4"/>
              <p className="text-sm text-muted-foreground mb-3">Выберите событие для автоматического подбора:</p>
              <div className="grid grid-cols-2 gap-2">
                {EVENTS.slice(0,6).map(ev => (
                  <button key={ev.id}
                    onClick={() => { setSelectedEvent(ev.id); setActiveTab("catalog"); }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border text-left hover:border-gold/50 transition-all group">
                    <span className="text-base">{ev.icon}</span>
                    <div>
                      <p className="text-xs font-medium group-hover:text-gold transition-colors">{ev.label}</p>
                      <p className="text-[10px] text-muted-foreground">{ev.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <Icon name="Info" size={16} className="text-gold shrink-0"/>
              <p className="text-xs text-muted-foreground">
                AI подбирает вещи по вашему размеру <span className="text-gold">{recSize}</span>, обуви <span className="text-gold">{profile.shoeSize}</span> и телосложению из каталогов Zara, H&M и Mango
              </p>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === "profile" && (
          <div className="animate-fade-in-up max-w-lg">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Личный кабинет</p>
              <h1 className="font-display text-4xl font-light">Мой профиль</h1>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border mb-4">
              <div className="flex items-center gap-5 mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-secondary border-2 border-gold/40 overflow-hidden flex items-center justify-center">
                    {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover"/> : <Icon name="User" size={36} className="text-muted-foreground"/>}
                  </div>
                  <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold flex items-center justify-center hover:bg-gold/80 transition-colors">
                    <Icon name="Camera" size={13} className="text-background"/>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload}/>
                </div>
                <div>
                  <p className="font-display text-2xl font-light">{profile.firstName} {profile.lastName}</p>
                  <p className="text-sm text-muted-foreground">{profile.email || "email не указан"}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-gold flex items-center gap-1"><Icon name="MapPin" size={11}/>{profile.city}</p>
                    <p className="text-xs text-muted-foreground">{profile.zodiac}</p>
                  </div>
                </div>
              </div>

              {/* Mini silhouette */}
              <div className="flex items-center gap-4 bg-secondary rounded-xl p-4">
                <div className="w-16 h-24 shrink-0">
                  {profile.gender === "female" ? <FemaleSilhouette bodyType={profile.bodyType}/> : <MaleSilhouette bodyType={profile.bodyType}/>}
                </div>
                <div className="grid grid-cols-2 gap-2 flex-1 text-xs">
                  {[
                    ["Рост", `${profile.height} см`],
                    ["Вес", `${profile.weight} кг`],
                    ["Возраст", `${profile.age} лет`],
                    ["Обувь", `${profile.shoeSize} р.`],
                    ["Одежда", recSize],
                    ["Кожа", profile.skinTone],
                  ].map(([l,v]) => (
                    <div key={l}>
                      <span className="text-muted-foreground">{l}: </span>
                      <span className="text-foreground font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: "Package", label: "Заказов", value: "3" },
                { icon: "Heart", label: "В избранном", value: String(wishlist.length) },
                { icon: "Sparkles", label: "Подборок", value: "1" },
              ].map(s => (
                <div key={s.label} className="bg-card rounded-xl p-4 border border-border text-center">
                  <Icon name={s.icon as never} size={20} fallback="Star" className="mx-auto mb-1 text-gold"/>
                  <p className="font-display text-2xl font-light">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={() => { setOnboarded(false); setOnboardStep(1); }}
              className="w-full border-border text-muted-foreground hover:text-foreground text-sm">
              <Icon name="RefreshCw" size={13} className="mr-2"/>
              Обновить профиль
            </Button>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === "orders" && (
          <div className="animate-fade-in-up max-w-lg">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">История покупок</p>
              <h1 className="font-display text-4xl font-light">Мои заказы</h1>
            </div>
            <div className="space-y-3">
              {ORDERS.map((order, i) => (
                <div key={order.id} className="bg-card rounded-2xl p-5 border border-border card-hover"
                  style={{ animation: `fade-in-up 0.5s ease ${i * 0.1}s both` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
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
                      <p key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Icon name="Package2" size={12} className="text-gold/60 shrink-0"/>{item}
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{order.total.toLocaleString()} ₽</span>
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-muted-foreground flex items-center gap-1 hover:text-gold transition-colors">
                        <span className="text-base">🚀</span> Яндекс Доставка
                      </button>
                    </div>
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
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Мои сохранения</p>
              <h1 className="font-display text-4xl font-light">Избранное</h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATALOG_ITEMS.filter(i => wishlist.includes(i.id)).map(item => (
                <div key={item.id} className="bg-card rounded-xl overflow-hidden border border-border card-hover">
                  <div className="aspect-square overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gold mb-0.5">{item.brand}</p>
                    <p className="text-xs font-medium line-clamp-2 mb-2">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.price.toLocaleString()} ₽</span>
                      <button onClick={() => toggleWishlist(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="X" size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {wishlist.length === 0 && (
                <div className="col-span-2 md:col-span-4 text-center py-16 text-muted-foreground">
                  <Icon name="Heart" size={40} className="mx-auto mb-3 opacity-20"/>
                  <p className="font-display text-xl">Список пуст</p>
                  <p className="text-sm mt-1">Добавляйте вещи из каталога</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PARTNERS ── */}
        {activeTab === "partners" && (
          <div className="animate-fade-in-up">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Экосистема VESTIS</p>
              <h1 className="font-display text-4xl md:text-5xl font-light leading-tight mb-2">Партнёры</h1>
              <p className="text-muted-foreground text-sm max-w-md">
                Магазины, стилисты и сервисы доставки, которые обучают нашу нейросеть и зарабатывают вместе с нами
              </p>
            </div>

            {/* Categories */}
            {(["store","stylist","delivery"] as const).map(type => {
              const labels: Record<string, string> = { store: "Магазины-партнёры", stylist: "Стилисты", delivery: "Доставка" };
              const items = PARTNERS.filter(p => p.type === type);
              return (
                <div key={type} className="mb-8">
                  <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3 flex items-center gap-2">
                    {type === "store" && <Icon name="ShoppingBag" size={13}/>}
                    {type === "stylist" && <Icon name="Sparkles" size={13}/>}
                    {type === "delivery" && <Icon name="Truck" size={13}/>}
                    {labels[type]}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map(partner => (
                      <div key={partner.id} className={`bg-gradient-to-br ${partner.color} rounded-2xl border border-border p-5 card-hover relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gold/5 -translate-x-4 -translate-y-8"/>
                        <div className="flex items-start gap-4">
                          <div className="text-3xl w-12 h-12 flex items-center justify-center bg-background/20 rounded-xl shrink-0">
                            {partner.logo}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{partner.name}</p>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/20">{partner.tag}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{partner.desc}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" className="h-7 text-xs bg-gold text-background hover:bg-gold/80">
                            {type === "delivery" ? "Подключить" : "Подробнее"}
                          </Button>
                          {type === "stylist" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs border-gold/30 text-gold hover:bg-gold/10">
                              Обучить AI
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* CTA — become partner */}
            <div className="bg-card rounded-2xl border border-gold/30 p-6 text-center ai-glow">
              <Icon name="Handshake" size={32} className="text-gold mx-auto mb-3" fallback="Star"/>
              <h3 className="font-display text-2xl font-light mb-2">Стать партнёром</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Интегрируйте ваш магазин, обучайте нейросеть и получайте клиентов. Стилисты зарабатывают на рекомендациях.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                {[
                  { icon: "Store", label: "Магазин одежды" },
                  { icon: "User", label: "Стилист" },
                  { icon: "Truck", label: "Доставка" },
                ].map(item => (
                  <div key={item.label} className="bg-secondary rounded-xl p-3">
                    <Icon name={item.icon as never} size={20} fallback="Star" className="text-gold mx-auto mb-1"/>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
              <Button className="bg-gold text-background hover:bg-gold/80 h-11 px-8">
                <Icon name="ArrowRight" size={15} className="mr-2"/>
                Оставить заявку
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex">
          {(["catalog","ai","profile","orders","partners"] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${activeTab === tab ? "text-gold" : "text-muted-foreground"}`}>
              <Icon name={tab==="catalog"?"LayoutGrid":tab==="ai"?"Sparkles":tab==="profile"?"User":tab==="orders"?"Package":"Handshake"} size={19} fallback="Circle"/>
              <span className="text-[9px]">
                {tab==="catalog"&&"Каталог"}{tab==="ai"&&"AI"}{tab==="profile"&&"Профиль"}{tab==="orders"&&"Заказы"}{tab==="partners"&&"Партнёры"}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
