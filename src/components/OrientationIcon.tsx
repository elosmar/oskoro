import { ORIENTATIONS, type Orientation } from "@/lib/data/constants";
import { cx } from "@/ui";

/**
 * Our own pictograms for the Charakoro faces (not the official artwork).
 * Front view (two eyes) for standing / handstand / sideways; lying figures
 * show the face (eyes) when face up and the back of the head when face down.
 * A ground line anchors all of them.
 *
 * Drawn once per page in <OrientationSprite /> (root layout) and referenced
 * with <use>: a move list repeats these icons dozens of times per page.
 */

const GROUND_Y = 21.5;
const symbolId = (orientation: Orientation) => `orientation-${orientation}`;
/** The die has 2 side faces (left/right); no card tells them apart, so one result shows both. */
const viewBoxWidth = (orientation: Orientation) => (orientation === "sideways" ? 48 : 24);

/** Upright front-view figure, feet at y = 20. */
function FrontFigure() {
  return (
    <>
      <circle cx="12" cy="7" r="4" />
      <rect x="8" y="11.5" width="8" height="8.5" rx="2" />
      <circle cx="10.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </>
  );
}

/** Lying figure, head on the left. Face up shows the eyes; face down, the back of the head. */
function LyingFigure({ face }: { face: "up" | "down" }) {
  return (
    <>
      <rect x="11.5" y="13" width="10.5" height="8.5" rx="2" />
      {face === "up" ? (
        <>
          <circle cx="6.5" cy="17" r="4.5" />
          <circle cx="5" cy="15.2" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8" cy="15.2" r="0.9" fill="currentColor" stroke="none" />
        </>
      ) : (
        <circle cx="6.5" cy="17" r="4.5" fill="currentColor" />
      )}
    </>
  );
}

function Figure({ orientation }: { orientation: Orientation }) {
  switch (orientation) {
    case "standing":
      return (
        <g transform="translate(0 1.5)">
          <FrontFigure />
        </g>
      );
    case "handstand":
      return (
        <g transform="translate(0 0.5) rotate(180 12 12)">
          <FrontFigure />
        </g>
      );
    case "faceUp":
      return <LyingFigure face="up" />;
    case "faceDown":
      return <LyingFigure face="down" />;
    case "sideways":
      return (
        <>
          <g transform="translate(0 5.5) rotate(-90 12 12)">
            <FrontFigure />
          </g>
          <g transform="translate(24 5.5) rotate(90 12 12)">
            <FrontFigure />
          </g>
        </>
      );
  }
}

/** Render once per page (root layout). Hidden; only holds the symbols. */
export function OrientationSprite() {
  return (
    <svg aria-hidden focusable="false" width="0" height="0" className="absolute overflow-hidden">
      {ORIENTATIONS.map((o) => {
        const width = viewBoxWidth(o);
        return (
          <symbol key={o} id={symbolId(o)} viewBox={`0 0 ${width} 24`}>
            {/* Stroke styles live here, once, instead of on every icon. */}
            <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <Figure orientation={o} />
              <line x1="2" x2={width - 2} y1={GROUND_Y} y2={GROUND_Y} opacity="0.5" />
            </g>
          </symbol>
        );
      })}
    </svg>
  );
}

const SIZES = { sm: "h-4", md: "h-6" } as const;

/** Decorative: the face name is always shown next to it as text. */
export function OrientationIcon({
  orientation,
  size = "sm",
  className,
}: {
  orientation: Orientation;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth(orientation)} 24`}
      aria-hidden
      className={cx("w-auto shrink-0", SIZES[size], className)}
    >
      <use href={`#${symbolId(orientation)}`} />
    </svg>
  );
}
