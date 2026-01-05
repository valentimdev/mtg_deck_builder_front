import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeckService, type DeckInDB } from '@/services/deckService';
import { ImportService } from '@/services/importService';
import DeckCard from '../components/DeckCard';
import mago from '/mago.mp4';
import meusDecks from '/MeusDecksTitulo-01.svg'
export default function DeckManagerPage() {
  const [decks, setDecks] = useState<DeckInDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [importDeckName, setImportDeckName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const loadDecks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DeckService.getAll();
      
      // Para cada deck, buscar o commander se existir
      const decksWithCommanders = await Promise.all(
        response.decks.map(async (deck) => {
          try {
            const commander = await DeckService.getCommander(deck.id);
            return {
              ...deck,
              commander: commander.card ? {
                id: commander.card.id,
                name: commander.card.name,
                art: commander.card.art, // art crop
              } : undefined,
            };
          } catch (err) {
            return deck;
          }
        })
      );
      
      setDecks(decksWithCommanders);
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
      setDecks(decks.filter((deck) => deck.id !== deckId));
    } catch (err) {
      console.error('Erro ao deletar deck:', err);
      alert(err instanceof Error ? err.message : 'Erro ao deletar deck');
    }
  };

  const handleCopyDeck = async (deckId: number, deckName: string) => {
    const copyName = prompt(
      `Digite o nome para a cópia de "${deckName}":`,
      `${deckName} (Cópia)`
    );
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
    const newName = prompt(
      `Digite o novo nome para "${currentName}":`,
      currentName
    );
    if (!newName || !newName.trim() || newName.trim() === currentName) {
      return;
    }

    try {
      const renamedDeck = await DeckService.rename(deckId, {
        name: newName.trim(),
      });
      setDecks(decks.map((deck) => (deck.id === deckId ? renamedDeck : deck)));
    } catch (err) {
      console.error('Erro ao renomear deck:', err);
      alert(err instanceof Error ? err.message : 'Erro ao renomear deck');
    }
  };

  const handleOpenDeck = (deckId: number) => {
    navigate(`/deck/${deckId}`);
  };
  const handleConfirmImport = async () => {
    if (!selectedFile || !importDeckName.trim()) {
      return;
    }

    setImporting(true);
    try {
      const importedDeck = await ImportService.importTxt(
        importDeckName.trim(),
        selectedFile
      );
      
      const deckInDB: DeckInDB = {
        id: importedDeck.id,
        name: importedDeck.name,
        last_update: importedDeck.last_update,
      };
      setDecks([...decks, deckInDB]);

      setShowImportDialog(false);
      setSelectedFile(null);
      setImportDeckName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Erro ao importar deck:', err);

      // Mostra mensagem personalizada para todos os erros de importação
      const exampleMessage = `Use o formato padrão de txt de Magic.\n\nExemplo:\n1 Sol Ring\n1 Command Tower\n1 Lightning Bolt\n1 Counterspell\n\nFormato: quantidade (espaço) nome da carta`;
      setErrorMessage(exampleMessage);
      setShowErrorDialog(true);
    } finally {
      setImporting(false);
    }
  };
  const handleImportDeck = () => {
    setShowImportDialog(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.txt')) {
      alert('Por favor, selecione um arquivo .txt');
      return;
    }

    setSelectedFile(file);
    setImportDeckName(file.name.replace('.txt', ''));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Verifica se é um arquivo .txt
    if (!file.name.endsWith('.txt')) {
      alert('Por favor, selecione um arquivo .txt');
      return;
    }

    // Pede o nome do deck
    const deckName = prompt(
      'Digite o nome para o deck importado:',
      file.name.replace('.txt', '')
    );
    if (!deckName || !deckName.trim()) {
      return;
    }

    setImporting(true);
    try {
      const importedDeck = await ImportService.importTxt(deckName.trim(), file);
      // Converte CompleteDeckRead para DeckInDB
      const deckInDB: DeckInDB = {
        id: importedDeck.id,
        name: importedDeck.name,
        last_update: importedDeck.last_update,
      };
      setDecks([...decks, deckInDB]);
      // Limpa o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Erro ao importar deck:', err);
      alert(err instanceof Error ? err.message : 'Erro ao importar deck');
    } finally {
      setImporting(false);
    }
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
        <div className=" flex justify-between items-center mb-14">
          {decks.length > 0 ? (
            <div>
              <video
                src={mago}
                autoPlay
                loop
                muted
                playsInline
                className="w-50 h-50"
              ></video>
            </div>
          ) : null}
          <div>
          {/* <h1 className="text-4xl font-bold text-[#b896ff] mb-2">
              Meus Decks
            </h1> */}
            <div className="flex flex-col items-center justify-center">
            <img src={meusDecks} alt="Meus Decks" className="w-110 mb-10" />
            <p className="text-gray-400">Gerencie seus decks de Commander</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportDialog(true)}
              disabled={importing}
              className="focus:ring-offset-0 px-6 py-3 bg-[#4a5568] hover:bg-[#5a6578] text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{importing ? 'Importando...' : 'Importar Deck'}</span>
            </button>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="px-6 py-3 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <span>+</span>
              <span>Criar Novo Deck</span>
            </button>
          </div>
        </div>

        {/* Input de arquivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Lista de Decks */}
        {decks.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center items-center">
              <video
                src={mago}
                autoPlay
                loop
                muted
                playsInline
                className="w-90 h-90"
              ></video>
            </div>
            <p className="text-gray-400 text-xl mb-4">
              Você ainda não tem decks
            </p>
            <p className="text-gray-500 mb-6">
              Crie seu primeiro deck para começar!
            </p>
            {/* <button
              onClick={() => setShowCreateDialog(true)}
              className="px-6 py-3 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors"
            >
              Criar Primeiro Deck
            </button> */}
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
              <h2 className="text-2xl font-bold text-[#b896ff] mb-4">
                Criar Novo Deck
              </h2>
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
        {/* Dialog de Importar */}
        {showImportDialog && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => {
              setShowImportDialog(false);
              setSelectedFile(null);
              setImportDeckName('');
            }}
          >
            <div
              className="bg-[#2a2b2f] rounded-lg shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-[#b896ff] mb-4">
                Importar Deck
              </h2>

              {/* Input de arquivo */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Arquivo .txt</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 bg-[#1a1a1f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#b896ff] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#b896ff] file:text-white hover:file:bg-[#a086ee]"
                />
              </div>

              {/* Input de nome do deck */}
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Nome do Deck</label>
                <input
                  type="text"
                  value={importDeckName}
                  onChange={(e) => setImportDeckName(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      selectedFile &&
                      importDeckName.trim()
                    ) {
                      handleConfirmImport();
                    }
                  }}
                  placeholder="Digite o nome do deck"
                  className="w-full px-4 py-2 bg-[#1a1a1f] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#b896ff]"
                  autoFocus
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowImportDialog(false);
                    setSelectedFile(null);
                    setImportDeckName('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  disabled={importing}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={
                    !selectedFile || !importDeckName.trim() || importing
                  }
                  className="px-4 py-2 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importando...' : 'Importar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog de Erro */}
        {showErrorDialog && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowErrorDialog(false)}
          >
            <div
              className="bg-[#2a2b2f] rounded-lg shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Erro ao Importar Deck
              </h2>
              <div className="mb-6">
                <p className="text-gray-300 whitespace-pre-line">
                  {errorMessage}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowErrorDialog(false)}
                  className="px-4 py-2 bg-[#b896ff] hover:bg-[#a086ee] text-white font-semibold rounded-lg transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
