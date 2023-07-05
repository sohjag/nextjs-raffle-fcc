import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const dispatch = useNotification()

    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    console.log("chain id is ", { chainId }.chainId)
    // console.log(`ChainId is ${chainId}`)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    console.log("raffle address is ", { raffleAddress }.raffleAddress)
    const [entranceFee, setEntranceFee] = useState("0")
    //console.log(isWeb3Enabled)
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const [playerCount, setPlayerCount] = useState("0")

    // const { runContractFunction: enterRaffle } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: raffleAddress,
    //     functionName: "enterRaffle",
    //     params: {},
    //     msgValue: entranceFee,
    // })

    async function updateUI() {
        const getEntranceFeeFromCallHex = await getEntranceFee()
        const getEntranceFeeFromCall = parseInt(getEntranceFeeFromCallHex)

        // console.log(getEntranceFeeFromCall)
        // console.log(
        //     "entrance fee parsed is ",
        //     ethers.utils.formatEther(getEntranceFeeFromCall.toString())
        // )

        const getNumPlayersFromCall = await getNumberOfPlayers()
        const getRecentWinnerFromCall = await getRecentWinner()
        setNumPlayers(parseInt(getNumPlayersFromCall))
        setRecentWinner(getRecentWinnerFromCall.toString())
        setEntranceFee(ethers.utils.formatEther(getEntranceFeeFromCall.toString()))
    }
    async function enterRaffleAlt() {
        //const ethAmount = "10"
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(raffleAddress, abi, signer)
        console.log(contract)

        const txResponse = await contract.enterRaffle({
            value: ethers.utils.parseEther(entranceFee),
        })

        txResponse.wait(1).then(async (receipt) => {
            // console.log(receipt);
            if (receipt && receipt.status == 1) {
                setPlayerCount(playerCount + 1)
                dispatch({
                    type: "info",
                    message: "Transaction complete",
                    title: "Transaction notification",
                    position: "bottomR",
                })
            }
        })
        //await listenForTransactionMine(txResponse, provider)
        //const balance = await provider.getBalance(contractAddress)

        // const balance = await contract.getContractBalance()
        // console.log(balance)
        // document.getElementById("FundMeBalance").innerHTML = ethers.utils.formatEther(
        //   balance.toString()
        // )
    }

    // function winnerPicked() {
    //     const provider = new ethers.providers.Web3Provider(window.ethereum)
    //     const signer = provider.getSigner()
    //     const contract = new ethers.Contract(raffleAddress, abi, signer)

    //     contract.on("WinnerPicked", (winnerAddress) => {
    //         setRecentWinner(winnerAddress.toString())
    //     })
    // }
    // winnerPicked()

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled, playerCount])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotifiation(tx)
    }

    const handleNewNotifiation = function () {
        dispatch({
            type: "info",
            message: "Transaction complete",
            title: "Transaction notification",
            position: "bottomR",
            icon: "bell",
        })
    }
    return (
        <div className="p-5">
            Hi from Lottery Entrance
            {raffleAddress ? (
                <div>
                    Entrance fee is {entranceFee} ETH
                    <button
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async function () {
                            //console.log("button clicked")
                            await enterRaffleAlt({
                                onSuccess: handleSuccess,
                                onError: (error) => {
                                    console.log(error)
                                },
                            })
                        }}
                        //disabled={isLoading || isFetching}
                    >
                        Enter Raffle
                    </button>
                    <div>Number of players in the raffle: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No raffle adress detected. You may be on the wrong chain.</div>
            )}
        </div>
    )
}
