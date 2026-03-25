"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-lagoon/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lagoon to-ocean flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="text-xl font-bold text-ocean">Ora <span className="text-lagoon">AI</span></span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#agents" className="text-ocean/70 hover:text-lagoon transition-colors font-medium">Agents</a>
          <a href="#comment" className="text-ocean/70 hover:text-lagoon transition-colors font-medium">Comment ça marche</a>
          <a href="#tarifs" className="text-ocean/70 hover:text-lagoon transition-colors font-medium">Tarifs</a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="/dashboard" className="text-ocean font-medium hover:text-lagoon transition-colors">
            Connexion
          </a>
          <a
            href="#tarifs"
            className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold hover:bg-ocean transition-colors"
          >
            Essai gratuit
          </a>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-ocean">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-lagoon/20 px-6 py-4 flex flex-col gap-4">
          <a href="#agents" onClick={() => setOpen(false)} className="text-ocean font-medium">Agents</a>
          <a href="#comment" onClick={() => setOpen(false)} className="text-ocean font-medium">Comment ça marche</a>
          <a href="#tarifs" onClick={() => setOpen(false)} className="text-ocean font-medium">Tarifs</a>
          <a href="#tarifs" className="bg-lagoon text-white px-5 py-2 rounded-full font-semibold text-center">
            Essai gratuit
          </a>
        </div>
      )}
    </nav>
  );
}
