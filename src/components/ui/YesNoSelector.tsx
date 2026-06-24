"use client";

interface YesNoSelectorProps {
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  label: string;
  disabled?: boolean;
}

export function YesNoSelector({ value, onChange, label, disabled }: YesNoSelectorProps) {
  const handleSelect = (btn: boolean) => {
    if (disabled) return;
    if (value === btn) {
      onChange(null); // Click on active button toggles it back to neutral (null)
    } else {
      onChange(btn);
    }
  };

  return (
    <div className="flex items-center justify-between py-1.5 w-full select-none" style={{ minHeight: "36px" }}>
      <span className="text-[12px] font-medium leading-none" style={{ color: "var(--p-text-2)", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect(true)}
          style={{
            height: "22px",
            padding: "0 10px",
            borderRadius: "3px",
            fontSize: "10.5px",
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            border: value === true ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--p-border)",
            background: value === true ? "rgba(16, 185, 129, 0.12)" : "var(--p-surface-2)",
            color: value === true ? "#10b981" : "var(--p-text-3)",
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && value !== true) {
              e.currentTarget.style.background = "var(--p-surface-3)";
              e.currentTarget.style.color = "var(--p-text-2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && value !== true) {
              e.currentTarget.style.background = "var(--p-surface-2)";
              e.currentTarget.style.color = "var(--p-text-3)";
            }
          }}
        >
          Sí
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleSelect(false)}
          style={{
            height: "22px",
            padding: "0 10px",
            borderRadius: "3px",
            fontSize: "10.5px",
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            border: value === false ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--p-border)",
            background: value === false ? "rgba(239, 68, 68, 0.12)" : "var(--p-surface-2)",
            color: value === false ? "#ef4444" : "var(--p-text-3)",
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && value !== false) {
              e.currentTarget.style.background = "var(--p-surface-3)";
              e.currentTarget.style.color = "var(--p-text-2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && value !== false) {
              e.currentTarget.style.background = "var(--p-surface-2)";
              e.currentTarget.style.color = "var(--p-text-3)";
            }
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}
