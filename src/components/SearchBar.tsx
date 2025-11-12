import { useState, useEffect, useRef } from 'react';
import type { ScryfallCard } from '@/services/scryfall';

interface SearchBarProps {
    onCardSelect: (card: ScryfallCard) => void;
}

function SearchBar({ onCardSelect }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [allResults, setAllResults] = useState<ScryfallCard[]>([]);
    const [visibleResults, setVisibleResults] = useState<ScryfallCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (query.length < 3) {
            setAllResults([]);
            setVisibleResults([]);
            setShowResults(false);
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            fetchCards(query);
        }, 600);
    }, [query]);

    async function fetchCards(q: string) {
        try {
            setLoading(true);
            const res = await fetch(
                `https://api.scryfall.com/cards/search?q=${encodeURIComponent(q)}`
            );
            if (!res.ok) throw new Error('Erro ao buscar cartas');
            const data = await res.json();

            const cards: ScryfallCard[] = data.data || [];
            setAllResults(cards);
            setVisibleResults(cards.slice(0, 10));
            setHasMore(cards.length > 10);
            setShowResults(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleScroll = () => {
        if (!containerRef.current || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            const nextCount = visibleResults.length + 10;
            setVisibleResults(allResults.slice(0, nextCount));
            setHasMore(nextCount < allResults.length);
        }
    };

    return (
        <div className="relative mt-8 flex flex-col items-center w-full max-w-lg mx-auto">
            <input
                type="text"
                placeholder="Pesquise cards..."
                className="border border-gray-500 rounded-md p-3 w-full bg-[#d2d2d2] text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-[#b896ff]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 3 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />

            {showResults && visibleResults.length > 0 && (
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="absolute top-full mt-1 w-full max-h-80 overflow-y-auto bg-[#2a2b2f] border border-gray-600 rounded-lg shadow-lg z-50"
                >
                    {visibleResults.map((card) => (
                        <div
                            key={card.id}
                            className="flex items-center gap-3 p-2 hover:bg-[#3a3b3f] cursor-pointer text-white border-b border-gray-700 last:border-0"
                            onClick={() => onCardSelect?.(card)}
                        >
                            {card.image_uris?.small ? (
                                <img
                                    src={card.image_uris.small}
                                    alt={card.name}
                                    className="w-10 h-14 rounded-md"
                                />
                            ) : (
                                <div className="w-10 h-14 bg-gray-700 rounded-md"></div>
                            )}
                            <div className="flex flex-col">
                                <span className="font-semibold text-[#b896ff]">{card.name}</span>
                                <span className="text-xs text-gray-300">{card.type_line}</span>
                                {card.mana_cost && (
                                    <span className="text-xs text-gray-400">{card.mana_cost}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="text-center text-gray-400 py-3">Carregando...</div>
                    )}
                    {!hasMore && !loading && (
                        <div className="text-center text-gray-500 py-2 text-sm">
                            Fim dos resultados
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
