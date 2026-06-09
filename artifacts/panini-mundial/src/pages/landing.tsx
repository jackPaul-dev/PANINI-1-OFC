import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, Star, CheckCircle, Truck, ShieldCheck, Lock, Award, Package, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { kits } from "@/lib/kits";
import { pixelViewContent, pixelAddToCart } from "@/lib/pixel";
import countryConfig from "@/lib/countryConfig";

const reviews = countryConfig.reviews;

export default function Landing() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    pixelViewContent({
      content_ids: ["panini-mundial-2026"],
      content_name: "Panini World Cup 2026 — Sticker Kits",
      value: kits[0]?.price ?? countryConfig.kits[0]?.price ?? 14.99,
      currency: countryConfig.currency,
    });
  }, []);

  const handleBuy = (kitId: string) => {
    const kit = kits.find((k) => k.id === kitId);
    pixelAddToCart({
      content_ids: [kitId],
      content_name: kit?.name ?? "Panini Kit",
      value: kit?.price ?? 0,
      currency: countryConfig.currency,
    });
    setLocation(`/checkout?kit=${kitId}`);
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
      <Header />

      {/* ─── Hero ─── */}
      <section className="bg-[#f5f5f7] pt-10 pb-0 px-4 overflow-hidden">
        <div className="max-w-lg mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-gray-800 text-xs font-black uppercase tracking-widest mb-8 border border-amber-300 shadow-sm"
          >
            One Kit Per Household — Limited Stock
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-5"
          >
            <img
              src="/assets/fifa-wc26-logo.png"
              alt="FIFA World Cup 26 — Official Licensed Product"
              className="h-36 sm:h-44 w-auto object-contain drop-shadow-md"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-[#16a34a] font-black text-base uppercase tracking-widest mb-1"
          >
            Official Album
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
            WORLD CUP<br />2026
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
            Secure your hardcover album with 30, 60 or 90 sticker packs included.
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
              Shop Now <ShoppingBag className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4 text-green-600" />
              100% Secure Checkout
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
              alt="Official Panini FIFA World Cup 2026 album and sticker boxes"
              className="w-full h-auto object-contain block"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Stats ─── */}
      <section className="bg-[#6b0f1a] py-3 px-4 text-white">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center divide-x divide-white/20">
          {[
            { stat: "7", label: "stickers per pack" },
            { stat: "670+", label: "unique stickers in album" },
            { stat: "48", label: "teams" },
            { stat: "4.9★", label: "average rating" },
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
              Choose Your Kit
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              The more packs you get, the better your chances of completing the album! Free shipping on all kits across the USA.
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
                        <div
                          className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${kit.badge.colorClass} shadow`}
                        >
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
                        <img
                          src={kit.img}
                          alt={kit.name}
                          className="max-h-48 w-auto object-contain drop-shadow-xl"
                          loading="lazy"
                        />
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3
                          className={`text-lg font-black mb-1 ${
                            isEstadio
                              ? "bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-700 bg-clip-text text-transparent"
                              : "text-yellow-700"
                          }`}
                        >
                          {kit.name}
                        </h3>
                        <p className="text-sm font-bold text-[#16a34a] mb-1">{kit.contents}</p>
                        <p className="text-xs text-gray-400 mb-5 border-b border-gray-100 pb-4">{kit.description}</p>

                        <div className="mt-auto">
                          <div className="flex items-end gap-2 mb-4">
                            <span className="text-3xl font-black text-gray-900 tracking-tight">
                              ${kit.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-400 line-through mb-0.5">
                              ${kit.oldPrice.toFixed(2)}
                            </span>
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full ml-1 mb-0.5">
                              Free shipping
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
                            Get My Kit <ChevronRight className="w-4 h-4" />
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
                    <div
                      className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${kit.badge.colorClass} shadow`}
                    >
                      {kit.badge.text}
                    </div>
                  )}

                  <div className="w-full bg-white flex items-center justify-center p-6 pb-2" style={{ minHeight: 200 }}>
                    <img
                      src={kit.img}
                      alt={kit.name}
                      className="max-h-48 w-auto object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-black text-gray-900 mb-1">{kit.name}</h3>
                    <p className="text-sm font-bold text-[#16a34a] mb-1">{kit.contents}</p>
                    <p className="text-xs text-gray-400 mb-5 border-b border-gray-100 pb-4">{kit.description}</p>

                    <div className="mt-auto">
                      <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-black text-gray-900 tracking-tight">
                          ${kit.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-400 line-through mb-0.5">
                          ${kit.oldPrice.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full ml-1 mb-0.5">
                          Free shipping
                        </span>
                      </div>

                      <button
                        data-testid={`button-order-${kit.id}`}
                        onClick={() => handleBuy(kit.id)}
                        className="w-full bg-[#f5a623] hover:bg-[#e09400] active:scale-[0.98] text-gray-900 font-black py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-base shadow-sm"
                      >
                        Get My Kit <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── Trust / Credibility ─── */}
      <section className="bg-white py-14 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              The world's most anticipated sticker album
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm">
              Since 1970, Panini has been the world's leading brand for soccer stickers. The FIFA World Cup 26™ album is the only officially licensed FIFA product.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 mb-12 py-6 border-y border-gray-100">
            <img src="/assets/logo-panini-oficial.png" alt="Panini" className="h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
            <img src="/assets/fifa-wc26-logo.png" alt="FIFA World Cup 26" className="h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-black text-[#16a34a]">55+ years</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">of history</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-black text-[#16a34a]">140+</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">countries</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-black text-[#16a34a]">1 Billion+</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">stickers sold/year</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex gap-4 items-start bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#6b0f1a]/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-[#6b0f1a]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Official FIFA License</h4>
                <p className="text-xs text-gray-500 leading-relaxed">The only officially FIFA-licensed album for World Cup 2026. 100% authentic certified product.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#6b0f1a]/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-[#6b0f1a]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">100% Factory Sealed</h4>
                <p className="text-xs text-gray-500 leading-relaxed">All boxes arrive with the factory seal intact. Never opened, never tampered with.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#6b0f1a]/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-[#6b0f1a]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">Tracked Delivery</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Shipped with tracking number. Delivered in {countryConfig.deliveryTime}.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About the Album / Why Now ─── */}
      <section className="bg-white py-16 px-4 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[#16a34a] font-black text-xs uppercase tracking-widest mb-3">About the Official Album</p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
              The greatest World Cup album in history
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { stat: "112", label: "Pages", sub: "The largest Panini album ever" },
              { stat: "670+", label: "Stickers", sub: "Unique stickers in the album" },
              { stat: "7", label: "Stickers per pack", sub: "More stickers per pack" },
              { stat: "48", label: "Teams", sub: "All qualified national teams" },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center">
                <div className="text-4xl font-black text-[#16a34a] mb-1">{s.stat}</div>
                <div className="font-bold text-gray-900 text-sm mb-0.5">{s.label}</div>
                <div className="text-xs text-gray-400">{s.sub}</div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mb-12">
            3rd historic edition — World Cup 26 edition with 48 teams
          </p>

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              Why secure your kit now?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { emoji: "🚚", title: "Priority delivery", desc: "Be among the first to receive it" },
              { emoji: "🎁", title: "Exclusive discount", desc: "Only available in this online offer" },
              { emoji: "✅", title: "Original Panini product", desc: "Authenticity guaranteed" },
              { emoji: "📦", title: "Free shipping", desc: "Free across the entire USA" },
            ].map((b, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center text-center gap-2">
                <span className="text-3xl">{b.emoji}</span>
                <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                <p className="text-xs text-gray-400 leading-snug">{b.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400">
            ✓ Free shipping &nbsp;·&nbsp; ✓ Original product
          </p>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-gray-50 py-20 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">What our customers say</h2>
            <div className="flex justify-center items-center gap-0.5 text-yellow-400 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
            </div>
            <p className="text-sm text-gray-500 font-medium">Excellent Rating · +2,200 reviews</p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {reviews.map((r, i) => (
              <motion.article
                key={i}
                variants={item}
                className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.city}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">{r.title}</h4>
                <p className="text-gray-600 text-xs leading-relaxed flex-1">"{r.text}"</p>
                <p className="text-[10px] text-green-700 font-semibold mt-3 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {r.verified}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-10 px-4 bg-gray-50 border-t border-gray-100 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse inline-block"></span>
            Limited stock — offer may end at any time
          </p>
          <button
            data-testid="button-cta-final"
            onClick={() => document.getElementById("kits")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-[#f5a623] hover:bg-[#e09400] active:scale-[0.98] text-gray-900 font-black text-lg px-10 py-4 rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
          >
            Secure My Kit <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ─── Why Us ─── */}
      <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-black text-gray-900 text-center mb-8">Why buy from us?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="w-6 h-6" />, title: "Fast Shipping", desc: "2–4 business days across the USA" },
              { icon: <Award className="w-6 h-6" />, title: "Official Product", desc: "Official FIFA & Panini license" },
              { icon: <Lock className="w-6 h-6" />, title: "Secure Checkout", desc: "Protected payment + SSL" },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Risk Free", desc: "Satisfaction guaranteed" },
            ].map((w, i) => (
              <div key={i} className="text-center bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="w-11 h-11 mx-auto bg-red-50 rounded-xl flex items-center justify-center mb-3 text-[#6b0f1a]">
                  {w.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-0.5">{w.title}</h4>
                <p className="text-xs text-gray-400">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#6b0f1a] text-white px-6 pt-10 pb-0">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="bg-white rounded-md px-2 py-1 inline-flex mb-4">
              <img src="/assets/logo-panini-oficial.png" alt="Panini" className="h-6 w-auto object-contain" />
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              The official World Cup 2026 collection. Free shipping across the entire USA.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-[#f5a623] font-black text-xs uppercase tracking-widest mb-4">Company</p>
              <ul className="space-y-3 text-sm text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Return Policy</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[#f5a623] font-black text-xs uppercase tracking-widest mb-4">Secure Payment</p>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-white text-gray-900 text-xs font-black px-2.5 py-1 rounded">VISA</span>
                <span className="bg-white text-gray-900 text-xs font-black px-2.5 py-1 rounded">MASTERCARD</span>
                <span className="bg-black text-white text-xs font-black px-2.5 py-1 rounded"> Apple Pay</span>
                <span className="bg-white text-gray-800 text-xs font-black px-2.5 py-1 rounded">G Pay</span>
              </div>
              <p className="text-white/60 text-xs flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> 100% secure site · SSL · Stripe
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 text-center text-white/40 text-xs">
          © 2026 Panini USA LLC — All rights reserved. Limited promotional offer.
        </div>
      </footer>
    </div>
  );
}
