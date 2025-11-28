// Interface da carta do backend
export interface BackendCard {
  id: string;
  name: string;
  colors: string;
  color_identity: string;
  cmc: number;
  mana_cost: string;
  image: string;
  art: string;
  legal_commanders: boolean;
  is_commander: number;
  price: string;
  edhrec_rank: number | null;
  type_line: string;
}

// Alias para compatibilidade - agora BackendCard é o tipo principal
export type ScryfallCard = BackendCard;

export interface ScryfallSearchResponse {
  object: string;
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: BackendCard[];
}

export interface ScryfallError {
  object: 'error';
  code: string;
  status: number;
  details: string;
}
