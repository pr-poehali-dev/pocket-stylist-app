import React, { useState, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoreCabinetProps {
  onBack: () => void;
}

type View = "login" | "register" | "cabinet";

interface StoreProfile {
  storeName: string;
  city: string;
  category: string;
  email: string;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  sizes: string;
  stock: number;
  photoUrl: string | null;
  description: string;
}

interface ManualItemForm {
  name: string;
  category: string;
  price: string;
  sizes: string;
  stock: string;
  photo: File | null;
  photoUrl: string | null;
  description: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORE_CATEGORIES = [
  "Одежда женская",
  "Одежда мужская",
  "Детская одежда",
  "Обувь",
  "Аксессуары",
  "Мультибрендовый",
];

const ITEM_CATEGORIES = [
  "Верхняя одежда",
  "Платья",
  "Блузки и рубашки",
  "Брюки и джинсы",
  "Юбки",
  "Джемперы и свитеры",
  "Пиджаки и блейзеры",
  "Обувь",
  "Аксессуары",
  "Сумки",
  "Нижнее бельё",
  "Спортивная одежда",
  "Другое",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fileToUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      className="label-cap block mb-1.5"
      style={{ color: "hsl(var(--foreground))" }}
    >
      {children}
      {required && (
        <span style={{ color: "hsl(var(--destructive))", marginLeft: 2 }}>*</span>
      )}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full h-11 px-3 text-sm bg-background border border-border outline-none focus:border-foreground transition-colors disabled:opacity-40"
      style={{ borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif" }}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 text-sm bg-background border border-border outline-none focus:border-foreground transition-colors"
      style={{
        borderRadius: "var(--radius)",
        fontFamily: "Inter, sans-serif",
        color: value ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 36,
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display"
      style={{ fontSize: 20, fontWeight: 400, marginBottom: 16, letterSpacing: "0.01em" }}
    >
      {children}
    </h2>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "hsl(var(--border))",
        margin: "32px 0",
      }}
    />
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p
      className="animate-fade-in text-xs"
      style={{ color: "hsl(var(--destructive))", marginTop: 8 }}
    >
      {msg}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Header — shared across all views
// ---------------------------------------------------------------------------

function PageHeader({
  onBack,
  title,
  right,
}: {
  onBack: () => void;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <header
      style={{
        borderBottom: "1px solid hsl(var(--border))",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        background: "hsl(var(--background))",
        zIndex: 20,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "hsl(var(--foreground))",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="label-cap" style={{ color: "hsl(var(--foreground))" }}>
          Назад
        </span>
      </button>

      <span
        className="font-display"
        style={{ fontSize: 16, fontWeight: 400, letterSpacing: "0.04em" }}
      >
        {title ?? "B&G Style"}
      </span>

      <div style={{ minWidth: 52, display: "flex", justifyContent: "flex-end" }}>
        {right}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// LOGIN VIEW
// ---------------------------------------------------------------------------

function LoginView({
  onLogin,
  onRegister,
  onBack,
}: {
  onLogin: () => void;
  onRegister: () => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) { setError("Введите email"); return; }
    if (!password) { setError("Введите пароль"); return; }
    setError("");
    onLogin();
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "hsl(var(--background))",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader onBack={onBack} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }} className="animate-fade-in-up">
          {/* Logo / brand */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                width: 56,
                height: 56,
                border: "1px solid hsl(var(--foreground))",
                borderRadius: "var(--radius)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="2" width="8" height="8" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                <rect x="12" y="2" width="8" height="8" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                <rect x="2" y="12" width="8" height="8" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                <rect x="12" y="12" width="8" height="8" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
              </svg>
            </div>
            <h1
              className="font-display"
              style={{ fontSize: 24, fontWeight: 400, marginBottom: 6 }}
            >
              Личный кабинет магазина
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              B&G Style — партнёрская платформа
            </p>
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <FieldLabel required>Email</FieldLabel>
              <TextInput
                value={email}
                onChange={setEmail}
                placeholder="store@example.com"
                type="email"
              />
            </div>

            <div>
              <FieldLabel required>Пароль</FieldLabel>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full h-11 px-3 pr-10 text-sm bg-background border border-border outline-none focus:border-foreground transition-colors"
                  style={{ borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "hsl(var(--muted-foreground))",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPwd ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.6 6.7A2 2 0 0010 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      <path d="M4.2 4.3C2.8 5.3 2 6.5 2 8c0 2.5 2.7 5 6 5 1.2 0 2.4-.4 3.3-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      <path d="M8 3C11.3 3 14 5.5 14 8c0 .6-.2 1.2-.5 1.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3C4.7 3 2 5.5 2 8s2.7 5 6 5 6-2.5 6-5-2.7-5-6-5z" stroke="currentColor" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <ErrorMsg msg={error} />}

            <button
              type="button"
              onClick={handleSubmit}
              className="btn-zara w-full"
              style={{ marginTop: 8 }}
            >
              Войти
            </button>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <button
                type="button"
                onClick={onRegister}
                className="label-cap"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "hsl(var(--foreground))",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Зарегистрировать магазин
              </button>
              <button
                type="button"
                className="label-cap"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "hsl(var(--muted-foreground))",
                  padding: 0,
                }}
              >
                Забыли пароль?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// REGISTER VIEW
// ---------------------------------------------------------------------------

interface RegisterForm {
  storeName: string;
  legalName: string;
  inn: string;
  city: string;
  website: string;
  phone: string;
  email: string;
  password: string;
  category: string;
  agreed: boolean;
}

function RegisterView({
  onRegister,
  onLogin,
  onBack,
}: {
  onRegister: (profile: StoreProfile) => void;
  onLogin: () => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<RegisterForm>({
    storeName: "",
    legalName: "",
    inn: "",
    city: "",
    website: "",
    phone: "",
    email: "",
    password: "",
    category: "",
    agreed: false,
  });
  const [error, setError] = useState("");

  const patch = useCallback((p: Partial<RegisterForm>) => {
    setForm((f) => ({ ...f, ...p }));
    setError("");
  }, []);

  const validate = (): string | null => {
    if (!form.storeName.trim()) return "Введите название магазина";
    if (!form.legalName.trim()) return "Введите юридическое название";
    if (!/^\d{10,12}$/.test(form.inn.trim())) return "ИНН должен содержать 10 или 12 цифр";
    if (!form.city.trim()) return "Введите город";
    if (!form.phone.trim()) return "Введите телефон";
    if (!form.email.trim()) return "Введите email";
    if (form.password.length < 6) return "Пароль не менее 6 символов";
    if (!form.category) return "Выберите категорию магазина";
    if (!form.agreed) return "Примите условия сотрудничества";
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    onRegister({ storeName: form.storeName, city: form.city, category: form.category, email: form.email });
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "hsl(var(--background))",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader onBack={onBack} title="Регистрация магазина" />

      <div
        style={{
          flex: 1,
          maxWidth: 520,
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 120px",
          boxSizing: "border-box",
        }}
      >
        <div className="animate-fade-in-up" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ marginBottom: 8 }}>
            <h1 className="font-display" style={{ fontSize: 26, fontWeight: 400, marginBottom: 6 }}>
              Регистрация магазина
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              После проверки вы получите доступ к личному кабинету
            </p>
          </div>

          {/* Store name */}
          <div>
            <FieldLabel required>Название магазина</FieldLabel>
            <TextInput value={form.storeName} onChange={(v) => patch({ storeName: v })} placeholder="Например: Модный стиль" />
          </div>

          {/* Legal name */}
          <div>
            <FieldLabel required>Юридическое наименование</FieldLabel>
            <TextInput value={form.legalName} onChange={(v) => patch({ legalName: v })} placeholder='ООО "Торговая компания"' />
          </div>

          {/* INN */}
          <div>
            <FieldLabel required>ИНН</FieldLabel>
            <TextInput
              value={form.inn}
              onChange={(v) => {
                const digits = v.replace(/\D/g, "").slice(0, 12);
                patch({ inn: digits });
              }}
              placeholder="0000000000"
              type="text"
            />
            <p className="label-cap mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              10 цифр для ЮЛ, 12 — для ИП
            </p>
          </div>

          {/* City */}
          <div>
            <FieldLabel required>Город</FieldLabel>
            <TextInput value={form.city} onChange={(v) => patch({ city: v })} placeholder="Москва" />
          </div>

          {/* Website */}
          <div>
            <FieldLabel>Сайт</FieldLabel>
            <TextInput value={form.website} onChange={(v) => patch({ website: v })} placeholder="https://yourstore.ru" type="url" />
          </div>

          {/* Phone */}
          <div>
            <FieldLabel required>Телефон</FieldLabel>
            <TextInput value={form.phone} onChange={(v) => patch({ phone: v })} placeholder="+7 (999) 000-00-00" type="tel" />
          </div>

          {/* Email */}
          <div>
            <FieldLabel required>Email</FieldLabel>
            <TextInput value={form.email} onChange={(v) => patch({ email: v })} placeholder="store@example.com" type="email" />
          </div>

          {/* Password */}
          <div>
            <FieldLabel required>Пароль</FieldLabel>
            <TextInput value={form.password} onChange={(v) => patch({ password: v })} placeholder="Не менее 6 символов" type="password" />
          </div>

          {/* Category */}
          <div>
            <FieldLabel required>Категория магазина</FieldLabel>
            <SelectInput
              value={form.category}
              onChange={(v) => patch({ category: v })}
              options={STORE_CATEGORIES}
              placeholder="Выберите категорию"
            />
          </div>

          {/* Agreement */}
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              cursor: "pointer",
              padding: "14px 16px",
              border: "1px solid",
              borderColor: form.agreed ? "hsl(var(--foreground))" : "hsl(var(--border))",
              borderRadius: "var(--radius)",
              transition: "border-color 0.2s",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                border: "1px solid",
                borderColor: form.agreed ? "hsl(var(--foreground))" : "hsl(var(--border))",
                borderRadius: 2,
                background: form.agreed ? "hsl(var(--foreground))" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
                transition: "all 0.15s",
              }}
            >
              {form.agreed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="hsl(var(--background))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <input type="checkbox" className="hidden" checked={form.agreed} onChange={(e) => patch({ agreed: e.target.checked })} />
            <span className="text-xs" style={{ color: "hsl(var(--foreground))", lineHeight: 1.6 }}>
              Согласен(а) с{" "}
              <span style={{ textDecoration: "underline" }}>условиями сотрудничества</span>{" "}
              и правилами размещения товаров на платформе B&G Style
            </span>
          </label>

          {error && <ErrorMsg msg={error} />}
        </div>
      </div>

      {/* Fixed CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "hsl(var(--background))",
          borderTop: "1px solid hsl(var(--border))",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          zIndex: 10,
        }}
      >
        <div style={{ width: "100%", maxWidth: 520, display: "flex", gap: 12 }}>
          <button type="button" onClick={onLogin} className="btn-ghost-zara" style={{ flex: "0 0 auto", minWidth: 80 }}>
            Войти
          </button>
          <button type="button" onClick={handleSubmit} className="btn-zara" style={{ flex: 1 }}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CABINET — manual add item form
// ---------------------------------------------------------------------------

const EMPTY_ITEM_FORM: ManualItemForm = {
  name: "",
  category: "",
  price: "",
  sizes: "",
  stock: "",
  photo: null,
  photoUrl: null,
  description: "",
};

function AddItemForm({ onAdd, onCancel }: { onAdd: (item: CatalogItem) => void; onCancel: () => void }) {
  const [form, setForm] = useState<ManualItemForm>(EMPTY_ITEM_FORM);
  const [error, setError] = useState("");
  const photoRef = useRef<HTMLInputElement>(null);

  const patch = useCallback((p: Partial<ManualItemForm>) => {
    setForm((f) => ({ ...f, ...p }));
    setError("");
  }, []);

  const handlePhoto = useCallback(async (file: File) => {
    const url = await fileToUrl(file);
    patch({ photo: file, photoUrl: url });
  }, [patch]);

  const handleAdd = () => {
    if (!form.name.trim()) { setError("Введите название товара"); return; }
    if (!form.category) { setError("Выберите категорию"); return; }
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price <= 0) { setError("Введите корректную цену"); return; }
    const stock = parseInt(form.stock, 10);
    if (!form.stock || isNaN(stock) || stock < 0) { setError("Введите остаток на складе"); return; }

    onAdd({
      id: uid(),
      name: form.name.trim(),
      category: form.category,
      price,
      sizes: form.sizes.trim() || "Без размера",
      stock,
      photoUrl: form.photoUrl,
      description: form.description.trim(),
    });
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
        padding: 20,
        background: "hsl(var(--card))",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <p className="label-cap" style={{ color: "hsl(var(--foreground))", marginBottom: 4 }}>
        Новый товар
      </p>

      {/* Photo + Name row */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Photo */}
        <div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f); }}
          />
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            style={{
              width: 72,
              height: 72,
              border: "1px dashed hsl(var(--border))",
              borderRadius: "var(--radius)",
              background: form.photoUrl ? "transparent" : "hsl(var(--muted))",
              cursor: "pointer",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
            }}
            aria-label="Загрузить фото"
          >
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {/* Name */}
        <div style={{ flex: 1 }}>
          <FieldLabel required>Название</FieldLabel>
          <TextInput value={form.name} onChange={(v) => patch({ name: v })} placeholder="Пальто шерстяное оверсайз" />
        </div>
      </div>

      {/* Category + Price row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <FieldLabel required>Категория</FieldLabel>
          <SelectInput value={form.category} onChange={(v) => patch({ category: v })} options={ITEM_CATEGORIES} placeholder="Выберите" />
        </div>
        <div>
          <FieldLabel required>Цена, ₽</FieldLabel>
          <TextInput value={form.price} onChange={(v) => patch({ price: v.replace(/\D/g, "") })} placeholder="0" type="text" />
        </div>
      </div>

      {/* Sizes + Stock row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <FieldLabel>Размеры</FieldLabel>
          <TextInput value={form.sizes} onChange={(v) => patch({ sizes: v })} placeholder="XS, S, M, L, XL" />
        </div>
        <div>
          <FieldLabel required>Остаток</FieldLabel>
          <TextInput value={form.stock} onChange={(v) => patch({ stock: v.replace(/\D/g, "") })} placeholder="0" type="text" />
        </div>
      </div>

      {/* Description */}
      <div>
        <FieldLabel>Описание</FieldLabel>
        <textarea
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Краткое описание товара..."
          rows={3}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground transition-colors resize-none"
          style={{ borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}
        />
      </div>

      {error && <ErrorMsg msg={error} />}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={onCancel} className="btn-ghost-zara" style={{ flex: "0 0 auto" }}>
          Отмена
        </button>
        <button type="button" onClick={handleAdd} className="btn-zara" style={{ flex: 1 }}>
          Добавить товар
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CABINET — catalog table
// ---------------------------------------------------------------------------

function CatalogTable({
  items,
  onRemove,
}: {
  items: CatalogItem[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div
        style={{
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
          padding: "48px 24px",
          textAlign: "center",
          background: "hsl(var(--card))",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: "0 auto 12px" }}>
          <rect x="4" y="8" width="24" height="18" rx="1" stroke="hsl(var(--border))" strokeWidth="1.5" />
          <path d="M4 13h24" stroke="hsl(var(--border))" strokeWidth="1.5" />
          <path d="M10 18h4M10 22h8" stroke="hsl(var(--border))" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Каталог пуст. Добавьте первый товар.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 120px 80px 80px 60px 40px",
          borderBottom: "1px solid hsl(var(--border))",
          background: "hsl(var(--muted))",
          padding: "0 12px",
        }}
      >
        {["", "Название", "Категория", "Цена", "Размеры", "Остаток", ""].map((col, i) => (
          <div
            key={i}
            className="label-cap"
            style={{
              padding: "10px 4px",
              color: "hsl(var(--muted-foreground))",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      {items.map((item, idx) => (
        <div
          key={item.id}
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 120px 80px 80px 60px 40px",
            borderBottom: idx < items.length - 1 ? "1px solid hsl(var(--border))" : "none",
            padding: "0 12px",
            alignItems: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "hsl(var(--muted))"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          {/* Thumbnail */}
          <div style={{ padding: "8px 4px" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius)",
                overflow: "hidden",
                background: "hsl(var(--muted))",
                border: "1px solid hsl(var(--border))",
                flexShrink: 0,
              }}
            >
              {item.photoUrl ? (
                <img src={item.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <rect x="1" y="1" width="8" height="8" rx="1" stroke="hsl(var(--border))" strokeWidth="1" />
                    <path d="M1 7l2.5-2.5L6 7l1.5-2L9 7" stroke="hsl(var(--border))" strokeWidth="0.8" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div style={{ padding: "8px 4px", overflow: "hidden" }}>
            <p
              className="text-sm"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: 400,
              }}
            >
              {item.name}
            </p>
          </div>

          {/* Category */}
          <div style={{ padding: "8px 4px", overflow: "hidden" }}>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.category}
            </p>
          </div>

          {/* Price */}
          <div style={{ padding: "8px 4px" }}>
            <p className="text-sm">{formatPrice(item.price)}</p>
          </div>

          {/* Sizes */}
          <div style={{ padding: "8px 4px", overflow: "hidden" }}>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.sizes}
            </p>
          </div>

          {/* Stock */}
          <div style={{ padding: "8px 4px" }}>
            <span
              className="label-cap"
              style={{
                color: item.stock === 0 ? "hsl(var(--destructive))" : "hsl(var(--foreground))",
              }}
            >
              {item.stock}
            </span>
          </div>

          {/* Delete */}
          <div style={{ padding: "8px 4px", display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              style={{
                width: 24,
                height: 24,
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                color: "hsl(var(--muted-foreground))",
                transition: "color 0.15s",
                padding: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--destructive))"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--muted-foreground))"; }}
              aria-label="Удалить товар"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CABINET VIEW
// ---------------------------------------------------------------------------

function CabinetView({
  profile,
  onBack,
  onLogout,
}: {
  profile: StoreProfile;
  onBack: () => void;
  onLogout: () => void;
}) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const addItem = useCallback((item: CatalogItem) => {
    setItems((prev) => [item, ...prev]);
    setShowAddForm(false);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleUpload = (file: File) => {
    setUploadFileName(file.name);
    // Simulate parsing: add placeholder items
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        name: "Позиция из файла 1",
        category: "Другое",
        price: 1990,
        sizes: "S, M, L",
        stock: 10,
        photoUrl: null,
        description: `Импортировано из ${file.name}`,
      },
      {
        id: uid(),
        name: "Позиция из файла 2",
        category: "Другое",
        price: 3490,
        sizes: "M, L, XL",
        stock: 5,
        photoUrl: null,
        description: `Импортировано из ${file.name}`,
      },
    ]);
  };

  const totalStock = items.reduce((s, i) => s + i.stock, 0);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "hsl(var(--background))",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PageHeader
        onBack={onBack}
        title={profile.storeName}
        right={
          <button
            type="button"
            onClick={onLogout}
            className="label-cap"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "hsl(var(--muted-foreground))",
              padding: 0,
            }}
          >
            Выйти
          </button>
        }
      />

      <div
        style={{
          maxWidth: 800,
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 64px",
          boxSizing: "border-box",
        }}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Store header                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="animate-fade-in-up" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 400, marginBottom: 4 }}>
                {profile.storeName}
              </h1>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {profile.city} · {profile.category}
              </p>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                border: "1px solid hsl(var(--border))",
                borderRadius: 100,
                background: "hsl(var(--card))",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />
              <span className="label-cap" style={{ color: "hsl(var(--foreground))" }}>
                Активен
              </span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Stats row                                                          */}
        {/* ---------------------------------------------------------------- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 40,
          }}
          className="animate-fade-in-up"
        >
          {[
            { label: "Товаров в каталоге", value: items.length },
            { label: "Просмотров сегодня", value: 0 },
            { label: "Заказов", value: 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "18px 16px",
                background: "hsl(var(--card))",
              }}
            >
              <p
                className="font-display"
                style={{ fontSize: 28, fontWeight: 400, lineHeight: 1, marginBottom: 6 }}
              >
                {stat.value}
              </p>
              <p className="label-cap" style={{ color: "hsl(var(--muted-foreground))" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Catalog section                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <SectionHeading>Каталог товаров</SectionHeading>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="btn-ghost-zara"
                style={{ display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 14px", fontSize: 11 }}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Добавить товар
              </button>
            )}
          </div>

          {showAddForm && (
            <div style={{ marginBottom: 16 }}>
              <AddItemForm onAdd={addItem} onCancel={() => setShowAddForm(false)} />
            </div>
          )}

          <CatalogTable items={items} onRemove={removeItem} />
        </section>

        <Divider />

        {/* ---------------------------------------------------------------- */}
        {/* Upload catalog section                                             */}
        {/* ---------------------------------------------------------------- */}
        <section style={{ marginBottom: 40 }}>
          <SectionHeading>Загрузить каталог</SectionHeading>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            {/* Option 1: File upload */}
            <div
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: 20,
                background: "hsl(var(--card))",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p className="label-cap" style={{ color: "hsl(var(--foreground))" }}>
                Вариант 1 — таблица
              </p>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                Заполните шаблон Excel/CSV и загрузите файл. Все товары добавятся автоматически.
              </p>

              <button
                type="button"
                className="label-cap"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "hsl(var(--foreground))",
                  textDecoration: "underline",
                  padding: 0,
                  width: "fit-content",
                }}
              >
                <svg width="12" height="13" viewBox="0 0 12 13" fill="none">
                  <path d="M6 1v8M3 6l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Скачать шаблон
              </button>

              <input
                ref={uploadRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  if (uploadRef.current) uploadRef.current.value = "";
                }}
              />

              {uploadFileName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      background: "hsl(var(--muted))",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                      <path d="M7 1H2a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V5L7 1z" stroke="hsl(var(--muted-foreground))" strokeWidth="1.1" strokeLinejoin="round" />
                      <path d="M7 1v4h4" stroke="hsl(var(--muted-foreground))" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs truncate" style={{ color: "hsl(var(--foreground))" }}>
                      {uploadFileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadFileName(null)}
                    className="label-cap"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "hsl(var(--muted-foreground))", padding: 0, whiteSpace: "nowrap" }}
                  >
                    Убрать
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="btn-ghost-zara w-full"
                  style={{ fontSize: 11 }}
                >
                  Загрузить файл
                </button>
              )}
            </div>

            {/* Option 2: Manual — just a shortcut button here */}
            <div
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: 20,
                background: "hsl(var(--card))",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p className="label-cap" style={{ color: "hsl(var(--foreground))" }}>
                Вариант 2 — вручную
              </p>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
                Заполните карточку товара вручную: название, фото, цена, размеры, остаток.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="btn-zara w-full"
                style={{ marginTop: "auto", fontSize: 11 }}
              >
                Добавить товар
              </button>
            </div>
          </div>
        </section>

        <Divider />

        {/* ---------------------------------------------------------------- */}
        {/* Inventory sync section                                             */}
        {/* ---------------------------------------------------------------- */}
        <section style={{ marginBottom: 40 }}>
          <SectionHeading>Синхронизация остатков</SectionHeading>

          <div
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              padding: "20px 22px",
              background: "hsl(var(--muted))",
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <div style={{ marginTop: 2, flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" stroke="hsl(var(--foreground))" strokeWidth="1.2" />
                <path d="M9 8v5" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="9" cy="5.5" r="0.8" fill="hsl(var(--foreground))" />
              </svg>
            </div>
            <div>
              <p className="text-sm" style={{ fontWeight: 500, marginBottom: 6 }}>
                Автоматическое управление остатками
              </p>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.7 }}>
                Система автоматически скрывает товары с нулевым остатком. AI-стилист не
                предложит отсутствующие позиции — клиент видит только актуальный ассортимент.
                Обновляйте остатки вручную или загружайте актуальный файл.
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                <span className="text-xs" style={{ color: "hsl(var(--foreground))" }}>
                  Товаров в наличии: {items.filter((i) => i.stock > 0).length} из {items.length}
                </span>
                {items.filter((i) => i.stock === 0).length > 0 && (
                  <>
                    <span style={{ color: "hsl(var(--border))" }}>·</span>
                    <span className="text-xs" style={{ color: "hsl(var(--destructive))" }}>
                      Скрыто: {items.filter((i) => i.stock === 0).length}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ---------------------------------------------------------------- */}
        {/* Advertising section                                                */}
        {/* ---------------------------------------------------------------- */}
        <section style={{ marginBottom: 40 }}>
          <SectionHeading>Реклама</SectionHeading>

          <div
            style={{
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              padding: "24px 22px",
              background: "hsl(var(--card))",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <p className="text-sm" style={{ fontWeight: 500, marginBottom: 6 }}>
                  Разместить баннер в каталоге
                </p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6, maxWidth: 380 }}>
                  Ваш магазин и товары показываются в рекомендациях AI-стилиста и в верхних
                  позициях каталога. Охват: аудитория приложения B&G Style.
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p className="font-display" style={{ fontSize: 20, fontWeight: 400 }}>
                  от 5 000 ₽
                </p>
                <p className="label-cap" style={{ color: "hsl(var(--muted-foreground))" }}>
                  в неделю
                </p>
              </div>
            </div>
            <button type="button" className="btn-zara" style={{ alignSelf: "flex-start" }}>
              Разместить баннер
            </button>
          </div>
        </section>

        <Divider />

        {/* ---------------------------------------------------------------- */}
        {/* Subscription section                                               */}
        {/* ---------------------------------------------------------------- */}
        <section>
          <SectionHeading>Тариф</SectionHeading>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {/* Basic */}
            <div
              style={{
                border: "1px solid hsl(var(--foreground))",
                borderRadius: "var(--radius)",
                padding: "20px 18px",
                background: "hsl(var(--foreground))",
                color: "hsl(var(--background))",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 14,
                }}
              >
                <span
                  className="label-cap"
                  style={{
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    padding: "2px 8px",
                    borderRadius: 100,
                    fontSize: 9,
                  }}
                >
                  Активен
                </span>
              </div>
              <p
                className="font-display"
                style={{ fontSize: 18, fontWeight: 400, marginBottom: 8, color: "hsl(var(--background))" }}
              >
                Базовый
              </p>
              <p
                className="font-display"
                style={{ fontSize: 26, fontWeight: 400, marginBottom: 4, color: "hsl(var(--background))" }}
              >
                0 ₽
              </p>
              <p
                className="label-cap"
                style={{ color: "rgba(255,255,255,0.55)", marginBottom: 14 }}
              >
                бесплатно
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["До 100 товаров", "Базовый каталог", "Загрузка CSV/XLSX"].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="hsl(var(--background))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div
              style={{
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                padding: "20px 18px",
                background: "hsl(var(--card))",
              }}
            >
              <p
                className="font-display"
                style={{ fontSize: 18, fontWeight: 400, marginBottom: 8 }}
              >
                Расширенный
              </p>
              <p className="font-display" style={{ fontSize: 26, fontWeight: 400, marginBottom: 4 }}>
                2 990 ₽
              </p>
              <p className="label-cap" style={{ color: "hsl(var(--muted-foreground))", marginBottom: 14 }}>
                в месяц
              </p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {[
                  "Без ограничений на товары",
                  "Приоритет в каталоге",
                  "Расширенная аналитика",
                  "AI-рекомендации в ленте",
                ].map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs" style={{ color: "hsl(var(--foreground))" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-ghost-zara w-full" style={{ fontSize: 11 }}>
                Подключить
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ROOT COMPONENT
// ---------------------------------------------------------------------------

export default function StoreCabinet({ onBack }: StoreCabinetProps) {
  const [view, setView] = useState<View>("login");
  const [profile, setProfile] = useState<StoreProfile | null>(null);

  const handleLogin = useCallback(() => {
    // Simulate login — use a placeholder profile
    setProfile({
      storeName: "Мой Магазин",
      city: "Москва",
      category: "Одежда женская",
      email: "store@example.com",
    });
    setView("cabinet");
  }, []);

  const handleRegister = useCallback((p: StoreProfile) => {
    setProfile(p);
    setView("cabinet");
  }, []);

  const handleLogout = useCallback(() => {
    setProfile(null);
    setView("login");
  }, []);

  if (view === "login") {
    return (
      <LoginView
        onLogin={handleLogin}
        onRegister={() => setView("register")}
        onBack={onBack}
      />
    );
  }

  if (view === "register") {
    return (
      <RegisterView
        onRegister={handleRegister}
        onLogin={() => setView("login")}
        onBack={() => setView("login")}
      />
    );
  }

  return (
    <CabinetView
      profile={profile!}
      onBack={onBack}
      onLogout={handleLogout}
    />
  );
}
