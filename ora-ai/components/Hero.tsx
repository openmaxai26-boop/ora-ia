"use client";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-bg pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-lagoon/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-lagoon/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lagoon/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-lagoon/20 border border-lagoon/30 text-lagoon rounded-full px-4 py-2 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-lagoon rounded-full animate-pulse" />
          Conçu pour le fenua — Polynésie française
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
          L&apos;IA qui travaille
          <br />
          <span className="text-lagoon">pour votre entreprise</span>
          <br />
          24h/24
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-3xl mx-auto leading-relaxed">
          Ora AI automatise vos réseaux sociaux, votre service client, votre SEO
          et vos tâches administratives — sans compétences techniques,
          depuis Tahiti ou n&apos;importe quelle île.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <a
            href="#tarifs"
            className="bg-lagoon text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white hover:text-ocean transition-all lagoon-glow"
          >
            Démarrer gratuitement →
          </a>
          <a
            href="#comment"
            className="border border-white/30 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition-all"
          >
            Voir comment ça marche
          </a>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap justify-center gap-8 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lagoon text-2xl font-bold">5</span>
            <span>agents IA disponibles</span>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-lagoon text-2xl font-bold">0</span>
            <span>compétences techniques requises</span>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-lagoon text-2xl font-bold">7j/7</span>
            <span>fonctionnement automatique</span>
          </div>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
