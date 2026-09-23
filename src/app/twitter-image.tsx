import { OG_ALT, OG_SIZE } from "@/lib/og-constants";
import { renderOgImage } from "@/lib/og-image";

export const alt = OG_ALT;
export const size = { width: OG_SIZE.width, height: OG_SIZE.height };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
