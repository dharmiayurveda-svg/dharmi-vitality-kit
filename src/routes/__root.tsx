import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";


import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-16">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-heading">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">Go home</Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dharmi Ayurveda Magical Weight Loss Kit – Natural Fat Loss" },
      { name: "description", content: "Lose weight naturally with Dharmi Ayurveda Magical Weight Loss Kit. 100% Ayurvedic, no side effects. Get visible results in weeks. Order now!" },
      { name: "author", content: "Dharmi Ayurveda" },
      { name: "keywords", content: "Ayurvedic weight loss kit, natural fat loss India, Dharmi Ayurveda, herbal weight loss, weight loss without side effects" },
      { property: "og:title", content: "Dharmi Ayurveda Magical Weight Loss Kit – Natural Fat Loss" },
      { property: "og:description", content: "Lose weight naturally with Dharmi Ayurveda Magical Weight Loss Kit. 100% Ayurvedic, no side effects. Get visible results in weeks. Order now!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dharmi Ayurveda Magical Weight Loss Kit – Natural Fat Loss" },
      { name: "twitter:description", content: "Lose weight naturally with Dharmi Ayurveda Magical Weight Loss Kit. 100% Ayurvedic, no side effects. Get visible results in weeks. Order now!" },
      { property: "og:image", content: "https://dharmiayurveda.com/favicon.jpg" },
      { name: "twitter:image", content: "https://dharmiayurveda.com/favicon.jpg" },
      { name: "google-site-verification", content: "vbEc80pwwlgEP8dnjor8cSD3mTyBfBdYCV2bhChQuHI" },
    ],
    links: [
      { rel: "icon", href: "/favicon.jpg" },
      { rel: "apple-touch-icon", href: "/favicon.jpg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=MonteCarlo&family=Playfair+Display:wght@600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XMMX4XVML2"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XMMX4XVML2');
          `
        }} />
      </head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main className="pt-16"><Outlet /></main>
        <Footer />
        <FloatingWhatsApp />
      </CartProvider>
    </AuthProvider>
  );
}
