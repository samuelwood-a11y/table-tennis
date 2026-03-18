import { cn } from "@/lib/utils";

interface TeamAvatarProps {
  name: string;
  primaryColor: string;
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

export function TeamAvatar({ name, primaryColor, imageUrl, size = "md", className }: TeamAvatarProps) {
  if (imageUrl) {
    return (
      <div className={cn("rounded-xl overflow-hidden flex-shrink-0 shadow-lg", imgSizeMap[size], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0",
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: primaryColor }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
