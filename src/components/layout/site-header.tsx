import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PartnersStrip } from "@/components/layout/partners-strip";
import { TileBand } from "@/components/layout/tile-band";

const navItems = [
  { href: "/predictions/groups", label: "Grupos" },
  { href: "/predictions/best-thirds", label: "Mejores Terceros" },
  { href: "/predictions/knockout", label: "Eliminatorias" },
  { href: "/leaderboard", label: "Tabla" },
];

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-paper/95 backdrop-blur">
      <TileBand className="h-1.5" />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="rounded-sm bg-ink px-1.5 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-chalk">
            WC26
          </span>
          <span className="font-display text-base font-bold uppercase tracking-[0.14em] text-ink">
            Quiniela
          </span>
        </Link>

        {user && (
          <nav className="hidden items-center gap-0 text-sm sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Avatar className="size-7 border-2 border-ink">
                {user.image && <AvatarImage src={user.image} alt={user.name ?? ""} />}
                <AvatarFallback className="font-display text-xs">
                  {(user.name ?? user.email ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint hover:text-card-red"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="border-2 border-ink bg-ink px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-chalk hover:bg-card-red hover:border-card-red"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
      <PartnersStrip />
    </header>
  );
}
