interface Props {
  country: string;
  flag: string;
  language: string;
  currency: string;
}

export default function ComingSoon({ country, flag, language, currency }: Props) {
  return (
    <div className="min-h-screen bg-[#f0ece8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
        <div className="p-10 text-center">
          <div className="text-6xl mb-4">{flag}</div>
          <h1 className="text-2xl font-black text-[#6b0f1a] mb-1 tracking-tight">
            Panini {country}
          </h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">
            {language} · {currency}
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Em construção
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Esta versão está a ser preparada.<br />
            Em breve disponível neste endereço.
          </p>
        </div>
        <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
      </div>
    </div>
  );
}
