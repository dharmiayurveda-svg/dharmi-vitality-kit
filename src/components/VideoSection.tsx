import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useReveal } from "@/hooks/useReveal";

const DEFAULT_YOUTUBE_URLS = ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"];

function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }

    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/embed/")[1] || null;
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname.split("/shorts/")[1] || null;
    }
  } catch {
    return null;
  }

  return null;
}

export default function VideoSection() {
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(DEFAULT_YOUTUBE_URLS);
  const headerRef = useReveal();
  const gridRef = useReveal();

  useEffect(() => {
    let active = true;

    getDoc(doc(db, "site_settings", "results"))
      .then((snapshot) => {
        if (!active || !snapshot.exists()) return;
        const data = snapshot.data();
        const urls = data?.youtubeUrls || (data?.youtubeUrl ? [data.youtubeUrl] : DEFAULT_YOUTUBE_URLS);
        if (Array.isArray(urls)) {
          setYoutubeUrls(urls.filter(url => typeof url === "string" && url.trim()));
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll animate-fade-in-up">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Video Results</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3">
            Watch the <span className="text-gradient-gold">Success Stories</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            See the real results from our community members who have transformed their lives.
          </p>
        </div>

        <div ref={gridRef} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {youtubeUrls.map((url, index) => {
            const videoId = getYoutubeVideoId(url);
            const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";

            if (!embedUrl) return null;

            return (
              <div key={index} className="overflow-hidden rounded-3xl border border-border bg-background shadow-nature transition-all duration-300 hover-lift">
                <div className="aspect-video w-full">
                  <iframe
                    src={embedUrl}
                    title={`Dharmi Ayurveda results video ${index + 1}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

