import { findTokenByAddress, getAllTokens, Token } from "@/lib/helpers";
import React, {
  useState,
  useRef,
  useEffect,
  MouseEventHandler,
  use,
  ChangeEventHandler,
} from "react";

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
    event.preventDefault();
    if (event.key === "Escape" && isOpen) {
      handleClose();
    }
  };

  const handleSearchChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    event.preventDefault();
    setSearchTerm(event.target.value);
  };

  const filteredTokens =
    searchTerm.trim() === ""
      ? tokenList
      : tokenList.filter(
          (token) =>
            token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.address.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleTokenSelection = (token: Token) => {
    setSelectedToken(token);
    onSelectToken(token);
    handleClose;
  };

  useEffect(() => {
    // Add event listener for ESC key press
    modalRef.current?.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove event listener
    return () =>
      modalRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const initialToken = defaultToken!;
    setSelectedToken(initialToken);
  }),
    [tokenList, defaultToken];

  // useEffect(() => {
  //   async function findTokenInfo() {
  //     const allTokens: Token[] = await getAllTokens();

  //     const targetAddress = "So11111111111111111111111111111111111111112";
  //     const foundToken = findTokenByAddress(allTokens, targetAddress);

  //     if (foundToken) {
  //       console.log("Token Info: ", foundToken);
  //     } else {
  //       console.log("Token not found");
  //     }
  //   }

  //   findTokenInfo();
  // }, []);

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
          <h3 className="font-bold text-lg">Select Tokens</h3>
          <input
            type="text"
            placeholder="Search for a token..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <ul>
            {filteredTokens.map((token) => (
              <li key={token.address}>
                <button onClick={() => handleTokenSelection(token)}>
                  {token.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </div>
  );
};

export default TokenModal;
