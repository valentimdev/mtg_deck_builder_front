import { type DeckInDB } from '@/services/deckService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeckCardProps {
  deck: DeckInDB;
  onOpen: (deckId: number) => void;
  onDelete: (deckId: number) => void;
  onCopy: (deckId: number, deckName: string) => void;
  onRename: (deckId: number, deckName: string) => void;
}

export default function DeckCard({ deck, onOpen, onDelete, onCopy, onRename }: DeckCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-[#2a2b2f] rounded-lg p-6 border border-gray-700 hover:border-[#b896ff] transition-colors group">
      <div
        onClick={() => onOpen(deck.id)}
        className="cursor-pointer mb-4"
      >
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#b896ff] transition-colors">
          {deck.name}
        </h3>
        <p className="text-gray-400 text-sm">
          Última atualização: {formatDate(deck.last_update)}
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(deck.id);
          }}
          className="w-full px-4 py-2 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Abrir
        </button>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(deck.id, deck.name);
            }}
            className="flex-1 px-3 py-2 bg-[#4a5568] hover:bg-[#5a6578] text-white font-semibold rounded-lg transition-colors text-sm"
            title="Renomear deck"
          >
            Renomear
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(deck.id, deck.name);
            }}
            className="flex-1 px-3 py-2 bg-[#4a5568] hover:bg-[#5a6578] text-white font-semibold rounded-lg transition-colors text-sm"
            title="Copiar deck"
          >
            Copiar
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(deck.id);
          }}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors text-sm"
          title="Deletar deck"
        >
          Deletar
        </button>
      </div>
    </div>
  );
}

