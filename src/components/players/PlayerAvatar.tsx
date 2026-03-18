import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/group";

interface PlayerAvatarProps {
  name: string;
  avatarColor: string;
  emoji?: string | null;
  imageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-xl",
  xl: "w-20 h-20 text-3xl",
};

const imgSizeMap = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

export function PlayerAvatar({ name, avatarColor, emoji, imageUrl, size = "md", className }: PlayerAvatarProps) {
  if (imageUrl) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden flex-shrink-0 shadow-lg",
          imgSizeMap[size],
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shadow-lg flex-shrink-0",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: avatarColor }}
    >
      {emoji ?? getInitials(name)}
    </div>
  );
}
