import SearchBar from './components/SearchBar';
import DeckList from './components/DeckList';
import { useDeck } from './hooks/useDeck';

function App() {
  const deckState = useDeck();

  return (
    <>
      <div className="flex justify-center items-center w-full h-full border border-white p-10">
        <div className="flex w-full h-full border border-white">
          <div className="border border-amber-400 h-full w-80">
            <DeckList {...deckState} />
          </div>

          <div className="flex flex-col flex-1 h-full">
            <div className="border border-blue-500 w-full h-30">
              <SearchBar />
            </div>

            <div className="flex-1 border border-green-500 w-full"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
