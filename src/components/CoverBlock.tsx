import Icon, { type IconName } from "./Icon";

interface CoverBlockProps {
  gradient: string;
  icon: IconName;
  className?: string;
  iconClassName?: string;
}

export default function CoverBlock({
  gradient,
  icon,
  className = "",
  iconClassName = "h-10 w-10",
}: CoverBlockProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #fff 0px, #fff 1.5px, transparent 1.5px, transparent 14px)",
        }}
      />
      <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
      <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-black/15 blur-2xl" />

      <div className="relative flex h-[58%] w-[58%] items-center justify-center rounded-full bg-white/20 shadow-inner ring-1 ring-white/40 backdrop-blur-sm">
        <div className="flex h-[70%] w-[70%] items-center justify-center rounded-full bg-white/90 text-brand-ink shadow-lg">
          <Icon name={icon} className={iconClassName} />
        </div>
      </div>
    </div>
  );
}
