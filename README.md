# MTG Deck Builder Frontend

Um aplicativo web moderno para construção e gerenciamento de decks de **Magic: The Gathering** focado no formato **Commander (EDH)**. Interface React completa que se integra com o backend FastAPI do projeto `edhelper`.

## 📋 Sobre o Projeto

Este é o frontend do **edhelper**, uma ferramenta completa para construção, análise e gerenciamento de decks de Commander. O frontend oferece uma interface visual intuitiva para todas as funcionalidades disponíveis no backend, incluindo:

- **Gerenciamento de Decks**: Criar, editar, renomear, copiar e deletar decks
- **Busca de Cartas**: Pesquisa avançada usando a API do Scryfall
- **Meta Cards**: Sugestões de cartas populares para comandantes via EDHREC
- **Validação de Deck**: Verificação de compatibilidade de cores e limite de cartas
- **Cálculo de Preços**: Valor total do deck em BRL (integração com LigaMagic)
- **Importação/Exportação**: Suporte para arquivos TXT
- **Estatísticas**: Análise detalhada do deck (terrenos, criaturas, magias, etc.)

## 🎯 Funcionalidades Principais

### Gerenciamento de Decks
- ✅ Visualização de todos os decks salvos
- ✅ Criação de novos decks
- ✅ Edição e renomeação de decks
- ✅ Cópia de decks existentes
- ✅ Exclusão de decks
- ✅ Importação de decks a partir de arquivos TXT
- ✅ Exportação de decks em formato TXT (com comandante no topo)

### Construção de Deck
- ✅ Adição e remoção de cartas
- ✅ Definição de comandante
- ✅ Visualização de imagens das cartas em alta qualidade
- ✅ Preview de cartas ao passar o mouse
- ✅ Modal detalhado com informações completas da carta
- ✅ Botão "+" para adicionar cópias de basic lands rapidamente
- ✅ Botão "-" para reduzir quantidade de basic lands
- ✅ Validação de compatibilidade de cores com o comandante
- ✅ Avisos visuais para decks ilegais (mais de 100 cartas ou cores incompatíveis)

### Busca e Pesquisa
- ✅ Busca de cartas por nome (autocomplete)
- ✅ Integração com Scryfall API
- ✅ Visualização de resultados em grid
- ✅ Filtro de idioma (português preferencial)
- ✅ Top 100 comandantes mais populares
- ✅ Meta cards por comandante (categorias do EDHREC)

### Análise e Estatísticas
- ✅ Cálculo do preço total do deck (excluindo basic lands)
- ✅ Identificação de cartas sem preço disponível
- ✅ Estatísticas detalhadas:
  - Número de terrenos
  - Número de criaturas
  - Número de encantamentos
  - Número de magias instantâneas
  - Número de feitiços
  - Número de artefatos
- ✅ Contador total de cartas no deck

## 🛠️ Tecnologias

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool e dev server ultra-rápido
- **Tailwind CSS 4** - Framework CSS utility-first
- **React Router DOM 7** - Roteamento para aplicações React
- **date-fns** - Biblioteca para manipulação de datas

## 📦 Pré-requisitos

- **Node.js** versão 18 ou superior
- **npm** ou **yarn** como gerenciador de pacotes
- **Backend edhelper** rodando (veja [README do backend](../mtg-deck/README.md))

## 🚀 Instalação

1. **Clone o repositório** (se ainda não tiver):
```bash
git clone <repository-url>
cd mtg_project/mtg_deck_builder_front
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente** (veja seção [Configuração](#-configuração))

4. **Inicie o servidor de desenvolvimento**:
```bash
npm run dev
```

5. **Acesse a aplicação**:
```
http://localhost:5173
```

## ⚙️ Configuração

### Configuração do Backend

Certifique-se de que o backend está rodando antes de iniciar o frontend:

```bash
# No diretório do backend
edhelper start-editor
```

## 📖 Como Usar

### Gerenciamento de Decks

1. **Página Inicial**: Ao acessar a aplicação, você verá a lista de todos os seus decks
2. **Criar Novo Deck**: Clique em "Criar Novo Deck" e digite o nome
3. **Importar Deck**: Clique em "Importar Deck" e selecione um arquivo TXT
4. **Abrir Deck**: Clique em "Abrir" em qualquer deck para editá-lo

### Construção de Deck

1. **Adicionar Comandante**:
   - Busque a carta desejada
   - Clique na carta e selecione "Definir como Comandante"

2. **Adicionar Cartas**:
   - Use a barra de busca para encontrar cartas
   - Clique em uma carta para adicioná-la ao deck
   - Para basic lands, use o botão "+" para adicionar mais cópias rapidamente

3. **Remover Cartas**:
   - Clique no botão "×" para remover uma carta completamente
   - Para basic lands, use o botão "-" para reduzir a quantidade

4. **Visualizar Cartas**:
   - Passe o mouse sobre uma carta para ver um preview
   - Clique em uma carta para ver detalhes completos em um modal

### Abas de Visualização

- **Meu Deck**: Visualiza todas as cartas do seu deck atual
- **Pesquisa**: Resultados da busca de cartas
- **Meta**: Cartas populares sugeridas para o seu comandante (via EDHREC)

### Exportar Deck

1. No editor de deck, clique em "Exportar TXT"
2. O arquivo será baixado com o nome do deck
3. O comandante aparecerá no topo do arquivo

### Formato de Importação TXT

O arquivo deve seguir o formato padrão usado em sites como Moxfield, Archidekt e TappedOut:

```
//Commander
1 Atraxa, Praetors' Voice

//Main Deck
1 Sol Ring
1 Arcane Signet
5 Forest
5 Island
...

//Sideboard
1 Lutri, the Spellchaser
```

## 📁 Estrutura do Projeto

```
mtg_deck_builder_front/
├── public/                 # Arquivos estáticos
│   ├── alerta.webm        # Vídeo de alerta
│   └── ...
├── src/
│   ├── api/               # Cliente API
│   │   └── api.ts         # Configuração do cliente HTTP
│   ├── components/        # Componentes React
│   │   ├── CardGrid.tsx   # Grid de visualização de cartas
│   │   ├── DeckCard.tsx   # Card de deck na lista
│   │   ├── DeckList.tsx   # Lista lateral do deck
│   │   ├── LoadingOverlay.tsx
│   │   ├── RefreshButton.tsx
│   │   └── SearchBar.tsx  # Barra de busca
│   ├── contexts/          # Contextos React
│   │   ├── CardDialogContext.tsx  # Modal de detalhes da carta
│   │   └── DeckContext.tsx
│   ├── hooks/             # Hooks customizados
│   │   ├── useDeck.ts     # Gerenciamento de estado do deck
│   │   └── useScryfall.ts
│   ├── pages/             # Páginas da aplicação
│   │   ├── DeckBuilderPage.tsx   # Editor de deck
│   │   └── DeckManagerPage.tsx    # Gerenciador de decks
│   ├── services/          # Serviços e integrações
│   │   ├── cardService.ts
│   │   ├── deckService.ts  # Serviço de decks
│   │   ├── importService.ts  # Importação de decks
│   │   └── scryfall/       # Integração com Scryfall
│   │       ├── cardHelpers.ts
│   │       ├── commanderService.ts
│   │       ├── scryfallService.ts
│   │       └── types.ts
│   ├── types/             # Definições TypeScript
│   │   └── deck.ts
│   ├── App.tsx            # Componente raiz
│   ├── main.tsx           # Ponto de entrada
│   └── index.css          # Estilos globais
├── .env                   # Variáveis de ambiente (criar)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎮 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (porta 5173)

## 🔌 Integração com Backend

O frontend se comunica com o backend através de uma API REST. Todas as requisições são feitas através do cliente configurado em `src/api/api.ts`.

### Endpoints Principais

- `GET /api/decks/` - Lista todos os decks
- `GET /api/decks/{id}` - Busca um deck específico
- `POST /api/decks/` - Cria um novo deck
- `PUT /api/decks/{id}` - Atualiza um deck
- `DELETE /api/decks/{id}` - Deleta um deck
- `POST /api/decks/{id}/add` - Adiciona carta ao deck
- `POST /api/decks/{id}/remove` - Remove carta do deck
- `POST /api/decks/{id}/commander` - Define comandante
- `GET /api/decks/{id}/txt` - Exporta deck como TXT
- `POST /api/decks/import-txt` - Importa deck de arquivo TXT
- `GET /api/card/search` - Busca cartas
- `GET /api/card/top-commanders` - Top 100 comandantes
- `GET /api/commander/{name}/meta/all` - Meta cards do comandante

### Autenticação

Todas as requisições incluem headers de autenticação:
- `x-api-key`: Sua chave de API
- `x-client-id`: Seu ID de cliente

Essas credenciais são configuradas via variáveis de ambiente.

## ✨ Features Implementadas

### Interface do Usuário
- ✅ Design moderno e responsivo com Tailwind CSS
- ✅ Tema escuro consistente
- ✅ Animações suaves e feedback visual
- ✅ Tooltips informativos
- ✅ Modais para detalhes de cartas
- ✅ Preview de cartas ao hover
- ✅ Scrollbars customizados

### Funcionalidades de Deck
- ✅ Validação de compatibilidade de cores
- ✅ Avisos para decks ilegais (mais de 100 cartas)
- ✅ Cálculo de preços (excluindo basic lands)
- ✅ Estatísticas detalhadas do deck
- ✅ Tratamento especial para basic lands
- ✅ Comandante sempre visível em seção dedicada

### Performance
- ✅ Atualizações otimistas de estado
- ✅ Prevenção de chamadas duplicadas
- ✅ Debounce na busca de cartas
- ✅ Lazy loading de imagens

## 🐛 Troubleshooting

### Backend não está respondendo

1. Verifique se o backend está rodando:
```bash
curl http://localhost:3839/api/decks/
```

2. Verifique as variáveis de ambiente no arquivo `.env`

3. Verifique se as credenciais da API estão corretas

### Erro de CORS

Se você encontrar erros de CORS, certifique-se de que o backend está configurado para aceitar requisições do frontend. O backend deve permitir requisições de `http://localhost:5173`.

### Porta já em uso

Se a porta 5173 estiver em uso, o Vite tentará usar a próxima porta disponível. Verifique o console para ver qual porta está sendo usada.

## 📝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

[Adicione informações de licença aqui]

## 🙏 Agradecimentos

- **Scryfall** - API de dados de cartas de Magic: The Gathering
- **EDHREC** - Dados de meta e popularidade de comandantes
- **LigaMagic** - Preços de cartas no mercado brasileiro

## ⚠️ Nota Legal

Este projeto não é afiliado à **Wizards of the Coast** ou à **LigaMagic**.

**Magic: The Gathering** é uma marca registrada da **Wizards of the Coast LLC**.

---

**Desenvolvido com ❤️ para a comunidade de Commander**
