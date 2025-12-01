import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeckService, type DeckInDB } from '@/services/deckService';
import DeckCard from './DeckCard';

export default function DeckManagerPage() {
  const [decks, setDecks] = useState<DeckInDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const loadDecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DeckService.getAll();
      setDecks(response.decks || []);
    } catch (err) {
      console.error('Erro ao carregar decks:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar decks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecks();
  }, []);

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      return;
    }

    setCreating(true);
    try {
      const newDeck = await DeckService.create({ name: newDeckName.trim() });
      setDecks([...decks, newDeck]);
      setShowCreateDialog(false);
      setNewDeckName('');
      // Navega para o deck builder com o novo deck
      navigate(`/deck/${newDeck.id}`);
    } catch (err) {
      console.error('Erro ao criar deck:', err);
      alert(err instanceof Error ? err.message : 'Erro ao criar deck');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDeck = async (deckId: number) => {
    if (!confirm('Tem certeza que deseja deletar este deck?')) {
      return;
    }

    try {
      await DeckService.delete(deckId);
      setDecks(decks.filter(deck => deck.id !== deckId));
    } catch (err) {
      console.error('Erro ao deletar deck:', err);
      alert(err instanceof Error ? err.message : 'Erro ao deletar deck');
    }
  };

  const handleCopyDeck = async (deckId: number, deckName: string) => {
    const copyName = prompt(`Digite o nome para a cópia de "${deckName}":`, `${deckName} (Cópia)`);
    if (!copyName || !copyName.trim()) {
      return;
    }

    try {
      const copiedDeck = await DeckService.copy(deckId, copyName.trim());
      setDecks([...decks, copiedDeck]);
      // Não navega, apenas adiciona o deck à lista
    } catch (err) {
      console.error('Erro ao copiar deck:', err);
      alert(err instanceof Error ? err.message : 'Erro ao copiar deck');
    }
  };

  const handleRenameDeck = async (deckId: number, currentName: string) => {
    const newName = prompt(`Digite o novo nome para "${currentName}":`, currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) {
      return;
    }

    try {
      const renamedDeck = await DeckService.rename(deckId, { name: newName.trim() });
      setDecks(decks.map(deck => deck.id === deckId ? renamedDeck : deck));
    } catch (err) {
      console.error('Erro ao renomear deck:', err);
      alert(err instanceof Error ? err.message : 'Erro ao renomear deck');
    }
  };

  const handleOpenDeck = (deckId: number) => {
    navigate(`/deck/${deckId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1f23] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b896ff] mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando decks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1f23] text-white">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">Erro ao carregar decks</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadDecks}
            className="px-4 py-2 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1f23] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#b896ff] mb-2">Meus Decks</h1>
            <p className="text-gray-400">Gerencie seus decks de Commander</p>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-6 py-3 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>Criar Novo Deck</span>
          </button>
        </div>

        {/* Lista de Decks */}
        {decks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">Você ainda não tem decks</p>
            <p className="text-gray-500 mb-6">Crie seu primeiro deck para começar!</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-6 py-3 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors"
            >
              Criar Primeiro Deck
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onOpen={handleOpenDeck}
                onDelete={handleDeleteDeck}
                onCopy={handleCopyDeck}
                onRename={handleRenameDeck}
              />
            ))}
          </div>
        )}

        {/* Dialog de Criação */}
        {showCreateDialog && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowCreateDialog(false)}
          >
            <div
              className="bg-[#2a2b2f] rounded-lg shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-[#b896ff] mb-4">Criar Novo Deck</h2>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Nome do Deck</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateDeck();
                    }
                  }}
                  placeholder="Digite o nome do deck"
                  className="w-full px-4 py-2 bg-[#1a1a1f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#b896ff]"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewDeckName('');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateDeck}
                  disabled={!newDeckName.trim() || creating}
                  className="px-4 py-2 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

