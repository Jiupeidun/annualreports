import type { SensoryUIConfig } from "@/components/ui/sensory-ui/config/config";
import type { SoundPlayback } from "@/components/ui/sensory-ui/config/engine";
import type { SoundRole } from "@/components/ui/sensory-ui/config/sound-roles";

type CoverSoundPlayer = () => Promise<SoundPlayback | null>;

const coverSoundRole: SoundRole = "interaction.toggle";
let playerPromise: Promise<CoverSoundPlayer> | null = null;

function shouldSkipSound(): boolean {
  return (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

async function createCoverSoundPlayer(): Promise<CoverSoundPlayer> {
  const [{ playSound }, { mergeConfig, resolveRole }] = await Promise.all([
    import("@/components/ui/sensory-ui/config/engine"),
    import("@/components/ui/sensory-ui/config/config")
  ]);
  const config = mergeConfig({ theme: "soft", volume: 0.12 } satisfies Partial<SensoryUIConfig>);

  return async () => {
    const source = resolveRole(coverSoundRole, config);

    if (!source) {
      return null;
    }

    return playSound(source, { volume: 0.5 * config.volume });
  };
}

export function prepareCoverSound(): void {
  if (shouldSkipSound() || playerPromise) {
    return;
  }

  playerPromise = createCoverSoundPlayer().catch((error: unknown) => {
    playerPromise = null;
    if (import.meta.env.DEV) {
      console.warn("[sensory-ui] Failed to prepare cover sound:", error);
    }
    return async () => null;
  });
}

export function playCoverSound(): void {
  if (shouldSkipSound()) {
    return;
  }

  prepareCoverSound();
  void playerPromise?.then((play) => play()).catch((error: unknown) => {
    playerPromise = null;
    if (import.meta.env.DEV) {
      console.warn("[sensory-ui] Failed to play cover sound:", error);
    }
  });
}
