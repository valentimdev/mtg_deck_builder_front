import type { BackendCard } from './types';

// Helper para acessar image_uris de forma compatível com o código existente
export function getImageUris(card: BackendCard) {
  return {
    small: card.image,
    normal: card.image,
    large: card.image,
    png: card.image,
    art_crop: card.art,
    border_crop: card.image,
  };
}

// Helper para obter colors como array
export function getColorsArray(card: BackendCard): string[] {
  return card.colors ? card.colors.split('') : [];
}

// Helper para obter color_identity como array
export function getColorIdentityArray(card: BackendCard): string[] {
  return card.color_identity ? card.color_identity.split('') : [];
}

/**
 * Verifica se uma carta é compatível com a color identity do comandante
 * Uma carta é compatível se sua color_identity é um subconjunto da color_identity do comandante
 */
export function isCardCompatibleWithCommander(
  card: BackendCard | null,
  commander: BackendCard | null
): boolean {
  if (!card || !commander) return true; // Se não houver carta ou comandante, assume compatível

  const cardColors = getColorIdentityArray(card);
  const commanderColors = getColorIdentityArray(commander);

  // Se a carta não tem cores (incolor), é sempre compatível
  if (cardColors.length === 0) return true;

  // Verifica se todas as cores da carta estão na color identity do comandante
  return cardColors.every(color => commanderColors.includes(color));
}

/**
 * Verifica se uma carta é uma basic land
 */
export function isBasicLand(card: BackendCard | null): boolean {
  if (!card) return false;

  const basicLandNames = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
  const isBasicLandByName = basicLandNames.includes(card.name);
  const isBasicLandByType = card.type_line?.toLowerCase().includes('basic land') || false;

  return isBasicLandByName || isBasicLandByType;
}

/**
 * Verifica se uma carta é um terreno (land)
 */
export function isLand(card: BackendCard | null): boolean {
  if (!card) return false;
  return card.type_line?.toLowerCase().includes('land') || false;
}

