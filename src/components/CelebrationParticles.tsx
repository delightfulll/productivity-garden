// CelebrationParticles.tsx
import { useEffect, useState, useCallback, memo } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

type Props = {
  trigger: boolean;
  position?: { x: number; y: number };
};

const CelebrationParticles = memo(({ trigger, position }: Props) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (trigger) {
      setOpacity(1);
      const timeout = setTimeout(() => setOpacity(0), 2000);
      return () => clearTimeout(timeout);
    }
  }, [trigger]);

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: position ? `${position.y}px` : "50%",
        left: position ? `${position.x}px` : "50%",
        width: "300px",
        height: "200px",
        pointerEvents: "none",
        zIndex: 9999,
        transform: "translate(-50%, -50%)",
        opacity: opacity,
        transition: "opacity 0.2s ease-in-out",
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: {
            color: {
              value: "transparent",
            },
          },
          particles: {
            number: { value: 30 },
            shape: {
              type: ["circle", "square", "star"],
            },
            color: {
              value: ["#FFD700", "#00BFFF", "#FF69B4", "#ADFF2F", "#FF4500"],
            },
            size: { value: { min: 6, max: 12 } },
            move: {
              enable: true,
              speed: 6,
              direction: "top",
              random: true,
              outModes: { default: "destroy" },
            },
            opacity: {
              value: 1,
            },
            life: {
              duration: {
                sync: true,
                value: 2,
              },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
});

CelebrationParticles.displayName = "CelebrationParticles";

export default CelebrationParticles;
