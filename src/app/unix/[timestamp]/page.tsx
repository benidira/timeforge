import { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, Calendar, Hash } from "lucide-react";
import { absoluteUrl } from "@/lib/site";
import { AdSlot } from "@/components/ad-slot";

interface Props {
  params: { timestamp: string };
}

// Generate dynamic metadata for Google SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ts = parseInt(params.timestamp, 10);
  const isMs = params.timestamp.length > 10;
  const date = new Date(isMs ? ts : ts * 1000);
  
  const formatted = date.toUTCString();
  const iso = date.toISOString();

  return {
    title: `Unix Timestamp ${params.timestamp} to Date | Castov`,
    description: `Convert Unix Epoch timestamp ${params.timestamp} to human-readable date. The timestamp ${params.timestamp} translates to ${formatted} (ISO: ${iso}).`,
    alternates: {
      canonical: absoluteUrl(`/unix/${params.timestamp}`),
    },
  };
}

export default function UnixTimestampPseoPage({ params }: Props) {
  const tsString = params.timestamp;
  const ts = parseInt(tsString, 10);
  
  if (isNaN(ts)) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Invalid Timestamp</h1>
        <p className="text-muted">The provided timestamp is not a valid number.</p>
        <Link href="/unix-timestamp-converter" className="text-primary hover:underline mt-4 inline-block">Go to Converter</Link>
      </div>
    );
  }

  const isMs = tsString.length > 10;
  const date = new Date(isMs ? ts : ts * 1000);
  
  const utcString = date.toUTCString();
  const isoString = date.toISOString();
  const localString = date.toString();
  const relativeTime = getRelativeTime(date);

  return (
    <div className="bg-bg min-h-screen text-fg pb-20">
      <div className="container max-w-4xl mx-auto px-4 pt-16">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-muted mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-fg transition-colors">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <Link href="/unix-timestamp-converter" className="hover:text-fg transition-colors">Unix Converter</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-fg font-medium">{tsString}</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Timestamp <span className="text-primary">{tsString}</span>
        </h1>
        <p className="text-xl text-muted mb-10">
          Detailed conversion and analysis for the Unix epoch timestamp <code className="bg-field px-2 py-1 rounded text-fg">{tsString}</code>.
        </p>

        <AdSlot placement="content-middle" />

        {/* Data Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          
          <div className="card p-6 border border-line bg-card shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Calendar size={24} />
              <h2 className="text-xl font-bold text-fg">UTC Date & Time</h2>
            </div>
            <p className="text-2xl font-mono text-fg break-words mb-2">{utcString}</p>
            <p className="text-sm text-muted">Universal Time Coordinated (GMT)</p>
          </div>

          <div className="card p-6 border border-line bg-card shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-accent">
              <Hash size={24} />
              <h2 className="text-xl font-bold text-fg">ISO 8601 Format</h2>
            </div>
            <p className="text-2xl font-mono text-fg break-words mb-2">{isoString}</p>
            <p className="text-sm text-muted">Standard internet time profile</p>
          </div>

          <div className="card p-6 border border-line bg-card shadow-sm rounded-2xl md:col-span-2">
            <div className="flex items-center gap-3 mb-4 text-success">
              <Clock size={24} />
              <h2 className="text-xl font-bold text-fg">Local & Relative Time</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-fg mb-1">Your Local Timezone:</p>
                <p className="font-mono text-muted text-sm break-words">{localString}</p>
              </div>
              <div>
                <p className="font-semibold text-fg mb-1">Relative to Now:</p>
                <p className="font-mono text-muted text-sm">{relativeTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 bg-field p-8 rounded-3xl border border-line">
          <h3 className="text-2xl font-bold mb-4">Technical Breakdown</h3>
          <ul className="space-y-4 text-muted">
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
              <span><strong>Unit:</strong> This timestamp is assumed to be in <strong>{isMs ? "Milliseconds" : "Seconds"}</strong> based on its length ({tsString.length} digits).</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
              <span><strong>Definition:</strong> It represents exactly {tsString} {isMs ? "milliseconds" : "seconds"} elapsed since the Unix Epoch (January 1st, 1970 at 00:00:00 UTC), ignoring leap seconds.</span>
            </li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <Link href="/unix-timestamp-converter" className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-xl font-bold hover:bg-accent-hover transition-colors shadow-lg">
            Convert another timestamp <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper to get relative time string
function getRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (Math.abs(diffDays) > 0) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) > 0) return rtf.format(diffHours, 'hour');
  return rtf.format(diffMinutes, 'minute');
}
