import { motion as Motion } from "framer-motion";
import { MiniAvatar } from "../ui/MiniAvatar";
import { PALETTE } from "../../utils/constants";

export function AvatarParade() {
  return (
    <Motion.div
      className="mt-2 flex justify-center gap-1.5"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.5,
          },
        },
      }}
    >
      {PALETTE.slice(1).map((color, index) => (
        <Motion.div
          key={color}
          variants={{
            hidden: { y: 20, opacity: 0, scale: 0.8 },
            visible: { y: 0, opacity: 1, scale: 1 },
          }}
          transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
          whileHover={{ scale: 1.2, rotate: 10 }}
        >
          <MiniAvatar color={color} />
        </Motion.div>
      ))}
    </Motion.div>
  );
}
