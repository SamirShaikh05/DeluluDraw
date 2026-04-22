import { motion } from "framer-motion";

const DOODLES = [":)", "?", "!", "car", "sun", "hat", "box", "cat", "zip", "key", "cup", "pen"];

export function DoodleLayer({ static: isStatic = false }) {
  return (
    <div className="doodles" aria-hidden="true">
      {DOODLES.map((item, index) => (
        isStatic ? (
          <span key={`${item}-${index}`}>{item}</span>
        ) : (
          <motion.span
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
                duration: 3 + Math.random() * 2,
                ease: "easeInOut",
                delay: Math.random() * 2,
              },
            }}
          >
            {item}
          </motion.span>
        )
      ))}
    </div>
  );
}
