"use client"
import WalletAdapter from "./WalletAdapter"
import Link from "next/link"

const Header = () => {
    return(
        <div className="navbar justify-between">
            <Link href='/' className="btn">Solana Value Average</Link>
            <WalletAdapter/>
        </div>
    )
}

export default Header