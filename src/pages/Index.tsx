import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const CATALOG_ITEMS = [
  {
    id: 1,
    name: "Шерстяное пальто оверсайз",
    brand: "Zara",
    price: 12990,
    oldPrice: 17900,
    category: "Верхняя одежда",
    image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/c4a1c0ba-ed27-4aaa-a323-95c938389c6c.jpg",
    tags: ["Тренд", "Новинка"],
    store: "Zara",
    inStock: true,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Шёлковое платье-миди",
    brand: "H&M",
    price: 6499,
    oldPrice: null,
    category: "Платья",
    image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/12aea226-dded-451f-af82-ceec84441516.jpg",
    tags: ["Бестселлер"],
    store: "H&M",
    inStock: true,
    rating: 4.6,
  },
  {
    id: 3,
    name: "Кожаные ботинки Chelsea",
    brand: "Mango",
    price: 9200,
    oldPrice: 12000,
    category: "Обувь",
    image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/172d58c6-ad73-4e54-9b7a-b523408bf3b4.jpg",
    tags: ["Скидка"],
    store: "Mango",
    inStock: false,
    rating: 4.5,
  },
  {
    id: 4,
    name: "Cashmere свитер базовый",
    brand: "Zara",
    price: 5990,
    oldPrice: null,
    category: "Джемперы",
    image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/c4a1c0ba-ed27-4aaa-a323-95c938389c6c.jpg",
    tags: ["Новинка"],
    store: "Zara",
    inStock: true,
    rating: 4.9,
  },
  {
    id: 5,
    name: "Широкие брюки с защипами",
    brand: "H&M",
    price: 3799,
    oldPrice: 4999,
    category: "Брюки",
    image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/12aea226-dded-451f-af82-ceec84441516.jpg",
    tags: ["Скидка", "Тренд"],
    store: "H&M",
    inStock: true,
    rating: 4.4,
  },
  {
    id: 6,
    name: "Структурированный блейзер",
    brand: "Mango",
    price: 11500,
    oldPrice: null,
    category: "Пиджаки",
    image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/172d58c6-ad73-4e54-9b7a-b523408bf3b4.jpg",
    tags: ["Бестселлер"],
    store: "Mango",
    inStock: true,
    rating: 4.7,
  },
];

const REGIONS = [
  "Москва", "Санкт-Петербург", "Казань", "Екатеринбург",
  "Новосибирск", "Нижний Новгород", "Краснодар", "Ростов-на-Дону",
];

const ORDERS = [
  { id: "#VST-4821", date: "12 апр 2026", items: ["Шерстяное пальто оверсайз"], status: "Доставлен", total: 12990 },
  { id: "#VST-4719", date: "3 апр 2026", items: ["Шёлковое платье-миди", "Cashmere свитер"], status: "В пути", total: 12489 },
  { id: "#VST-4601", date: "22 мар 2026", items: ["Широкие брюки с защипами"], status: "Обрабатывается", total: 3799 },
];

const SAVED_LOOKS = [
  {
    id: 1,
    name: "Офисный образ",
    items: ["Структурированный блейзер", "Широкие брюки", "Ботинки Chelsea"],
    image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/12aea226-dded-451f-af82-ceec84441516.jpg",
  },
  {
    id: 2,
    name: "Casual Weekend",
    items: ["Cashmere свитер", "Прямые джинсы", "Белые кеды"],
    image: "https://cdn.poehali.dev/projects/e113bf56-e4d9-4ffd-a5a8-108a9cd5ca12/files/c4a1c0ba-ed27-4aaa-a323-95c938389c6c.jpg",
  },
];

const AI_SUGGESTIONS = [
  { label: "Деловой стиль", icon: "Briefcase" },
  { label: "Casual", icon: "Coffee" },
  { label: "Вечерний", icon: "Moon" },
  { label: "Спортивный", icon: "Zap" },
  { label: "Романтичный", icon: "Heart" },
];

const FILTERS = ["Все", "Верхняя одежда", "Платья", "Обувь", "Джемперы", "Брюки", "Пиджаки"];

type Tab = "catalog" | "ai" | "profile" | "orders" | "saved";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const [activeFilter, setActiveFilter] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState("Москва");
  const [regionOpen, setRegionOpen] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([2, 5]);
  const [aiStep, setAiStep] = useState(0);
  const [aiStyle, setAiStyle] = useState("");
  const [aiParams, setAiParams] = useState({ height: [168], weight: [58], budget: [10000] });
  const [aiResult, setAiResult] = useState(false);

  const filteredItems = CATALOG_ITEMS.filter((item) => {
    const matchFilter = activeFilter === "Все" || item.category === activeFilter;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const statusColor = (status: string) => {
    if (status === "Доставлен") return "text-emerald-400";
    if (status === "В пути") return "text-gold";
    return "text-muted-foreground";
  };

  const statusDot = (status: string) => {
    if (status === "Доставлен") return "bg-emerald-400";
    if (status === "В пути") return "bg-yellow-400";
    return "bg-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-screen-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
              <span className="text-xs font-display font-semibold text-background">V</span>
            </div>
            <span className="font-display text-xl tracking-[0.15em] text-foreground">VESTIS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {(["catalog", "ai", "profile", "orders", "saved"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`nav-link text-sm tracking-wide transition-colors ${
                  activeTab === tab
                    ? "text-gold active"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "catalog" && "Каталог"}
                {tab === "ai" && "AI-стилист"}
                {tab === "profile" && "Профиль"}
                {tab === "orders" && "Заказы"}
                {tab === "saved" && "Избранное"}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setRegionOpen(!regionOpen)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
            >
              <Icon name="MapPin" size={13} />
              <span>{region}</span>
              <Icon name="ChevronDown" size={12} />
            </button>

            {regionOpen && (
              <div className="absolute right-0 top-8 z-50 bg-card border border-border rounded-xl shadow-2xl p-3 animate-slide-down w-56">
                <p className="text-xs text-muted-foreground px-2 py-1 mb-1">Выберите регион</p>
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRegion(r); setRegionOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      r === region ? "text-gold bg-secondary" : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {r === region && <Icon name="Check" size={12} className="inline mr-2 text-gold" />}
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-lg mx-auto px-4 pb-24 md:pb-8">

        {/* CATALOG TAB */}
        {activeTab === "catalog" && (
          <div className="animate-fade-in-up">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Актуальный каталог</p>
              <h1 className="font-display text-4xl md:text-5xl font-light leading-tight mb-1">
                Магазины <em>вашего</em> города
              </h1>
              <p className="text-muted-foreground text-sm">
                {region} · {CATALOG_ITEMS.length} товаров из 3 сетей
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Icon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по бренду или названию..."
                  className="pl-9 bg-card border-border h-10 text-sm focus-visible:ring-gold"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Icon name="SlidersHorizontal" size={15} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Zara · H&M · Mango</span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`tag-pill ${activeFilter === f ? "active" : ""}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item, i) => (
                <div
                  key={item.id}
                  className="bg-card rounded-2xl overflow-hidden card-hover border border-border"
                  style={{ animation: `fade-in-up 0.5s ease ${i * 0.08}s both` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-gold/90 text-background font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/60 backdrop-blur flex items-center justify-center transition-transform hover:scale-110"
                    >
                      <Icon
                        name="Heart"
                        size={15}
                        className={
                          wishlist.includes(item.id)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-foreground"
                        }
                      />
                    </button>

                    {!item.inStock && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                          Нет в наличии
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] text-gold tracking-widest uppercase mb-1">{item.store}</p>
                    <p className="text-sm font-medium leading-snug mb-2 line-clamp-2">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-semibold">
                          {item.price.toLocaleString()} ₽
                        </span>
                        {item.oldPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-1.5">
                            {item.oldPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Icon name="Star" size={11} className="fill-yellow-500 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">{item.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-3 pb-3">
                    <Button
                      size="sm"
                      disabled={!item.inStock}
                      className="w-full h-8 text-xs bg-gold text-background hover:bg-gold/80 disabled:opacity-30"
                    >
                      {item.inStock ? "В корзину" : "Уведомить"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="SearchX" size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-display text-xl">Ничего не найдено</p>
                <p className="text-sm mt-1">Попробуйте изменить запрос или фильтр</p>
              </div>
            )}
          </div>
        )}

        {/* AI STYLIST TAB */}
        {activeTab === "ai" && (
          <div className="animate-fade-in-up">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Персональный подбор</p>
              <h1 className="font-display text-4xl md:text-5xl font-light leading-tight">
                AI&#8209;стилист
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Алгоритм подберёт образ под ваши параметры и вкус
              </p>
            </div>

            {!aiResult ? (
              <div className="max-w-lg">
                <p className="text-sm text-muted-foreground mb-3">Какой стиль вам ближе?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {AI_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => { setAiStyle(s.label); setAiStep(1); }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm ${
                        aiStyle === s.label
                          ? "border-gold text-gold bg-gold/5"
                          : "border-border text-foreground hover:border-gold/50"
                      }`}
                    >
                      <Icon name={s.icon as never} size={16} fallback="Sparkles" />
                      {s.label}
                    </button>
                  ))}
                </div>

                {aiStep >= 1 && (
                  <div
                    className="bg-card rounded-2xl p-6 border border-border mb-4"
                    style={{ animation: "fade-in-up 0.4s ease both" }}
                  >
                    <p className="text-sm font-medium mb-5">Ваши параметры</p>

                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Рост</span>
                          <span className="text-gold font-medium">{aiParams.height[0]} см</span>
                        </div>
                        <Slider
                          value={aiParams.height}
                          onValueChange={(v) => setAiParams((p) => ({ ...p, height: v }))}
                          min={150}
                          max={195}
                          step={1}
                          className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Вес</span>
                          <span className="text-gold font-medium">{aiParams.weight[0]} кг</span>
                        </div>
                        <Slider
                          value={aiParams.weight}
                          onValueChange={(v) => setAiParams((p) => ({ ...p, weight: v }))}
                          min={45}
                          max={110}
                          step={1}
                          className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Бюджет</span>
                          <span className="text-gold font-medium">
                            до {aiParams.budget[0].toLocaleString()} ₽
                          </span>
                        </div>
                        <Slider
                          value={aiParams.budget}
                          onValueChange={(v) => setAiParams((p) => ({ ...p, budget: v }))}
                          min={2000}
                          max={50000}
                          step={500}
                          className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => setAiResult(true)}
                      className="w-full mt-6 bg-gold text-background hover:bg-gold/80 h-11 text-sm ai-glow"
                    >
                      <Icon name="Sparkles" size={16} className="mr-2" />
                      Подобрать образ
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ animation: "fade-in-up 0.5s ease both" }}>
                <div className="bg-card rounded-2xl border border-gold/30 p-5 mb-5 ai-glow">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                      <Icon name="Sparkles" size={12} className="text-gold" />
                    </div>
                    <span className="text-xs text-gold tracking-widest uppercase">
                      AI-подборка готова
                    </span>
                  </div>
                  <p className="font-display text-2xl font-light mb-1">
                    Стиль «{aiStyle}» для вас
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Рост {aiParams.height[0]} см · Вес {aiParams.weight[0]} кг · Бюджет до{" "}
                    {aiParams.budget[0].toLocaleString()} ₽
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                  {CATALOG_ITEMS.filter((i) => i.price <= aiParams.budget[0])
                    .slice(0, 3)
                    .map((item, i) => (
                      <div
                        key={item.id}
                        className="bg-card rounded-xl overflow-hidden border border-border card-hover"
                        style={{ animation: `fade-in-up 0.5s ease ${i * 0.1}s both` }}
                      >
                        <div className="aspect-[3/4] overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gold mb-1">{item.brand}</p>
                          <p className="text-sm font-medium line-clamp-2 mb-1">{item.name}</p>
                          <p className="text-sm font-semibold">{item.price.toLocaleString()} ₽</p>
                        </div>
                      </div>
                    ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => { setAiResult(false); setAiStep(0); setAiStyle(""); }}
                  className="border-border text-muted-foreground hover:text-foreground hover:border-gold/50 text-sm"
                >
                  <Icon name="RefreshCw" size={14} className="mr-2" />
                  Подобрать заново
                </Button>
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="animate-fade-in-up max-w-lg">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Личный кабинет</p>
              <h1 className="font-display text-4xl font-light">Мой профиль</h1>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border mb-4 flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-secondary border-2 border-gold/40 flex items-center justify-center">
                  <Icon name="User" size={36} className="text-muted-foreground" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold flex items-center justify-center hover:bg-gold/80 transition-colors">
                  <Icon name="Camera" size={13} className="text-background" />
                </button>
              </div>
              <div>
                <p className="font-display text-2xl font-light">Анна Соколова</p>
                <p className="text-sm text-muted-foreground">anna.sokolova@email.com</p>
                <p className="text-xs text-gold mt-1 flex items-center gap-1">
                  <Icon name="MapPin" size={11} />
                  {region}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border mb-4">
              <p className="text-sm font-medium mb-4 flex items-center gap-2">
                <Icon name="Ruler" size={15} className="text-gold" />
                Параметры для стиля
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Рост", value: "168 см" },
                  { label: "Размер одежды", value: "S / 44" },
                  { label: "Размер обуви", value: "38" },
                  { label: "Предпочтения", value: "Минимализм" },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary rounded-xl p-3">
                    <p className="text-[11px] text-muted-foreground mb-1">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4 border-border hover:border-gold/50 text-sm h-9 text-foreground"
              >
                <Icon name="Pencil" size={13} className="mr-2" />
                Редактировать параметры
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "Package", label: "Заказов", value: "3" },
                { icon: "Heart", label: "В избранном", value: String(wishlist.length) },
                { icon: "Sparkles", label: "AI-подборок", value: "1" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card rounded-xl p-4 border border-border text-center"
                >
                  <Icon name={s.icon as never} size={20} fallback="Star" className="mx-auto mb-1 text-gold" />
                  <p className="font-display text-2xl font-light">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="animate-fade-in-up max-w-lg">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">История покупок</p>
              <h1 className="font-display text-4xl font-light">Мои заказы</h1>
            </div>

            <div className="space-y-3">
              {ORDERS.map((order, i) => (
                <div
                  key={order.id}
                  className="bg-card rounded-2xl p-5 border border-border card-hover"
                  style={{ animation: `fade-in-up 0.5s ease ${i * 0.1}s both` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${statusColor(order.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(order.status)}`} />
                      {order.status}
                    </div>
                  </div>

                  <div className="shimmer-line mb-3" />

                  <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <p key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Icon name="Package2" size={12} className="text-gold/60 shrink-0" />
                        {item}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{order.total.toLocaleString()} ₽</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gold hover:text-gold h-7 px-3"
                    >
                      Подробнее
                      <Icon name="ChevronRight" size={13} className="ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">Нужна помощь с заказом?</p>
              <Button variant="link" className="text-gold text-sm mt-1 h-auto p-0">
                Написать в поддержку
              </Button>
            </div>
          </div>
        )}

        {/* SAVED TAB */}
        {activeTab === "saved" && (
          <div className="animate-fade-in-up">
            <div className="pt-8 pb-6">
              <p className="text-xs tracking-[0.2em] text-gold uppercase mb-2">Мои сохранения</p>
              <h1 className="font-display text-4xl font-light">Избранное</h1>
            </div>

            <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">Образы</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {SAVED_LOOKS.map((look) => (
                <div
                  key={look.id}
                  className="bg-card rounded-2xl overflow-hidden border border-border card-hover flex gap-4 p-4"
                >
                  <img
                    src={look.image}
                    alt={look.name}
                    className="w-20 h-24 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex flex-col justify-center">
                    <p className="font-medium mb-1">{look.name}</p>
                    <div className="space-y-0.5">
                      {look.items.map((item) => (
                        <p key={item} className="text-xs text-muted-foreground">
                          {item}
                        </p>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-gold text-background hover:bg-gold/80"
                      >
                        Купить образ
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Icon name="Trash2" size={13} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground tracking-widest uppercase mb-3">Вещи</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATALOG_ITEMS.filter((i) => wishlist.includes(i.id)).map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl overflow-hidden border border-border card-hover"
                >
                  <div className="aspect-square overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gold mb-0.5">{item.brand}</p>
                    <p className="text-xs font-medium line-clamp-2 mb-2">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{item.price.toLocaleString()} ₽</span>
                      <button
                        onClick={() => toggleWishlist(item.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {wishlist.length === 0 && (
                <div className="col-span-2 md:col-span-4 text-center py-10 text-muted-foreground">
                  <Icon name="Heart" size={36} className="mx-auto mb-2 opacity-20" />
                  <p className="font-display text-xl">Список пуст</p>
                  <p className="text-sm mt-1">Добавляйте вещи из каталога</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex">
          {(["catalog", "ai", "profile", "orders", "saved"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                activeTab === tab ? "text-gold" : "text-muted-foreground"
              }`}
            >
              <Icon
                name={
                  tab === "catalog"
                    ? "LayoutGrid"
                    : tab === "ai"
                    ? "Sparkles"
                    : tab === "profile"
                    ? "User"
                    : tab === "orders"
                    ? "Package"
                    : "Heart"
                }
                size={20}
                fallback="Circle"
              />
              <span className="text-[10px]">
                {tab === "catalog" && "Каталог"}
                {tab === "ai" && "AI"}
                {tab === "profile" && "Профиль"}
                {tab === "orders" && "Заказы"}
                {tab === "saved" && "Избранное"}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
