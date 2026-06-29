import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showName?: boolean;
  size?: "sm" | "md";
}

// PeptideRx brand mark: a calm botanical leaf inside a rounded square,
// reading as considered, modern medicine rather than a generic cross.
export function Logo({ className, showName = true, size = "md" }: LogoProps) {
  const markSize = size === "sm" ? 28 : 34;
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="inline-flex items-center justify-center rounded-[10px] bg-brand"
        style={{ width: markSize, height: markSize }}
      >
        <svg
          width={markSize * 0.62}
          height={markSize * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 21C12 21 4 16.5 4 9.5C4 5.91 6.91 3 10.5 3C12.5 3 12 6 12 6C12 6 11.5 3 13.5 3C17.09 3 20 5.91 20 9.5C20 16.5 12 21 12 21Z"
            fill="#FAF8F4"
            fillOpacity="0.0"
          />
          <path
            d="M12 21V8M12 13C12 13 9 12 7.5 9.5M12 11C12 11 14.5 10 16 7.5"
            stroke="#FAF8F4"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 8C12 8 12.5 4.5 16 4C16 7.5 12 8 12 8Z"
            fill="#C57B57"
          />
        </svg>
      </span>
      {showName && (
        <span
          className={cn(
            "font-serif font-semibold tracking-tight text-ink",
            size === "sm" ? "text-lg" : "text-xl",
          )}
        >
          Peptide<span className="text-brand">Rx</span>
        </span>
      )}
    </span>
  );
}
