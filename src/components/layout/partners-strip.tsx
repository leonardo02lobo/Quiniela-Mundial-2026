import Image from "next/image";
import { cn } from "@/lib/utils";

interface Partner {
  /** Human-readable name used for the alt text and link label. */
  name: string;
  /** Instagram handle without the leading @ — used to build the link target. */
  handle: string;
  /** Path under /public. */
  logoSrc: string;
}

const PARTNERS: Partner[] = [
  { name: "Megavisión", handle: "megavision.ve", logoSrc: "/assets/partners/megavision.png" },
  { name: "Don Chorizo", handle: "eldonchorizo", logoSrc: "/assets/partners/don-chorizo.png" },
  { name: "Unóptica", handle: "unoptica.sc", logoSrc: "/assets/partners/unoptica.png" },
  { name: "Tucentro Net", handle: "tucentronet1", logoSrc: "/assets/partners/tucentro-net.png" },
  { name: "Hello World Cup", handle: "helloworldcup_", logoSrc: "/assets/partners/hwc.png" },
  { name: "Smarket", handle: "tusmarketve", logoSrc: "/assets/partners/smarket.png" },
  { name: "Deportes Tifany", handle: "deportestifanys", logoSrc: "/assets/partners/tifany.png" },
  { name: "Pizzería El Punto", handle: "pizzeriaelpunto_sc", logoSrc: "/assets/partners/pizzeria-el-punto.png" },
  { name: "Gogoroyal", handle: "gogoroyalve", logoSrc: "/assets/partners/gogoroyal.jpg" },
  { name: "Diario del Pueblo", handle: "diariodlpueblo", logoSrc: "/assets/partners/diario-del-pueblo.png" },
];

const PHONE_ROW_ONE = PARTNERS.slice(0, 5);
const PHONE_ROW_TWO = PARTNERS.slice(5);

interface PartnersStripProps {
  className?: string;
  /** Show the "Patrocinadores" caption above the logos. */
  withLabel?: boolean;
  /** Force the two-row stacked layout regardless of breakpoint. For narrow containers. */
  stacked?: boolean;
}

/**
 * Partner logo strip. Each logo links to the partner's Instagram in a
 * new tab. On phones the row breaks into two centered rows (5 + 5) so
 * logos stay legible; on sm+ everything sits on a single centered row.
 * Pass `stacked` to keep the two-row layout even on sm+ (for narrow cards).
 */
export function PartnersStrip({ className, withLabel = false, stacked = false }: PartnersStripProps) {
  return (
    <aside
      aria-label="Patrocinadores"
      className={cn("border-t border-rule bg-floodlight", className)}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-3 sm:px-6">
        {withLabel && (
          <span className="font-display text-[9px] font-medium uppercase tracking-[0.22em] text-ink-faint">
            Patrocinadores
          </span>
        )}

        {/* Two centered rows (5 + 5) — always on phones, also on sm+ when stacked */}
        <div className={cn("flex w-full flex-col items-center gap-3", !stacked && "sm:hidden")}>
          <PartnerRow partners={PHONE_ROW_ONE} compact={stacked} />
          <PartnerRow partners={PHONE_ROW_TWO} compact={stacked} />
        </div>

        {/* sm+: single centered row (suppressed when stacked) */}
        {!stacked && (
          <ul className="hidden w-full items-center justify-center gap-6 sm:flex">
            {PARTNERS.map((p) => (
              <li key={p.handle} className="shrink-0">
                <PartnerLink partner={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

function PartnerRow({ partners, compact = false }: { partners: Partner[]; compact?: boolean }) {
  return (
    <ul className="flex items-center justify-center gap-4">
      {partners.map((p) => (
        <li key={p.handle} className="shrink-0">
          <PartnerLink partner={p} compact={compact} />
        </li>
      ))}
    </ul>
  );
}

function PartnerLink({ partner, compact = false }: { partner: Partner; compact?: boolean }) {
  return (
    <a
      href={`https://instagram.com/${partner.handle}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${partner.name} en Instagram (@${partner.handle})`}
      title={`@${partner.handle}`}
      className="block opacity-70 transition-opacity hover:opacity-100"
    >
      <Image
        src={partner.logoSrc}
        alt={`Logo de ${partner.name}`}
        width={160}
        height={64}
        className={cn("w-auto object-contain", compact ? "h-7" : "h-7 sm:h-11")}
      />
    </a>
  );
}
