import Image from "next/image"
//import { Inter } from "next/font/google"
import Head from "next/head"
//import ManualHeader from "@/components/ManualHeader"
import Header from "../components/Header"
import LotteryEntrance from "../components/LotteryEntrance"

export default function Home() {
    return (
        <main>
            <div>
                <Head>
                    <title>Decentralized raffle</title>
                    <meta name="description" content="Our smart contract lottery" />
                </Head>
                {/*<ManualHeader />*/}
                <Header />
                <LotteryEntrance />
            </div>
        </main>
    )
}
