import NextImage from "next/image";
import Link from "next/link";

type LogoProps = {
  variant?: "default" | "compact";
  href?: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

const logoSrc = "/logo.png";
const alt = "Our Ears Are Open";

export function Logo({
  variant = "default",
  href = "/",
  className = "",
  priority = false,
  onClick,
}: LogoProps) {
  const width = variant === "compact" ? 220 : 320;
  const height = variant === "compact" ? 52 : 72;

  const content = (
    <NextImage
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={`w-auto object-contain object-left ${variant === "compact" ? "h-11 sm:h-12 max-h-12" : "h-12 sm:h-14 md:h-[3.5rem]"} ${className}`}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex items-center transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
      >
        {content}
      </Link>
    );
  }

  return <span className={`inline-flex items-center ${className}`}>{content}</span>;
}
