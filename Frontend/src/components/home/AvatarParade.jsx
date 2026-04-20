import { MiniAvatar } from "../ui/MiniAvatar";
import { PALETTE } from "../../utils/constants";

export function AvatarParade() {
  return (
    <div className="avatar-parade">
      {PALETTE.slice(1).map((color) => <MiniAvatar color={color} key={color} />)}
    </div>
  );
}
