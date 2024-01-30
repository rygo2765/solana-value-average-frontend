import {
  findTokenByAddress,
  getAllTokens,
  Token,
  shortenAddress,
} from "@/lib/helpers";
import React, {
  useState,
  useRef,
  useEffect,
  MouseEventHandler,
  useMemo,
  ChangeEventHandler,
} from "react";
import { FixedSizeList } from "react-window";

interface TokenModalProps {
  tokenList: Token[];
  onSelectToken: (token: Token) => void;
  defaultToken?: Token;
  tokensIndexMap: { [key: string]: Token };
}

const TokenModal: React.FC<TokenModalProps> = ({
  tokenList,
  onSelectToken,
  defaultToken,
  tokensIndexMap,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(
    defaultToken || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Token[]>([]);

  const modalRef = useRef<HTMLDialogElement>(null);

  const handleOpen: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    setIsOpen(true);
    modalRef.current?.focus();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      handleClose();
    }
  };

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    const search = () => {
      const searchTermLower = searchTerm.toLowerCase().trim();

      if (!searchTermLower) {
        // If the search term is empty, display all tokens
        setResults(tokenList);
      } else {
        // If there's a search term
        const filteredResults = tokenList.filter(
          (token) =>
            token.name.toLowerCase().includes(searchTermLower) ||
            token.symbol.toLowerCase().includes(searchTermLower)
        );

        setResults(filteredResults);
      }
    };

    search();
  }, [searchTerm, tokenList]);

  const handleTokenSelection = (token: Token) => {
    setSelectedToken(token);
    onSelectToken(token);
    handleClose();
  };

  useEffect(() => {
    // Add event listener for ESC key press
    modalRef.current?.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove event listener
    return () =>
      modalRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // useEffect(() => {
  //   const initialToken = defaultToken!;
  //   setSelectedToken(initialToken);
  // }),
  //   [tokenList, defaultToken];

  return (
    <div>
      <button className="btn flex items-center" onClick={handleOpen}>
        {selectedToken && (
          <>
            <img
              src={selectedToken.logoURI}
              alt={selectedToken.symbol}
              className="max-w-8 max-h-8 rounded-full mr-2"
            />
            {selectedToken.symbol}
          </>
        )}
      </button>
      <dialog
        ref={modalRef}
        id="my_modal_3"
        className="modal"
        open={isOpen}
        onClose={handleClose}
      >
        <div className="modal-box">
          <input
            type="text"
            placeholder="Search for a token..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full h-10 p-2 rounded-md"
          />
          <FixedSizeList
            height={897} // Adjust height as needed
            width={448} // Adjust width as needed
            itemSize={55} // Adjust itemSize based on token list item height
            itemCount={results.length}
            overscanCount={4}
            className="mt-5"
          >
            {({ index, style }) => (
              <li
                key={results[index].address}
                style={style}
                className="list-none p-0 m-0"
              >
                <button
                  className="flex flex-row items-center"
                  onClick={() => handleTokenSelection(results[index])}
                >
                  <img
                    src={results[index].logoURI}
                    alt={results[index].symbol}
                    className="max-w-8 max-h-8 rounded-full mx-4"
                  />
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                      <p className="mr-3 text-white font-bold">
                        {results[index].symbol}
                      </p>
                      <a
                        href={`https://solscan.io/token/${results[index].address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs"
                      >
                        {shortenAddress(results[index].address)}
                      </a>
                    </div>
                    <p className="text-left">{results[index].name}</p>
                  </div>
                </button>
              </li>
            )}
          </FixedSizeList>
        </div>
      </dialog>
    </div>
  );
};

export default TokenModal;
