import React, { useState, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StylistRegisterProps {
  onBack: () => void;
}

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Step 1
  fullName: string;
  city: string;
  experience: number;
  phone: string;
  email: string;
  socialHandle: string;
  profilePhoto: File | null;
  profilePhotoUrl: string | null;
  // Step 2
  portfolioPhotos: File[];
  portfolioUrls: string[];
  specializations: string[];
  bio: string;
  // Step 3
  documentPhoto: File | null;
  documentPhotoUrl: string | null;
  diplomaFile: File | null;
  diplomaFileName: string | null;
  agreedToTerms: boolean;
}

const SPECIALIZATIONS = [
  "Женский образ",
  "Мужской стиль",
  "Деловой look",
  "Вечерний образ",
  "Casual",
  "Свадебный стиль",
  "Спортивный стиль",
];

const TOTAL_STEPS = 3; // step 4 is success, not counted in progress bar

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Step progress bar — 3 numbered segments */
function ProgressBar({ step }: { step: Step }) {
  const labels = ["Основное", "Портфолио", "Верификация"];
  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-0">
        {labels.map((label, i) => {
          const num = i + 1;
          const isCompleted = step > num;
          const isActive = step === num;
          return (
            <React.Fragment key={num}>
              {/* Step dot + label */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
                  style={{
                    background: isCompleted || isActive ? "hsl(var(--foreground))" : "transparent",
                    color: isCompleted || isActive ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
                    border: isCompleted || isActive ? "none" : "1px solid hsl(var(--border))",
                  }}
                >
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
                <span
                  className="label-cap"
                  style={{
                    color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    fontWeight: isActive ? 500 : 300,
                  }}
                >
                  {label}
                </span>
              </div>
              {/* Connector line */}
              {i < labels.length - 1 && (
                <div
                  className="flex-1 mx-2"
                  style={{
                    height: 1,
                    marginBottom: 18,
                    background: step > num ? "hsl(var(--foreground))" : "hsl(var(--border))",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/** Reusable field label */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="label-cap block mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
      {children}
    </label>
  );
}

/** Reusable text input */
function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-11 px-3 text-sm bg-background border border-border outline-none focus:border-foreground transition-colors"
      style={{ borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif" }}
    />
  );
}

/** Photo upload box */
function PhotoUploadBox({
  url,
  onFile,
  label,
  size = "lg",
}: {
  url: string | null;
  onFile: (file: File) => void;
  label: string;
  size?: "lg" | "sm";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const dim = size === "lg" ? 100 : 80;

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        style={{
          width: dim,
          height: dim,
          border: "1px dashed hsl(var(--border))",
          borderRadius: "var(--radius)",
          background: url ? "transparent" : "hsl(var(--muted))",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          transition: "border-color 0.2s",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--foreground))"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--border))"; }}
        aria-label={label}
      >
        {url ? (
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="label-cap" style={{ fontSize: 9 }}>{label}</span>
          </div>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monetization info box
// ---------------------------------------------------------------------------

function MonetizationBox() {
  return (
    <div
      className="animate-fade-in"
      style={{
        border: "1px solid hsl(var(--border))",
        padding: "16px 20px",
        marginBottom: 24,
        background: "hsl(var(--card))",
        borderRadius: "var(--radius)",
      }}
    >
      <p
        className="label-cap mb-3"
        style={{ color: "hsl(var(--foreground))", letterSpacing: "0.14em" }}
      >
        Как стилисты зарабатывают
      </p>
      <ul className="flex flex-col gap-2">
        {[
          "Рекламные баннеры в образах",
          "Процент с продаж рекомендованных вещей",
          "Персональные консультации с клиентами",
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "hsl(var(--foreground))",
                marginTop: 7,
                flexShrink: 0,
              }}
            />
            <span className="text-sm" style={{ color: "hsl(var(--foreground))", fontWeight: 300 }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Basic info
// ---------------------------------------------------------------------------

function Step1({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  const handleProfilePhoto = useCallback(
    async (file: File) => {
      const url = await fileToUrl(file);
      onChange({ profilePhoto: file, profilePhotoUrl: url });
    },
    [onChange]
  );

  return (
    <div className="animate-fade-in-up flex flex-col gap-5">
      <div>
        <h2 className="font-display text-2xl mb-1" style={{ fontWeight: 400 }}>
          Основная информация
        </h2>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Расскажите о себе — это увидят клиенты
        </p>
      </div>

      <MonetizationBox />

      {/* Profile photo */}
      <div className="flex items-center gap-5">
        <PhotoUploadBox url={data.profilePhotoUrl} onFile={handleProfilePhoto} label="Фото" size="lg" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>
            Фото профиля
          </p>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            Клиенты выбирают стилиста по первому впечатлению. Используйте
            профессиональное фото.
          </p>
        </div>
      </div>

      {/* Full name */}
      <div>
        <FieldLabel>Полное имя *</FieldLabel>
        <TextInput
          value={data.fullName}
          onChange={(v) => onChange({ fullName: v })}
          placeholder="Имя Фамилия"
        />
      </div>

      {/* City */}
      <div>
        <FieldLabel>Город *</FieldLabel>
        <TextInput
          value={data.city}
          onChange={(v) => onChange({ city: v })}
          placeholder="Москва"
        />
      </div>

      {/* Experience slider */}
      <div>
        <FieldLabel>Опыт работы: {data.experience} {experienceLabel(data.experience)}</FieldLabel>
        <div className="flex items-center gap-3 mt-2">
          <span className="label-cap" style={{ minWidth: 20, color: "hsl(var(--muted-foreground))" }}>1</span>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={data.experience}
            onChange={(e) => onChange({ experience: Number(e.target.value) })}
            className="flex-1"
            style={{ accentColor: "hsl(var(--foreground))", cursor: "pointer" }}
          />
          <span className="label-cap" style={{ minWidth: 24, color: "hsl(var(--muted-foreground))" }}>30</span>
        </div>
      </div>

      {/* Phone */}
      <div>
        <FieldLabel>Телефон *</FieldLabel>
        <TextInput
          value={data.phone}
          onChange={(v) => onChange({ phone: v })}
          placeholder="+7 (999) 000-00-00"
          type="tel"
        />
      </div>

      {/* Email */}
      <div>
        <FieldLabel>Email *</FieldLabel>
        <TextInput
          value={data.email}
          onChange={(v) => onChange({ email: v })}
          placeholder="stylist@example.com"
          type="email"
        />
      </div>

      {/* Social */}
      <div>
        <FieldLabel>Instagram / TikTok</FieldLabel>
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            @
          </span>
          <input
            type="text"
            value={data.socialHandle}
            onChange={(e) => onChange({ socialHandle: e.target.value })}
            placeholder="username"
            className="w-full h-11 pl-7 pr-3 text-sm bg-background border border-border outline-none focus:border-foreground transition-colors"
            style={{ borderRadius: "var(--radius)", fontFamily: "Inter, sans-serif" }}
          />
        </div>
      </div>
    </div>
  );
}

function experienceLabel(n: number): string {
  if (n === 1) return "год";
  if (n >= 2 && n <= 4) return "года";
  return "лет";
}

// ---------------------------------------------------------------------------
// Step 2 — Portfolio
// ---------------------------------------------------------------------------

function Step2({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addPortfolioPhoto = useCallback(
    async (file: File) => {
      if (data.portfolioPhotos.length >= 6) return;
      const url = await fileToUrl(file);
      onChange({
        portfolioPhotos: [...data.portfolioPhotos, file],
        portfolioUrls: [...data.portfolioUrls, url],
      });
    },
    [data, onChange]
  );

  const removePhoto = useCallback(
    (index: number) => {
      const photos = data.portfolioPhotos.filter((_, i) => i !== index);
      const urls = data.portfolioUrls.filter((_, i) => i !== index);
      onChange({ portfolioPhotos: photos, portfolioUrls: urls });
    },
    [data, onChange]
  );

  const toggleSpec = useCallback(
    (spec: string) => {
      const current = data.specializations;
      const next = current.includes(spec)
        ? current.filter((s) => s !== spec)
        : [...current, spec];
      onChange({ specializations: next });
    },
    [data.specializations, onChange]
  );

  return (
    <div className="animate-fade-in-up flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl mb-1" style={{ fontWeight: 400 }}>
          Портфолио
        </h2>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Покажите свои лучшие работы — до 6 фотографий
        </p>
      </div>

      {/* Portfolio grid */}
      <div>
        <FieldLabel>Фотографии работ ({data.portfolioUrls.length}/6)</FieldLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginTop: 8,
          }}
        >
          {data.portfolioUrls.map((url, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Удалить фото"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}

          {/* Add slot */}
          {data.portfolioUrls.length < 6 && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addPortfolioPhoto(f);
                  // reset so same file can be re-selected
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  aspectRatio: "1",
                  border: "1px dashed hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  background: "hsl(var(--muted))",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--foreground))"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--border))"; }}
                aria-label="Добавить фото"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 4v14M4 11h14" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Specializations */}
      <div>
        <FieldLabel>Специализация *</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          {SPECIALIZATIONS.map((spec) => {
            const active = data.specializations.includes(spec);
            return (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpec(spec)}
                className="tag-pill"
                style={{
                  borderColor: active ? "hsl(var(--foreground))" : "hsl(var(--border))",
                  color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                  background: active ? "hsl(var(--foreground))" : "transparent",
                  ...(active ? { color: "hsl(var(--background))" } : {}),
                  transition: "all 0.15s",
                }}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bio */}
      <div>
        <FieldLabel>О себе</FieldLabel>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Расскажите о своём подходе к стилю, опыте и специализации..."
          rows={5}
          className="w-full px-3 py-2.5 text-sm bg-background border border-border outline-none focus:border-foreground transition-colors resize-none"
          style={{
            borderRadius: "var(--radius)",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            color: "hsl(var(--foreground))",
          }}
        />
        <p className="label-cap mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          {data.bio.length} / 500 символов
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Verification
// ---------------------------------------------------------------------------

function Step3({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  const docRef = useRef<HTMLInputElement>(null);
  const diplomaRef = useRef<HTMLInputElement>(null);

  const handleDocPhoto = useCallback(
    async (file: File) => {
      const url = await fileToUrl(file);
      onChange({ documentPhoto: file, documentPhotoUrl: url });
    },
    [onChange]
  );

  const handleDiploma = useCallback(
    (file: File) => {
      onChange({ diplomaFile: file, diplomaFileName: file.name });
    },
    [onChange]
  );

  return (
    <div className="animate-fade-in-up flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl mb-1" style={{ fontWeight: 400 }}>
          Верификация
        </h2>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Подтвердите личность и профессиональную квалификацию
        </p>
      </div>

      {/* Why verification box */}
      <div
        style={{
          padding: "14px 18px",
          background: "hsl(var(--muted))",
          borderRadius: "var(--radius)",
          border: "1px solid hsl(var(--border))",
        }}
      >
        <p className="label-cap mb-1.5" style={{ color: "hsl(var(--foreground))" }}>
          Зачем это нужно
        </p>
        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", lineHeight: 1.6 }}>
          Верификация защищает клиентов и подтверждает вашу экспертизу.
          Проверенные стилисты получают значок и приоритет в поиске.
        </p>
      </div>

      {/* Document photo */}
      <div>
        <FieldLabel>Фото документа (паспорт / ID) *</FieldLabel>
        <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
          Фото или скан первой страницы паспорта — только для верификации, не публикуется
        </p>
        <div className="flex items-center gap-4">
          <input
            ref={docRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleDocPhoto(f);
            }}
          />
          {data.documentPhotoUrl ? (
            <div
              style={{
                position: "relative",
                width: 120,
                height: 80,
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                overflow: "hidden",
              }}
            >
              <img src={data.documentPhotoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                type="button"
                onClick={() => onChange({ documentPhoto: null, documentPhotoUrl: null })}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.55)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => docRef.current?.click()}
              className="btn-ghost-zara flex items-center gap-2"
              style={{ height: 44, fontSize: 11 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Загрузить фото
            </button>
          )}
        </div>
      </div>

      {/* Diploma / proof */}
      <div>
        <FieldLabel>Диплом или подтверждение образования</FieldLabel>
        <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
          Сертификат курса, диплом колледжа / вуза по специальности (PDF, JPG, PNG)
        </p>
        <input
          ref={diplomaRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleDiploma(f);
          }}
        />
        {data.diplomaFileName ? (
          <div className="flex items-center gap-3">
            <div
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                background: "hsl(var(--muted))",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <path d="M8 1H2a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V6L8 1z" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M8 1v5h5" stroke="hsl(var(--muted-foreground))" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs truncate" style={{ color: "hsl(var(--foreground))" }}>
                {data.diplomaFileName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onChange({ diplomaFile: null, diplomaFileName: null })}
              className="btn-ghost-zara"
              style={{ height: 38, padding: "0 12px", fontSize: 11 }}
            >
              Убрать
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => diplomaRef.current?.click()}
            className="btn-ghost-zara flex items-center gap-2"
            style={{ height: 44, fontSize: 11 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Загрузить документ
          </button>
        )}
      </div>

      {/* Terms */}
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          cursor: "pointer",
          padding: "14px 16px",
          border: "1px solid",
          borderColor: data.agreedToTerms ? "hsl(var(--foreground))" : "hsl(var(--border))",
          borderRadius: "var(--radius)",
          transition: "border-color 0.2s",
        }}
      >
        {/* Custom checkbox */}
        <div
          style={{
            width: 18,
            height: 18,
            border: "1px solid",
            borderColor: data.agreedToTerms ? "hsl(var(--foreground))" : "hsl(var(--border))",
            borderRadius: 2,
            background: data.agreedToTerms ? "hsl(var(--foreground))" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 1,
            transition: "all 0.15s",
          }}
        >
          {data.agreedToTerms && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4l3 3 5-6" stroke="hsl(var(--background))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          className="hidden"
          checked={data.agreedToTerms}
          onChange={(e) => onChange({ agreedToTerms: e.target.checked })}
        />
        <span className="text-xs" style={{ color: "hsl(var(--foreground))", lineHeight: 1.6 }}>
          Я согласен(а) с{" "}
          <span style={{ textDecoration: "underline", cursor: "pointer" }}>
            условиями работы стилиста
          </span>{" "}
          на платформе B&G Style, включая политику комиссий, стандарты качества
          и правила взаимодействия с клиентами.
        </span>
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Success
// ---------------------------------------------------------------------------

function Step4({ onBack }: { onBack: () => void }) {
  const timeline = [
    { label: "Заявка получена", status: "done" },
    { label: "Проверка документов", sublabel: "2–3 рабочих дня", status: "pending" },
    { label: "Собеседование", sublabel: "Звонок с командой", status: "upcoming" },
    { label: "Доступ к платформе", sublabel: "Активация аккаунта", status: "upcoming" },
  ];

  return (
    <div className="animate-fade-in-up flex flex-col items-center gap-8 py-8 text-center">
      {/* Checkmark circle */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          border: "1px solid hsl(var(--foreground))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
          <path
            d="M2 11l8 8 16-18"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        <h2 className="font-display text-3xl mb-2" style={{ fontWeight: 400 }}>
          Заявка отправлена
        </h2>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))", maxWidth: 300 }}>
          Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.
        </p>
      </div>

      {/* Timeline */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          textAlign: "left",
        }}
      >
        <p className="label-cap mb-4" style={{ textAlign: "center" }}>
          Этапы проверки
        </p>
        <div className="flex flex-col">
          {timeline.map((item, i) => (
            <div key={i} className="flex items-stretch gap-4">
              {/* Icon column */}
              <div className="flex flex-col items-center" style={{ width: 24, flexShrink: 0 }}>
                {/* Circle */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "1px solid",
                    borderColor:
                      item.status === "done"
                        ? "hsl(var(--foreground))"
                        : item.status === "pending"
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--border))",
                    background:
                      item.status === "done" ? "hsl(var(--foreground))" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.status === "done" ? (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5l3 3 6-7" stroke="hsl(var(--background))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : item.status === "pending" ? (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "hsl(var(--foreground))",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "hsl(var(--border))",
                      }}
                    />
                  )}
                </div>
                {/* Connector */}
                {i < timeline.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      width: 1,
                      background:
                        item.status === "done"
                          ? "hsl(var(--foreground))"
                          : "hsl(var(--border))",
                      minHeight: 28,
                      margin: "3px 0",
                    }}
                  />
                )}
              </div>

              {/* Text */}
              <div style={{ paddingBottom: i < timeline.length - 1 ? 24 : 0 }}>
                <p
                  className="text-sm"
                  style={{
                    fontWeight: item.status === "done" ? 500 : 300,
                    color:
                      item.status === "upcoming"
                        ? "hsl(var(--muted-foreground))"
                        : "hsl(var(--foreground))",
                    lineHeight: "24px",
                  }}
                >
                  {item.label}
                  {item.status === "done" && (
                    <span
                      className="label-cap ml-2"
                      style={{ color: "hsl(var(--foreground))", fontSize: 9 }}
                    >
                      ✓
                    </span>
                  )}
                </p>
                {item.sublabel && (
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))", marginTop: 1 }}>
                    {item.sublabel}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBack}
        className="btn-zara w-full"
        style={{ maxWidth: 360 }}
      >
        Вернуться на главную
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateStep(step: Step, data: FormData): string | null {
  if (step === 1) {
    if (!data.fullName.trim()) return "Введите полное имя";
    if (!data.city.trim()) return "Введите город";
    if (!data.phone.trim()) return "Введите телефон";
    if (!data.email.trim()) return "Введите email";
  }
  if (step === 2) {
    if (data.specializations.length === 0) return "Выберите хотя бы одну специализацию";
  }
  if (step === 3) {
    if (!data.documentPhotoUrl) return "Загрузите фото документа";
    if (!data.agreedToTerms) return "Примите условия работы";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StylistRegister({ onBack }: StylistRegisterProps) {
  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FormData>({
    fullName: "",
    city: "",
    experience: 3,
    phone: "",
    email: "",
    socialHandle: "",
    profilePhoto: null,
    profilePhotoUrl: null,
    portfolioPhotos: [],
    portfolioUrls: [],
    specializations: [],
    bio: "",
    documentPhoto: null,
    documentPhotoUrl: null,
    diplomaFile: null,
    diplomaFileName: null,
    agreedToTerms: false,
  });

  const handleChange = useCallback((patch: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setError(null);
  }, []);

  const handleNext = () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    } else {
      // Submit -> success
      setStep(4);
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setError(null);
    if (step === 1) {
      onBack();
    } else {
      setStep((s) => (s - 1) as Step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
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
          zIndex: 10,
        }}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
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
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="label-cap" style={{ color: "hsl(var(--foreground))" }}>
            {step === 1 ? "Назад" : "Предыдущий шаг"}
          </span>
        </button>

        {/* Brand */}
        <span
          className="font-display"
          style={{ fontSize: 16, fontWeight: 400, letterSpacing: "0.04em" }}
        >
          B&G Style
        </span>

        {/* Step indicator (hidden on step 4) */}
        {step < 4 ? (
          <span className="label-cap" style={{ color: "hsl(var(--muted-foreground))" }}>
            {step} / {TOTAL_STEPS}
          </span>
        ) : (
          <span style={{ width: 48 }} />
        )}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main
        style={{
          flex: 1,
          maxWidth: 480,
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px 120px",
          boxSizing: "border-box",
        }}
      >
        {/* Progress bar — only for steps 1-3 */}
        {step < 4 && <ProgressBar step={step} />}

        {/* Step content */}
        {step === 1 && <Step1 data={data} onChange={handleChange} />}
        {step === 2 && <Step2 data={data} onChange={handleChange} />}
        {step === 3 && <Step3 data={data} onChange={handleChange} />}
        {step === 4 && <Step4 onBack={onBack} />}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Fixed bottom CTA — hidden on success step                           */}
      {/* ------------------------------------------------------------------ */}
      {step < 4 && (
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
          {/* Validation error */}
          {error && (
            <p
              className="animate-fade-in text-xs"
              style={{ color: "hsl(var(--destructive))", textAlign: "center" }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              width: "100%",
              maxWidth: 480,
              display: "flex",
              gap: 12,
            }}
          >
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-ghost-zara"
                style={{ flex: "0 0 auto", minWidth: 80 }}
              >
                Назад
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="btn-zara"
              style={{ flex: 1 }}
            >
              {step === 3 ? "Оставить заявку" : "Продолжить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
