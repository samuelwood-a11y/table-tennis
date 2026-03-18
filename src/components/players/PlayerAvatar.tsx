import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/group";

interface PlayerAvatarProps {
  name: string;
  avatarColor: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

export function PlayerAvatar({ name, avatarColor, size = "md", className }: PlayerAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shadow-lg flex-shrink-0",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: avatarColor }}
    >
      {getInitials(name)}
    </div>
  );
}
