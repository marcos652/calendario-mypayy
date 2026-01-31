import { useEffect, useRef } from "react";

export function MascotFace({
  lookAt,
  mouthState,
  lookAway
}: {
  lookAt: { x: number; y: number } | null;
  mouthState: "neutral" | "error";
  lookAway: boolean;
}) {
  // SVG mascot with eyes and mouth that move/react
  // Eye positions
  const leftEye = useRef<SVGCircleElement>(null);
  const rightEye = useRef<SVGCircleElement>(null);
  const leftPupil = useRef<SVGCircleElement>(null);
  const rightPupil = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Animate pupils to follow mouse or look away
    const movePupil = (eye: SVGCircleElement | null, pupil: SVGCircleElement | null, dx: number, dy: number) => {
      if (!eye || !pupil) return;
      const maxDist = 6;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist > maxDist ? maxDist / dist : 1;
      pupil.setAttribute("cx", String(eye.cx.baseVal.value + dx * scale));
      pupil.setAttribute("cy", String(eye.cy.baseVal.value + dy * scale));
    };
    if (lookAway) {
      // Look to the right (hide password)
      movePupil(leftEye.current, leftPupil.current, 10, 0);
      movePupil(rightEye.current, rightPupil.current, 10, 0);
    } else if (lookAt) {
      // Map mouse position to mascot face
      const dx = (lookAt.x - 60) / 10;
      const dy = (lookAt.y - 60) / 10;
      movePupil(leftEye.current, leftPupil.current, dx, dy);
      movePupil(rightEye.current, rightPupil.current, dx, dy);
    } else {
      // Center
      movePupil(leftEye.current, leftPupil.current, 0, 0);
      movePupil(rightEye.current, rightPupil.current, 0, 0);
    }
  }, [lookAt, lookAway]);

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="55" fill="#f1f5f9" stroke="#22c55e" strokeWidth="4" />
      {/* Eyes */}
      <circle ref={leftEye} cx="45" cy="60" r="14" fill="#fff" stroke="#222" strokeWidth="2" />
      <circle ref={rightEye} cx="75" cy="60" r="14" fill="#fff" stroke="#222" strokeWidth="2" />
      {/* Pupils */}
      <circle ref={leftPupil} cx="45" cy="60" r="5" fill="#222" />
      <circle ref={rightPupil} cx="75" cy="60" r="5" fill="#222" />
      {/* Mouth */}
      {mouthState === "error" ? (
        <path d="M45 85 Q60 70 75 85" stroke="#e11d48" strokeWidth="4" fill="none" />
      ) : (
        <path d="M45 80 Q60 95 75 80" stroke="#22c55e" strokeWidth="4" fill="none" />
      )}
    </svg>
  );
}
