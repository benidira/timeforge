import type { LanguageEntry } from "../types";

import javascript from "./javascript";
import python from "./python";
import java from "./java";
import go from "./go";
import php from "./php";
import csharp from "./csharp";
import rust from "./rust";
import ruby from "./ruby";
import swift from "./swift";
import kotlin from "./kotlin";
import c from "./c";
import cpp from "./cpp";
import bash from "./bash";
import perl from "./perl";

export const LANGUAGES: LanguageEntry[] = [
  javascript,
  python,
  java,
  go,
  php,
  csharp,
  rust,
  ruby,
  swift,
  kotlin,
  c,
  cpp,
  bash,
  perl,
];

const bySlug = new Map<string, LanguageEntry>(LANGUAGES.map((l) => [l.slug, l]));
export const getLanguage = (slug: string): LanguageEntry | undefined => bySlug.get(slug);

export default LANGUAGES;
