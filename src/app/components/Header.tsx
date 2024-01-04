"use client"
import WalletAdapter from "./WalletAdapter"
import Link from "next/link"
import { UnifiedWalletButton } from "@jup-ag/wallet-adapter"

const Header = () => {
    return(
        <div className="navbar justify-between">
            <Link href='/' className="btn">Solana Value Average</Link>
            <UnifiedWalletButton/>
        </div>
    )
}

export default Header