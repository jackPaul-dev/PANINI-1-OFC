import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function ReturnPolicy() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header locale="fr" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#6b0f1a] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Politique de retour et de remboursement</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 1er juin 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Notre engagement</h2>
            <p>Votre satisfaction est notre priorité. Si vous n'êtes pas entièrement satisfait de votre achat, nous sommes là pour vous aider.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Retours</h2>
            <p>Vous disposez de <strong>30 jours calendaires</strong> à compter de la date de livraison pour initier un retour. Pour être éligible au retour :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>L'article doit être inutilisé et dans le même état que celui reçu</li>
              <li>L'article doit être dans son emballage d'origine</li>
              <li>Vous devez fournir une preuve d'achat (e-mail de confirmation de commande)</li>
            </ul>
            <p className="mt-3">Articles non retournables :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Pochettes de stickers ouvertes (une fois ouvertes, elles ne peuvent pas être retournées pour des raisons d'hygiène)</li>
              <li>Articles achetés lors de promotions de déstockage ou de vente finale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Remboursements</h2>
            <p>Une fois votre article retourné reçu et inspecté, nous vous informerons de l'approbation ou du rejet de votre remboursement. Si approuvé, votre remboursement sera effectué sur votre moyen de paiement d'origine sous <strong>5 à 10 jours ouvrés</strong>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Articles endommagés ou défectueux</h2>
            <p>Si vous recevez un article endommagé ou défectueux, veuillez nous contacter dans les <strong>7 jours suivant la livraison</strong> avec votre numéro de commande et une photo du dommage. Nous organiserons un remplacement ou un remboursement intégral sans frais supplémentaires.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Échanges</h2>
            <p>Nous remplaçons les articles uniquement s'ils sont défectueux ou endommagés. Pour échanger un article, contactez-nous à <a href="mailto:support@panini-france.fr" className="text-[#6b0f1a] underline">support@panini-france.fr</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Frais de retour</h2>
            <p>Les frais de retour sont à votre charge, sauf si le retour est dû à notre erreur (mauvais article envoyé, produit défectueux). Nous recommandons d'utiliser un service d'expédition avec suivi pour les retours.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Comment initier un retour</h2>
            <p>Pour initier un retour, envoyez-nous un e-mail à <a href="mailto:support@panini-france.fr" className="text-[#6b0f1a] underline">support@panini-france.fr</a> en indiquant :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Votre numéro de commande</li>
              <li>Le(s) article(s) que vous souhaitez retourner</li>
              <li>La raison du retour</li>
            </ul>
            <p className="mt-3">Nous vous répondrons sous 1–2 jours ouvrés avec les instructions de retour.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Nous contacter</h2>
            <p>
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
