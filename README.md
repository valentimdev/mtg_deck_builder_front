# MTG Deck Builder Front

Um deck builder para Magic: The Gathering focado no modo de jogo "Commander" que permite carregar, visualizar e gerenciar decks, com o objetivo de calcular o valor total em reais (BRL) usando preços da LigaMagic.

## 🎯 Objetivo

Este projeto visa criar uma ferramenta completa para:
- **Visualizar seus decks** de MTG com imagens e informações das cartas
- **Buscar e adicionar** novas cartas ao deck
- **Calcular o valor total** do deck em reais (BRL) através da integração com a LigaMagic
- **Gerenciar coleções** de forma intuitiva e visual
- **Exportar seus decks** em varios formatos diferentes


## 🚀 Como rodar o projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação
1. Clone o repositório:
```bash
git clone https://github.com/valentimdev/mtg_deck_builder_front.git
cd mtg-deck-builder-front
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador: `http://localhost:5173`

### Scripts disponíveis
- `npm run dev` - Executa o projeto em modo desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção localmente
- `npm run lint` - Executa verificação de código

## 🎮 Como usar

### Carregamento inicial
O projeto aceita a importação de decks através de um arquivo .txt simples, seguindo o formato padrão usado em sites como Moxfield, Archidekt, e TappedOut.

O formato básico é [Quantidade] [Nome da Carta], com uma carta por linha.

Como o projeto é focado em Commander, o importador reconhece seções separadas por comentários (linhas que começam com //) para identificar corretamente o Comandante, o baralho principal (as 99) e o Sideboard (geralmente usado para Companions ou cartas de "Wish").

Exemplo de arquivo .txt para Commander:

Exemplo:
```
//Commander
1 Atraxa, Praetors' Voice

//Main Deck
1 Sol Ring
1 Arcane Signet
1 Swords to Plowshares
1 Birds of Paradise
1 Ignoble Hierarch
1 Rhystic Study
1 Smothering Tithe
1 Farewell
1 Command Tower
1 Breeding Pool
1 Hallowed Fountain
1 Overgrown Tomb
1 Watery Grave
1 Temple Garden
1 Godless Shrine
5 Forest
5 Island
4 Plains
3 Swamp

//Sideboard
1 Lutri, the Spellchaser
```

### Interface
- **Sidebar esquerda**: Lista do deck atual com preview das cartas ao passar o mouse
- **Barra de busca**: Pesquise cartas na base do Scryfall e adicione ao deck
- **Grid principal**: Visualização em grade das cartas carregadas no deck

### Funcionalidades atuais
- Carregamento de deck via arquivo de texto
- Busca de cartas 
- Visualização com imagens em alta qualidade
- Adição/remoção de cartas do deck
- Preview de imagens ao passar o mouse
- Modal para visualização ampliada das cartas
- Cálculo automático do valor total do deck
- Exportação de listas de deck

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **APIs**: Scryfall (dados das cartas), LigaMagic (preços - em desenvolvimento)

## 📁 Estrutura do projeto

```
src/
├── components/          # Componentes React
├── contexts/           # Contextos React (estado global)
├── hooks/              # Hooks customizados
├── services/           # Integrações com APIs externas
├── types/              # Definições de tipos TypeScript
└── data/               # Dados mock para desenvolvimento
```


## 📝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request


**Nota**: Este projeto não é afiliado à Wizards of the Coast ou à LigaMagic. Magic: The Gathering é uma marca registrada da Wizards of the Coast LLC.