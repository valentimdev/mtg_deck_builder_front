import { useState, useEffect, useCallback } from 'react';
import { DeckService } from '@/services/deckService';
import { scryfallService } from '@/services/scryfall';
import type { DeckItem, DeckContextValue } from '../types/deck';
import type { CompleteDeckRead, FullDeckCards } from '@/services/deckService';
import type { BackendCard } from '@/services/scryfall/types';

export { type DeckItem } from '../types/deck';

// Converte FullDeckCards do backend para DeckItem
const convertDeckCardToDeckItem = (deckCard: FullDeckCards): DeckItem => ({
  quantity: deckCard.quantidade,
  cardName: deckCard.card.name,
  card: deckCard.card,
  loading: false,
  error: null,
});

export function useDeck(): DeckContextValue {
  const [currentDeckId, setCurrentDeckId] = useState<number | null>(null);
  const [commander, setCommander] = useState<DeckItem | null>(null);
  const [deckItems, setDeckItems] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega um deck específico do backend
  const loadDeck = useCallback(async (deckId: number) => {
    setLoading(true);
    setError(null);

    try {
      const deckData: CompleteDeckRead = await DeckService.getById(deckId);

      // Garante que cards seja um array (pode ser undefined/null se o deck estiver vazio)
      const cards = deckData.cards || [];

      // Separa comandante e cartas do deck
      const commanderCard = cards.find((card) => card.is_commander);
      const mainDeckCards = cards.filter((card) => !card.is_commander);

      // Converte comandante
      const commanderItem: DeckItem | null = commanderCard
        ? convertDeckCardToDeckItem(commanderCard)
        : null;

      // Converte cartas do deck
      const deckItemsList: DeckItem[] = mainDeckCards.map(
        convertDeckCardToDeckItem
      );

      setCommander(commanderItem);
      setDeckItems(deckItemsList);
    } catch (err) {
      console.error('Erro ao carregar deck:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar deck');
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializa ou carrega um deck
  const initializeDeck = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Para testar com deck vazio, você pode:
      // 1. Deletar todos os decks no backend, ou
      // 2. Modificar a linha abaixo para sempre criar um novo deck
      const FORCE_NEW_DECK = true; // Mude para true para sempre criar um deck vazio

      let deckId: number;

      if (FORCE_NEW_DECK) {
        // Sempre cria um novo deck vazio (útil para testes)
        const newDeck = await DeckService.create({
          name: `Deck ${Date.now()}`,
        });
        deckId = newDeck.id;
      } else {
        // Tenta listar os decks disponíveis
        const deckList = await DeckService.getAll();

        if (deckList.decks && deckList.decks.length > 0) {
          // Usa o primeiro deck disponível
          deckId = deckList.decks[0].id;
        } else {
          // Cria um novo deck se não houver nenhum
          const newDeck = await DeckService.create({ name: 'Meu Deck' });
          deckId = newDeck.id;
        }
      }

      setCurrentDeckId(deckId);
      await loadDeck(deckId);
    } catch (err) {
      console.error('Erro ao inicializar deck:', err);
      setError(err instanceof Error ? err.message : 'Erro ao inicializar deck');
    } finally {
      setLoading(false);
    }
  }, [loadDeck]);

  const loadDeckFromTxt = async () => {
    if (currentDeckId) {
      await loadDeck(currentDeckId);
    } else {
      await initializeDeck();
    }
  };

  const removeDeckItem = async (index: number) => {
    if (!currentDeckId) {
      console.error('Nenhum deck selecionado');
      return;
    }

    const itemToRemove = deckItems[index];
    if (!itemToRemove || !itemToRemove.card) {
      console.error('Item não encontrado ou sem carta');
      return;
    }

    try {
      // Remove a carta do backend
      await DeckService.removeCard(currentDeckId, itemToRemove.card.id, 1);

      // Atualiza o estado local
      if (itemToRemove.quantity > 1) {
        setDeckItems((prev) =>
          prev.map((item, i) =>
            i === index ? { ...item, quantity: item.quantity - 1 } : item
          )
        );
      } else {
        setDeckItems((prev) => prev.filter((_, i) => i !== index));
      }
    } catch (err) {
      console.error('Erro ao remover carta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover carta');
    }
  };

  const addDeckItem = async (cardName: string, quantity = 1) => {
    if (!currentDeckId) {
      console.error('Nenhum deck selecionado');
      return;
    }

    try {
      // Primeiro, busca a carta pelo nome para obter o ID
      const card: BackendCard = await scryfallService.getCardByName(cardName);
      await addCardByCard(card, quantity);
    } catch (err) {
      console.error('Erro ao adicionar carta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar carta');
    }
  };

  const addCardByCard = async (card: BackendCard, quantity = 1) => {
    if (!currentDeckId) {
      console.error('Nenhum deck selecionado');
      return;
    }

    if (!card.id) {
      console.error('Carta sem ID');
      return;
    }

    try {
      // Verifica se a carta já está no deck (exceto se for commander)
      const existingIndex = deckItems.findIndex(
        (item) => item.card?.id === card.id
      );

      if (existingIndex !== -1) {
        // Se já existe, aumenta a quantidade
        const existingItem = deckItems[existingIndex];
        const newQuantity = existingItem.quantity + quantity;

        await DeckService.addCard(currentDeckId, card.id, newQuantity);

        setDeckItems((prev) =>
          prev.map((item, i) =>
            i === existingIndex
              ? { ...item, quantity: newQuantity, card }
              : item
          )
        );
      } else {
        // Se não existe, adiciona nova carta
        await DeckService.addCard(currentDeckId, card.id, quantity);

        const newItem: DeckItem = {
          quantity,
          cardName: card.name,
          card,
          loading: false,
          error: null,
        };

        setDeckItems((prev) => [...prev, newItem]);
      }
    } catch (err) {
      console.error('Erro ao adicionar carta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar carta');
    }
  };

  const removeCardById = async (cardId: string) => {
    if (!currentDeckId) {
      console.error('Nenhum deck selecionado');
      return;
    }

    try {
      // Verifica se é o commander
      if (commander?.card?.id === cardId) {
        // Remove completamente do deck (remove a carta, não apenas o status de commander)
        await DeckService.removeCard(currentDeckId, cardId, 1);
        setCommander(null);
        // Se o commander também está em deckItems, removemos
        const commanderInDeck = deckItems.findIndex(
          (item) => item.card?.id === cardId
        );
        if (commanderInDeck !== -1) {
          setDeckItems((prev) => prev.filter((_, i) => i !== commanderInDeck));
        }
      } else {
        // Remove do deck normal
        const itemIndex = deckItems.findIndex(
          (item) => item.card?.id === cardId
        );
        if (itemIndex === -1) {
          console.error('Carta não encontrada no deck');
          return;
        }

        const itemToRemove = deckItems[itemIndex];
        await DeckService.removeCard(currentDeckId, cardId, 1);

        if (itemToRemove.quantity > 1) {
          setDeckItems((prev) =>
            prev.map((item, i) =>
              i === itemIndex ? { ...item, quantity: item.quantity - 1 } : item
            )
          );
        } else {
          setDeckItems((prev) => prev.filter((_, i) => i !== itemIndex));
        }
      }

      // Recarrega o deck para garantir sincronização
      await loadDeck(currentDeckId);
    } catch (err) {
      console.error('Erro ao remover carta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao remover carta');
    }
  };

  const addCardAsCommander = async (cardId: string) => {
    if (!currentDeckId) {
      console.error('Nenhum deck selecionado');
      return;
    }

    try {
      // Verifica se já é o commander
      if (commander?.card?.id === cardId) {
        return;
      }

      // Verifica se a carta já está no deck
      const cardInDeck = deckItems.find((item) => item.card?.id === cardId);

      // Se a carta não está no deck, adiciona primeiro
      if (!cardInDeck) {
        await DeckService.addCard(currentDeckId, cardId, 1);
      }

      // Define como commander (a API espera que a carta já esteja no deck)
      await DeckService.setCommander(currentDeckId, cardId);

      // Recarrega o deck para garantir sincronização
      await loadDeck(currentDeckId);
    } catch (err) {
      console.error('Erro ao adicionar carta como commander:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao adicionar carta como commander'
      );
    }
  };

  const totalCards =
    deckItems.reduce((sum, item) => sum + item.quantity, 0) +
    (commander?.quantity || 0);

  useEffect(() => {
    initializeDeck();
  }, [initializeDeck]);

  return {
    commander,
    deckItems,
    loading,
    error,
    totalCards,
    loadDeckFromTxt,
    removeDeckItem,
    removeCardById,
    addDeckItem,
    addCardByCard,
    addCardAsCommander,
    reloadDeck: loadDeckFromTxt,
  };
}
