import { motion as Motion } from "framer-motion";

const DOODLES = [":)", "?", "!", "car", "sun", "hat", "box", "cat", "zip", "key", "cup", "pen"];
const DOODLE_ANIMATION = DOODLES.map((_, index) => ({
  delay: (index % 4) * 0.5,
  duration: 3 + (index % 3) * 0.5,
}));

export function DoodleLayer({ static: isStatic = false }) {
  return (
    <div className="doodles" aria-hidden="true">
      {DOODLES.map((item, index) => (
        isStatic ? (
          <span key={`${item}-${index}`}>{item}</span>
        ) : (
          <Motion.span
            key={`${item}-${index}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -10, 0],
            }}
            transition={{
              opacity: { delay: index * 0.1, duration: 0.5 },
              scale: { delay: index * 0.1, duration: 0.5 },
              y: {
                repeat: Infinity,
                duration: DOODLE_ANIMATION[index].duration,
                ease: "easeInOut",
                delay: DOODLE_ANIMATION[index].delay,
              },
            }}
          >
            {item}
          </Motion.span>
        )
      ))}
    </div>
  );
}
