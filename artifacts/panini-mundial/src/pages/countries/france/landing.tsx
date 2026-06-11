import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Star, CheckCircle, Truck, ShieldCheck, Lock, Award, Package, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { pixelViewContent, pixelAddToCart } from "@/lib/pixel";
import countryConfig from "@/lib/countryConfigFrance";

const { kits, reviews, currencySymbol } = countryConfig;

export default function FranceLanding() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    pixelViewContent({
      content_ids: ["panini-mundial-2026"],
      content_name: "Panini Coupe du Monde 2026 — Albums",
      value: kits[0]?.price ?? 12.99,
      currency: "EUR",
    });
  }, []);

  const handleBuy = (kitId: string) => {
    const kit = kits.find((k) => k.id === kitId);
    pixelAddToCart({
      content_ids: [kitId],
      content_name: kit?.name ?? "Kit Panini",
      value: kit?.price ?? 0,
      currency: "EUR",
    });
    // Landing → checkout direto (presell em standby)
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid','ttclid','gclid'];
    const checkoutParams = new URLSearchParams({ kit: kitId });
    utmKeys.forEach(k => { const v = params.get(k); if (v) checkoutParams.set(k, v); });
    setLocation(`/france/checkout?${checkoutParams.toString()}`);
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header locale="fr" />

      {/* ─── Hero ─── */}
      <section className="bg-[#f5f5f7] pt-10 pb-0 px-4 overflow-hidden">
        <div className="max-w-lg mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-gray-800 text-xs font-black uppercase tracking-widest mb-8 border border-amber-300 shadow-sm"
          >
            Un kit par foyer — Stock limité
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <img
              src="/assets/fifa-wc26-logo.png"
              alt="FIFA World Cup 26 — Produit Officiel Licencié"
              className="h-36 sm:h-44 w-auto object-contain drop-shadow-md"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-[#16a34a] font-black text-base uppercase tracking-widest mb-1"
          >
            Album Officiel
          </motion.p>

          <p className="text-gray-400 font-medium text-sm mb-4">
            FIFA World Cup 26™ | Panini
          </p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl sm:text-7xl font-black text-gray-900 leading-[1.0] mb-6 tracking-tight"
          >
            COUPE DU<br />MONDE 2026
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-base text-gray-600 max-w-sm mx-auto mb-2 leading-relaxed"
          >
            {countryConfig.heroTagline}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="text-base text-gray-600 max-w-sm mx-auto mb-5 leading-relaxed"
          >
            Commandez votre album couverture rigide avec 10, 30, 60 ou 90 pochettes incluses.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#c8102e] font-black text-sm mb-7"
          >
            {countryConfig.unitsAvailable}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <button
              data-testid="button-buy-hero"
              onClick={() => document.getElementById("kits")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white font-black text-xl px-10 py-5 rounded-xl shadow-[0_6px_0_0_#15803d] hover:shadow-[0_3px_0_0_#15803d] hover:translate-y-[3px] transition-all flex items-center gap-3"
            >
              Commander Maintenant <ShoppingBag className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4 text-green-600" />
              Paiement 100% sécurisé
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="w-full bg-[#f5f5f7] mt-2"
        >
          <div className="max-w-2xl mx-auto">
            <img
              src="/assets/kit-colecionador.png"
              alt="Album officiel et boîtes Panini FIFA World Cup 2026"
              className="w-full h-auto object-contain block"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-[#002395] py-3 px-4 text-white">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center divide-x divide-white/20">
          {[
            { stat: "7", label: "stickers par pochette" },
            { stat: "670+", label: "stickers uniques dans l'album" },
            { stat: "48", label: "équipes" },
            { stat: "4,9★", label: "note moyenne" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-1">
              <span className="text-yellow-300 font-black text-sm tabular-nums">{s.stat}</span>
              <span className="text-white/70 text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Kits ─── */}
      <section id="kits" className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
              Choisissez votre kit
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Plus vous avez de pochettes, plus vous avez de chances de compléter l'album ! Livraison gratuite sur tous les kits partout en France.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {kits.map((kit) => {
              const isDourada = kit.id === "dourada";
              const isEstadio = kit.id === "estadio";
              const isCampeao = kit.id === "campeao";

              if (isDourada || isEstadio) {
                return (
                  <motion.div
                    key={kit.id}
                    variants={item}
                    data-testid={`card-kit-${kit.id}`}
                    className="relative p-[3px] rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-200 shadow-2xl"
                  >
                    <motion.div
                      className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] z-0"
                      style={{
                        background: isEstadio
                          ? "conic-gradient(from 0deg, #f59e0b, #ef4444, #3b82f6, #10b981, #a855f7, #ec4899, #fbbf24, #f59e0b)"
                          : "conic-gradient(from 0deg, #f59e0b, #fbbf24, #fde68a, #fffbeb, #fcd34d, #d97706, #b45309, #f59e0b)",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: isEstadio ? 4 : 6, repeat: Infinity, ease: "linear" }}
                    />

                    <div className="relative z-10 bg-white rounded-[13px] flex flex-col overflow-hidden h-full">
                      {kit.badge && (
                        <div className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${kit.badge.colorClass} shadow`}>
                          {kit.badge.text}
                        </div>
                      )}

                      <div
                        className={`w-full flex items-center justify-center p-6 pb-2 ${
                          isEstadio
                            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                            : "bg-gradient-to-br from-yellow-50 to-amber-50"
                        }`}
                        style={{ minHeight: 200 }}
                      >
                        <img src={kit.img} alt={kit.name} className="max-h-48 w-auto object-contain drop-shadow-xl" loading="lazy" />
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className={`text-lg font-black mb-1 ${isEstadio ? "bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-700 bg-clip-text text-transparent" : "text-yellow-700"}`}>
                          {kit.name}
                        </h3>
                        <p className="text-sm font-bold text-[#16a34a] mb-1">{kit.contents}</p>
                        <p className="text-xs text-gray-400 mb-5 border-b border-gray-100 pb-4">{kit.description}</p>

                        <div className="mt-auto">
                          <div className="flex items-end gap-2 mb-4">
                            <span className="text-3xl font-black text-gray-900 tracking-tight">
                              {currencySymbol}{kit.price.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-sm text-gray-400 line-through mb-0.5">
                              {currencySymbol}{kit.oldPrice.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full ml-1 mb-0.5">
                              Livraison offerte
                            </span>
                          </div>

                          <motion.button
                            data-testid={`button-order-${kit.id}`}
                            onClick={() => handleBuy(kit.id)}
                            className={`w-full active:scale-[0.98] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 text-base text-gray-900 ${
                              isEstadio
                                ? "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-400"
                                : "bg-gradient-to-r from-amber-400 to-yellow-400"
                            }`}
                            animate={{
                              boxShadow: isEstadio
                                ? ["0 0 0px rgba(251,191,36,0)", "0 0 28px rgba(251,191,36,0.9)", "0 0 0px rgba(251,191,36,0)"]
                                : ["0 0 0px rgba(251,191,36,0)", "0 0 20px rgba(251,191,36,0.7)", "0 0 0px rgba(251,191,36,0)"],
                            }}
                            transition={{ duration: isEstadio ? 1.4 : 1.8, repeat: Infinity, ease: "easeInOut" }}
                          >
                            Je commande mon kit <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={kit.id}
                  variants={item}
                  data-testid={`card-kit-${kit.id}`}
                  className={`bg-white rounded-2xl border-2 relative flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
                    isCampeao
                      ? "border-[#16a34a] shadow-xl ring-1 ring-green-200"
                      : "border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  {kit.badge && (
                    <div className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${kit.badge.colorClass} shadow`}>
                      {kit.badge.text}
                    </div>
                  )}

                  <div className="w-full bg-white flex items-center justify-center p-6 pb-2" style={{ minHeight: 200 }}>
                    <img src={kit.img} alt={kit.name} className="max-h-48 w-auto object-contain" loading="lazy" />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-black text-gray-900 mb-1">{kit.name}</h3>
                    <p className="text-sm font-bold text-[#16a34a] mb-1">{kit.contents}</p>
                    <p className="text-xs text-gray-400 mb-5 border-b border-gray-100 pb-4">{kit.description}</p>

                    <div className="mt-auto">
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-black text-gray-900 tracking-tight">
                          {currencySymbol}{kit.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-sm text-gray-400 line-through mb-0.5">
                          {currencySymbol}{kit.oldPrice.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full ml-1 mb-0.5">
                          Livraison offerte
                        </span>
                      </div>

                      <button
                        data-testid={`button-order-${kit.id}`}
                        onClick={() => handleBuy(kit.id)}
                        className="w-full bg-[#f5a623] hover:bg-[#e09400] active:scale-[0.98] text-gray-900 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-base shadow-sm"
                      >
                        Je commande mon kit <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── Trust / Credibilité ─── */}
      <section className="bg-white py-14 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              L'album officiel le plus attendu au monde
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">
              Depuis 1970, Panini est la référence mondiale pour les stickers de football. L'album FIFA World Cup 26™ est le seul produit avec licence officielle FIFA.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mb-12 py-6 border-y border-gray-100">
            <img src="/assets/logo-panini-oficial.png" alt="Panini" className="h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/assets/fifa-wc26-logo.png" alt="FIFA World Cup 26" className="h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-black text-[#16a34a]">+55 ans</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">d'histoire</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-black text-[#16a34a]">140+</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">pays</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-black text-[#16a34a]">1 Milliard+</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">stickers vendus/an</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Award className="w-5 h-5 text-[#6b0f1a]" />,
                title: "Licence FIFA Officielle",
                desc: "Le seul album avec licence officielle FIFA pour le Mondial 2026. Produit authentique et certifié.",
              },
              {
                icon: <Package className="w-5 h-5 text-[#6b0f1a]" />,
                title: "Boîtes 100% Scellées",
                desc: "Toutes les boîtes arrivent avec le sceau d'usine intact. Jamais ouvertes, jamais manipulées.",
              },
              {
                icon: <Truck className="w-5 h-5 text-[#6b0f1a]" />,
                title: "Livraison Suivie",
                desc: `Expédition avec numéro de suivi. ${countryConfig.deliveryTime}.`,
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-[#6b0f1a]/10 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── À propos de l'album ─── */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[#16a34a] font-black text-xs uppercase tracking-widest mb-3">À propos de l'Album Officiel</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
              Le meilleur album de l'histoire de la Coupe du Monde
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { stat: "112", label: "Pages", sub: "Le plus grand album Panini" },
              { stat: "670+", label: "Stickers", sub: "Stickers uniques dans l'album" },
              { stat: "7", label: "Stickers par pochette", sub: "Plus de stickers par unité" },
              { stat: "48", label: "Équipes", sub: "Toutes les équipes qualifiées" },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
                <p className="text-3xl font-black text-[#002395] mb-0.5">{s.stat}</p>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#002395]/5 rounded-2xl p-5 border border-[#002395]/10">
            <p className="text-sm text-gray-700 leading-relaxed">
              L'album FIFA World Cup 2026™ est <strong>le plus grand jamais créé par Panini</strong> — 112 pages, 670+ emplacements, représentant 48 équipes nationales du monde entier. Chaque pochette contient 7 stickers brillants, holographiques ou spéciaux.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Avis clients ─── */}
      <section className="bg-gray-50 py-16 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex justify-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />)}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              Ce que disent nos clients
            </h2>
            <p className="text-gray-500 text-sm">{countryConfig.socialProof}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.city}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{review.title}</p>
                <p className="text-gray-600 text-xs leading-relaxed mb-2">{review.text}</p>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">{review.verified}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section className="bg-[#002395] py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3">
            Ne ratez pas votre chance !
          </h2>
          <p className="text-blue-200 mb-2 text-sm">{countryConfig.unitsAvailable}</p>
          <p className="text-blue-200 mb-8 text-sm">{countryConfig.socialProof}</p>
          <button
            onClick={() => document.getElementById("kits")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98] text-white font-black text-xl px-12 py-5 rounded-xl shadow-[0_6px_0_0_#15803d] hover:shadow-[0_3px_0_0_#15803d] hover:translate-y-[3px] transition-all"
          >
            Choisir Mon Kit
          </button>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-blue-200 text-xs">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Paiement sécurisé SSL</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Garantie 7 jours</span>
            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Livraison gratuite France</span>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-gray-900 py-8 px-4 text-center">
        <img src="/assets/logo-panini-oficial.png" alt="Panini" className="h-8 w-auto object-contain mx-auto mb-4 opacity-60" />
        <p className="text-gray-500 text-xs mb-2">{countryConfig.companyInfo}</p>
        <p className="text-gray-600 text-xs">{countryConfig.footerNote}</p>
        <div className="flex justify-center gap-4 mt-4 text-gray-600 text-xs">
          <a href="/privacy" className="hover:text-gray-400">Politique de confidentialité</a>
          <a href="/terms" className="hover:text-gray-400">CGU</a>
          <a href="/returns" className="hover:text-gray-400">Retours</a>
        </div>
      </footer>
    </div>
  );
}
