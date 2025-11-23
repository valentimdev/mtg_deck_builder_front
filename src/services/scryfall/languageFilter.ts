import type { BackendCard } from './types';

/**
 * Filtra cartas para manter apenas as em inglês
 * Usa heurísticas para identificar cartas em inglês vs outras línguas
 */
export function filterEnglishCards(cards: BackendCard[]): BackendCard[] {
  return cards.filter((card) => {
    const name = card.name;

    // Caracteres comuns em outras línguas que não aparecem em nomes de cartas em inglês
    const nonEnglishPatterns = [
      /[àáâãäå]/i,  // Acentos comuns em português/francês
      /[èéêë]/i,    // E com acentos
      /[ìíîï]/i,    // I com acentos
      /[òóôõö]/i,   // O com acentos
      /[ùúûü]/i,    // U com acentos
      /[ç]/i,       // C com cedilha
      /[ñ]/i,       // N com til
      /[ß]/i,       // Eszett alemão
      /[¿¡]/i,      // Pontuação espanhola
    ];

    // Verifica se o nome contém caracteres não-inglês
    const hasNonEnglishChars = nonEnglishPatterns.some(pattern => pattern.test(name));

    if (hasNonEnglishChars) {
      return false; // Não é inglês
    }

    // Padrões comuns de nomes de cartas em outras línguas
    // Ex: "de", "del", "la", "le", "les" no início (comum em francês/espanhol)
    const nonEnglishStarters = /^(de|del|la|le|les|der|die|das|des|du|da|do|dos|das)\s/i;
    if (nonEnglishStarters.test(name) && name.length < 30) {
      // Mas pode ser uma carta legítima em inglês, então vamos ser mais conservadores
      // Só filtra se tiver outros indicadores
    }

    // Por padrão, assume que é inglês se não tiver caracteres especiais
    return true;
  });
}

/**
 * Tenta buscar apenas cartas em inglês adicionando parâmetro de query
 * Se o backend suportar, isso será mais eficiente
 */
export function addLanguageParam(endpoint: string, lang: string = 'en'): string {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}lang=${lang}`;
}

