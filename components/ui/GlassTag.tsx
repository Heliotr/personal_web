interface GlassTagProps {
  children: React.ReactNode;
  color?: "gold" | "green" | "blue" | "purple" | "red";
  size?: "sm" | "md";
}

export function GlassTag({
  children,
  color = "gold",
  size = "sm",
}: GlassTagProps) {
  const colors = {
    gold: "bg-forest-gold/20 text-forest-gold border-forest-gold/30",
    green: "bg-forest-green/20 text-forest-accent border-forest-green/30",
    blue: "bg-forest-blue/20 text-forest-blue border-forest-blue/30",
    purple: "bg-purple-900/30 text-purple-300 border-purple-700/30",
    red: "bg-red-900/30 text-red-300 border-red-700/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center border ${colors[color]} ${sizes[size]}
        rounded-full
      `}
    >
      {children}
    </span>
  );
}