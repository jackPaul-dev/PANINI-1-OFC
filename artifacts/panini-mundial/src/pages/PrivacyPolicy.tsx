import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header locale="fr" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#6b0f1a] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 1er juin 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">1. Données collectées</h2>
            <p>Lorsque vous passez une commande sur notre site ("Site"), nous collectons les informations personnelles suivantes : votre nom, adresse e-mail, adresse de livraison et informations de paiement (traitées en toute sécurité par Stripe — nous ne stockons jamais vos coordonnées bancaires). Nous pouvons également collecter votre adresse IP et le type de navigateur via des cookies et des outils d'analyse.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">2. Utilisation de vos données</h2>
            <p>Nous utilisons les informations collectées pour :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Traiter et expédier votre commande</li>
              <li>Vous envoyer une confirmation de commande et des mises à jour d'expédition par e-mail</li>
              <li>Vous envoyer des e-mails promotionnels sur nos produits (vous pouvez vous désabonner à tout moment)</li>
              <li>Améliorer notre site et l'expérience client</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">3. Partage de vos données</h2>
            <p>Nous ne vendons ni ne louons vos données personnelles à des tiers. Nous pouvons partager vos informations avec des prestataires de confiance qui nous aident à exploiter notre site et à mener nos activités (ex. : Stripe pour les paiements, Resend pour l'envoi d'e-mails, transporteurs), sous réserve qu'ils s'engagent à garder vos informations confidentielles.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">4. Cookies</h2>
            <p>Nous utilisons des cookies et des technologies de suivi similaires pour analyser l'activité sur notre Site et conserver certaines informations. Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour vous alerter lorsqu'un cookie est envoyé. Si vous n'acceptez pas les cookies, certaines parties de notre Site peuvent ne pas fonctionner correctement.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">5. Conservation des données</h2>
            <p>Nous conservons vos données personnelles uniquement le temps nécessaire à la réalisation des finalités décrites dans la présente politique, sauf si une période de conservation plus longue est requise ou autorisée par la loi.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">6. Vos droits (RGPD)</h2>
            <p>Conformément au Règlement général sur la protection des données (RGPD), vous disposez du droit d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant vos données personnelles. Pour exercer ces droits, contactez-nous à <a href="mailto:support@panini-france.fr" className="text-[#6b0f1a] underline">support@panini-france.fr</a>. Vous pouvez également adresser une réclamation à la CNIL (www.cnil.fr).</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">7. Sécurité</h2>
            <p>Nous mettons en œuvre des mesures de sécurité conformes aux standards du secteur pour protéger vos informations personnelles. Toutes les transactions de paiement sont chiffrées via la technologie SSL/TLS et traitées par Stripe, prestataire de paiement certifié PCI-DSS.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">8. Protection des mineurs</h2>
            <p>Notre Site n'est pas destiné aux enfants de moins de 16 ans. Nous ne collectons pas sciemment de données personnelles concernant des mineurs de moins de 16 ans.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">9. Modifications de cette politique</h2>
            <p>Nous pouvons mettre à jour cette Politique de confidentialité à tout moment. Nous vous informerons de toute modification en publiant la nouvelle politique sur cette page avec une date de mise à jour.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">10. Nous contacter</h2>
            <p>Pour toute question relative à cette Politique de confidentialité, veuillez nous contacter :<br />
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
