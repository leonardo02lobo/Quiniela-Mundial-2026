import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { TileBand } from "@/components/layout/tile-band";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/predictions/groups");

  const { callbackUrl } = await searchParams;
  const redirectTo = callbackUrl ?? "/predictions/groups";

  return (
    <section className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16">
      <div className="w-full border border-ink bg-paper">
        <TileBand className="h-3" />
        <div className="flex items-center justify-between border-b border-rule px-6 py-3">
          <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ink">
            FIFA · 2026
          </span>
          <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-card-red">
            Quiniela
          </span>
        </div>

        <div className="px-6 py-8">
          <h1 className="font-display text-3xl font-bold uppercase leading-none tracking-tight text-ink">
            Asegura tus pronósticos.
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Inicia sesión para enviar pronósticos de cada fase de grupos y cada partido
            eliminatorio del Mundial 2026.
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo });
            }}
            className="mt-8"
          >
            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-3 border-2 border-ink bg-ink px-4 py-3 font-display text-sm font-bold uppercase tracking-wider text-chalk transition hover:bg-card-red hover:border-card-red"
            >
              <GoogleMark />
              <span>Continuar con Google</span>
            </button>
          </form>

          <p className="mt-6 border-t border-rule pt-4 text-xs text-ink-faint">
            Al iniciar sesión te comprometes a hacer pronósticos honestos. No se permiten
            ediciones después del pitazo inicial.
          </p>
        </div>
        <TileBand className="h-3" />
      </div>
    </section>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M21.8 10.2H12v3.7h5.6c-.5 2.4-2.6 4.1-5.6 4.1-3.4 0-6.2-2.8-6.2-6.2S8.6 5.6 12 5.6c1.5 0 2.9.6 4 1.5l2.6-2.6C16.9 2.9 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.7-4.1 9.7-9.9 0-.7-.1-1.3-.2-1.9z"
      />
      <path
        fill="#FF3D00"
        d="M2.9 7.3l3 2.2C6.8 7.6 9.2 6 12 6c1.5 0 2.9.6 4 1.5l2.6-2.6C16.9 2.9 14.6 2 12 2 8.2 2 4.9 4.1 2.9 7.3z"
      />
      <path
        fill="#4CAF50"
        d="M12 22c2.6 0 4.9-.9 6.6-2.4l-3-2.5c-.9.6-2.1 1-3.6 1-2.9 0-5.4-1.9-6.3-4.5l-3 2.3C4.6 19.7 8 22 12 22z"
      />
      <path
        fill="#1976D2"
        d="M21.8 10.2H12v3.7h5.6c-.3 1.2-1 2.3-2 3.1l3 2.5c1.7-1.6 2.8-4 2.8-7.4 0-.7-.1-1.3-.2-1.9z"
      />
    </svg>
  );
}
