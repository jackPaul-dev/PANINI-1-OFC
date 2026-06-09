import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function TermsOfUse() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header locale="fr" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#6b0f1a] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 1er juin 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">1. Acceptation des CGU</h2>
            <p>En accédant et en utilisant ce Site, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le Site.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">2. Produits et commandes</h2>
            <p>Tous les produits sont soumis à disponibilité. Nous nous réservons le droit de cesser la vente de tout produit à tout moment. Les prix sont susceptibles d'être modifiés sans préavis. Nous nous réservons le droit de refuser toute commande.</p>
            <p className="mt-2">En passant une commande, vous déclarez avoir au moins 18 ans et être légalement capable de conclure des contrats contraignants.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">3. Paiement</h2>
            <p>Le paiement est traité en toute sécurité via Stripe. Nous acceptons Visa, Mastercard, Apple Pay et Google Pay. Vos informations de paiement sont chiffrées et ne sont jamais stockées sur nos serveurs. Tous les prix sont indiqués en euros (EUR) et incluent la TVA applicable.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">4. Livraison</h2>
            <p>Nous offrons la livraison gratuite partout en France métropolitaine et dans les DOM-TOM. Les commandes sont généralement traitées sous 1–2 jours ouvrés. Le délai de livraison estimé est de 3–5 jours ouvrés après traitement. Nous déclinons toute responsabilité pour les retards imputables aux transporteurs ou à des circonstances indépendantes de notre volonté.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">5. Droit de rétractation</h2>
            <p>Conformément à la législation française et européenne (directive 2011/83/UE), vous disposez d'un délai de <strong>14 jours calendaires</strong> à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier votre décision. Les pochettes de stickers ouvertes sont exclues du droit de rétractation pour des raisons d'hygiène.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">6. Propriété intellectuelle</h2>
            <p>Tout le contenu de ce Site, y compris les textes, graphiques, images et logos, est la propriété de Panini France SAS ou de ses concédants de licence et est protégé par le droit français et international de la propriété intellectuelle. Toute reproduction, distribution ou création d'œuvres dérivées sans notre autorisation écrite expresse est interdite.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">7. Limitation de responsabilité</h2>
            <p>Dans toute la mesure permise par la loi applicable, Panini France SAS ne saurait être tenue responsable des dommages indirects, accessoires, spéciaux ou consécutifs découlant de votre utilisation du Site ou de l'achat de produits.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">8. Droit applicable</h2>
            <p>Les présentes CGU sont régies et interprétées conformément au droit français. Tout litige relatif à leur interprétation ou à leur exécution relève de la compétence exclusive des tribunaux français.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">9. Nous contacter</h2>
            <p>Pour toute question relative aux présentes CGU, veuillez contacter :<br />
            <strong>Panini France SAS</strong><br />
            E-mail : <a href="mailto:support@panini-france.fr" className="text-[#6b0f1a] underline">support@panini-france.fr</a>
            </p>
          </section>
        </div>
      </div>
      <footer className="bg-[#6b0f1a] text-white/40 text-xs text-center py-4 mt-12">
        © 2026 Panini France SAS — Tous droits réservés.
      </footer>
    </div>
  );
}
