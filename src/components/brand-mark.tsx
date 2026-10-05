import Image from "next/image";

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <Image 
      src="/logo.jpg" 
      alt="Castov Logo" 
      width={size} 
      height={size} 
      className="rounded-lg border border-line shadow-sm object-cover aspect-square"
    />
  );
}
