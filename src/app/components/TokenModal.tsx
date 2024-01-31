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
  ChangeEventHandler,
} from "react";
import { FixedSizeList } from "react-window";

interface TokenModalProps {
  tokenList: Token[];
  onSelectToken: (token: Token) => void;
  defaultToken?: Token;
}

const TokenModal: React.FC<TokenModalProps> = ({
  tokenList,
  onSelectToken,
  defaultToken,
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

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    setSearchTerm(event.target.value);
  };

  const handleTokenSelection = (token: Token) => {
    setSelectedToken(token);
    onSelectToken(token);
    handleClose();
  };

  useEffect(() => {
    const search = () => {
      const searchTermLower = searchTerm.toLowerCase().trim();

      if (!searchTermLower) {
        setResults(tokenList);
      } else {
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        event.preventDefault();
        handleClose();
      }
    };

    modalRef.current?.addEventListener("keydown", handleKeyDown);

    return () =>
      modalRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div>
      <button className="btn flex items-center w-full" onClick={handleOpen}>
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
            height={7 * 55} // Adjust height as needed
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
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default TokenModal;
