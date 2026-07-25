import Image from "next/image";

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export const BrandMark = ({ className, size = 32 }: BrandMarkProps) => (
  <Image
    alt=""
    aria-hidden="true"
    className={className}
    height={size}
    src="/logo.svg"
    width={size}
  />
);
