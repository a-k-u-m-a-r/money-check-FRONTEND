import {useEffect, useState} from "react";
import SemiCircleChart from "./SemiCircleChart";

export default function FinancialHealth() {

    // {'valid': 1,
    //     'spendable': bank - credit_card_spend,
    //     'bank': bank,
    //     'cc':credit_card_spend }
    const formatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const [showPersonal, setShowPersonal] = useState(false)
    const [showNonNegotiable, setShowNonNegotiable] = useState(false)

    const [personalLimit, setPersonalLimit] = useState<number | undefined>(() => {
        const saved = localStorage.getItem("personalLimit")
        return saved !== null ? Number(saved) : undefined
    })
    const [personalLimitEnabled, setPersonalLimitEnabled] = useState(() => {
        return localStorage.getItem("personalLimitEnabled") === "true"
    })
    const [nonNegotiableLimit, setNonNegotiableLimit] = useState<number | undefined>(() => {
        const saved = localStorage.getItem("nonNegotiableLimit")
        return saved !== null ? Number(saved) : undefined
    })
    const [nonNegotiableLimitEnabled, setNonNegotiableLimitEnabled] = useState(() => {
        return localStorage.getItem("nonNegotiableLimitEnabled") === "true"
    })

    const updatePersonalLimit = (val: number | undefined) => {
        setPersonalLimit(val)
        if (val !== undefined) localStorage.setItem("personalLimit", String(val))
        else localStorage.removeItem("personalLimit")
    }
    const togglePersonalLimit = () => {
        const next = !personalLimitEnabled
        setPersonalLimitEnabled(next)
        localStorage.setItem("personalLimitEnabled", String(next))
    }
    const updateNonNegotiableLimit = (val: number | undefined) => {
        setNonNegotiableLimit(val)
        if (val !== undefined) localStorage.setItem("nonNegotiableLimit", String(val))
        else localStorage.removeItem("nonNegotiableLimit")
    }
    const toggleNonNegotiableLimit = () => {
        const next = !nonNegotiableLimitEnabled
        setNonNegotiableLimitEnabled(next)
        localStorage.setItem("nonNegotiableLimitEnabled", String(next))
    }

    const activePersonalLimit = personalLimitEnabled ? personalLimit : undefined
    const activeNonNegotiableLimit = nonNegotiableLimitEnabled ? nonNegotiableLimit : undefined

    const [bankInfo, setBankInfo] = useState({
        personalSpending: 0,
        personalBank: 0,
        personalCC: 0,
        nonNegotiableSpending: 0,
        nonNegotiableBank: 0,
        nonNegotiableCC: 0,
    })

    useEffect(() => {
        async function fetchBankInfo() {
            const response = await fetch("/api/balances")
            const data = await response.json()

            console.log(data)
            const sumValues = (arr: Record<string, number>[]) =>
                arr.reduce((total, item) => total + Object.values(item)[0], 0)

            setBankInfo({
                personalSpending: data["PERSONAL"]["differential"],
                personalBank: sumValues(data["PERSONAL"]["pos"]),
                personalCC: sumValues(data["PERSONAL"]["neg"]),
                nonNegotiableSpending: data["MANDATORY"]["differential"],
                nonNegotiableBank: sumValues(data["MANDATORY"]["pos"]),
                nonNegotiableCC: sumValues(data["MANDATORY"]["neg"]),
            })
        }

        fetchBankInfo()
    }, []);


    return (
        <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Health</h2>

                <div className="space-y-4">
                    {/* Personal Spending */}
                    <div className="bg-emerald-50 rounded-xl p-5 cursor-pointer select-none" onClick={() => setShowPersonal(!showPersonal)}>
                        <p className="text-lg text-emerald-700 font-medium">Personal Spending</p>
                        <SemiCircleChart
                            bank={bankInfo.personalBank}
                            spent={bankInfo.personalCC}
                            limit={activePersonalLimit}
                            spentColor="rgba(239, 68, 68, 0.8)"
                            remainingColor="rgba(59, 130, 246, 0.8)"
                        />
                        <p className="text-4xl font-bold text-emerald-900">
                            ${formatter.format(
                                activePersonalLimit !== undefined && activePersonalLimit < bankInfo.personalBank
                                    ? activePersonalLimit - bankInfo.personalCC
                                    : bankInfo.personalSpending
                            )}
                        </p>

                        {showPersonal && (
                            <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-600">Bank Balance</span>
                                    <span className="font-medium text-emerald-800">${formatter.format(bankInfo.personalBank)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-600">Credit Card Charges</span>
                                    <span className="font-medium text-red-600">-${formatter.format(bankInfo.personalCC)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={togglePersonalLimit}
                                            className={`relative w-8 h-4 rounded-full transition-colors ${personalLimitEnabled ? "bg-emerald-500" : "bg-gray-300"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${personalLimitEnabled ? "translate-x-4" : ""}`} />
                                        </button>
                                        <span className="text-emerald-600">Spending Limit</span>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="No limit"
                                        value={personalLimit ?? ""}
                                        onChange={(e) => updatePersonalLimit(e.target.value ? Number(e.target.value) : undefined)}
                                        disabled={!personalLimitEnabled}
                                        className={`w-24 px-2 py-1 text-right text-sm rounded border border-emerald-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 ${!personalLimitEnabled ? "opacity-50" : ""}`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Non-Negotiable Spending */}
                    <div className="bg-blue-50 rounded-xl p-5 cursor-pointer select-none" onClick={() => setShowNonNegotiable(!showNonNegotiable)}>
                        <p className="text-lg text-blue-700 font-medium">Non-Negotiable Spending</p>
                        <SemiCircleChart
                            bank={bankInfo.nonNegotiableBank}
                            spent={bankInfo.nonNegotiableCC}
                            limit={activeNonNegotiableLimit}
                            spentColor="rgba(239, 68, 68, 0.8)"
                            remainingColor="rgba(59, 130, 246, 0.8)"
                        />
                        <p className="text-4xl font-bold text-blue-900">
                            ${formatter.format(
                                activeNonNegotiableLimit !== undefined && activeNonNegotiableLimit < bankInfo.nonNegotiableBank
                                    ? activeNonNegotiableLimit - bankInfo.nonNegotiableCC
                                    : bankInfo.nonNegotiableSpending
                            )}
                        </p>

                        {showNonNegotiable && (
                            <div className="mt-3 pt-3 border-t border-blue-200 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-600">Bank Balance</span>
                                    <span className="font-medium text-blue-800">${formatter.format(bankInfo.nonNegotiableBank)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-600">Credit Card Charges</span>
                                    <span className="font-medium text-red-600">-${formatter.format(bankInfo.nonNegotiableCC)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={toggleNonNegotiableLimit}
                                            className={`relative w-8 h-4 rounded-full transition-colors ${nonNegotiableLimitEnabled ? "bg-blue-500" : "bg-gray-300"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${nonNegotiableLimitEnabled ? "translate-x-4" : ""}`} />
                                        </button>
                                        <span className="text-blue-600">Spending Limit</span>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="No limit"
                                        value={nonNegotiableLimit ?? ""}
                                        onChange={(e) => updateNonNegotiableLimit(e.target.value ? Number(e.target.value) : undefined)}
                                        disabled={!nonNegotiableLimitEnabled}
                                        className={`w-24 px-2 py-1 text-right text-sm rounded border border-blue-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 ${!nonNegotiableLimitEnabled ? "opacity-50" : ""}`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}