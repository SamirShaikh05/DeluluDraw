import { MiniAvatar } from "../ui/MiniAvatar";
import { PALETTE } from "../../utils/constants";

export function AvatarParade() {
  return (
    <div className="mt-2 flex justify-center gap-1.5">
      {PALETTE.slice(1).map((color) => <MiniAvatar color={color} key={color} />)}
    </div>
  );
}
