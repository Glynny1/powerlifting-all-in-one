import type { LucideIcon } from 'lucide-react';
import {
  Waves,
  Move3d,
  Anchor,
  Zap,
  Route,
  Rocket,
  Flame,
  Dumbbell,
  Activity,
  Timer,
  HeartPulse,
  Wind,
  Footprints,
  Target,
  CircleDot,
} from 'lucide-react';

/**
 * Registry of selectable stage icons. Stored by string key on the stage so the
 * data model stays serialisable (no component references in localStorage).
 */
export const STAGE_ICONS: Record<string, LucideIcon> = {
  waves: Waves,
  move: Move3d,
  anchor: Anchor,
  zap: Zap,
  route: Route,
  rocket: Rocket,
  flame: Flame,
  dumbbell: Dumbbell,
  activity: Activity,
  timer: Timer,
  heart: HeartPulse,
  wind: Wind,
  footprints: Footprints,
  target: Target,
  dot: CircleDot,
};

export const STAGE_ICON_KEYS = Object.keys(STAGE_ICONS);

export function getStageIcon(key?: string): LucideIcon {
  if (key && STAGE_ICONS[key]) return STAGE_ICONS[key];
  return CircleDot;
}
