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
    const [showDatePicker, setShowDatePicker] = useState(false)

    const [fromDate, setFromDate] = useState<string>(() => {
        return localStorage.getItem("fromDate") || ""
    })
    const updateFromDate = (val: string) => {
        setFromDate(val)
        if (val) localStorage.setItem("fromDate", val)
        else localStorage.removeItem("fromDate")
    }

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

    const [loading, setLoading] = useState(true)
    const [bankInfo, setBankInfo] = useState({
        personalSpending: 0,
        personalBank: 0,
        personalCC: 0,
        personalPosNeg: 0,
        nonNegotiableSpending: 0,
        nonNegotiableBank: 0,
        nonNegotiableCC: 0,
        nonNegotiablePosNeg: 0,
    })

    useEffect(() => {
        async function fetchBankInfo() {
            setLoading(true)
            const url = fromDate ? `/api/balances?from_date=${fromDate}` : "/api/balances"
            const response = await fetch(url)
            const data = await response.json()

            console.log(data)
            const sumValues = (arr: Record<string, number>[]) =>
                arr.reduce((total, item) => total + Object.values(item)[0], 0)

            const sumPosNegSpending = (arr: Record<string, { acc_id: string; from_date: string; total_spending: number }>[]) =>
                arr.reduce((total, item) => total + Object.values(item)[0].total_spending, 0)

            const personalPosNeg = sumPosNegSpending(data["PERSONAL"]["pos_neg"] || [])
            const personalBank = sumValues(data["PERSONAL"]["pos"])
            const personalCC = sumValues(data["PERSONAL"]["neg"])

            const nonNegotiablePosNeg = sumPosNegSpending(data["MANDATORY"]["pos_neg"] || [])
            const nonNegotiableBank = sumValues(data["MANDATORY"]["pos"])
            const nonNegotiableCC = sumValues(data["MANDATORY"]["neg"])

            setBankInfo({
                personalSpending: personalBank - personalCC,
                personalBank: personalBank,
                personalCC: personalCC,
                personalPosNeg: personalPosNeg,
                nonNegotiableSpending: nonNegotiableBank - nonNegotiableCC,
                nonNegotiableBank: nonNegotiableBank,
                nonNegotiableCC: nonNegotiableCC,
                nonNegotiablePosNeg: nonNegotiablePosNeg,
            })
            setLoading(false)
        }

        fetchBankInfo()
    }, [fromDate]);


    return (
        <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h2
                    className="text-2xl font-bold text-gray-800 mb-4 cursor-pointer select-none"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                >
                    Health{fromDate && ` - ${new Date(fromDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                </h2>

                {showDatePicker && (
                    <div className="flex items-center gap-3 mb-6">
                        <label className="text-sm text-gray-600">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={(e) => updateFromDate(e.target.value)}
                            className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        {fromDate && (
                            <button
                                onClick={() => updateFromDate("")}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Personal Spending */}
                    <div className="bg-emerald-50 rounded-xl p-5 cursor-pointer select-none" onClick={() => setShowPersonal(!showPersonal)}>
                        <p className="text-lg text-emerald-700 font-medium">Personal Spending</p>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                <SemiCircleChart
                                    bank={bankInfo.personalBank + bankInfo.personalPosNeg}
                                    spent={bankInfo.personalCC + bankInfo.personalPosNeg}
                                    limit={activePersonalLimit}
                                    spentColor="rgba(239, 68, 68, 0.8)"
                                    remainingColor="rgba(59, 130, 246, 0.8)"
                                />
                                <p className="text-4xl font-bold text-emerald-900">
                                    ${formatter.format(
                                        activePersonalLimit !== undefined && activePersonalLimit < bankInfo.personalBank + bankInfo.personalPosNeg
                                            ? activePersonalLimit - bankInfo.personalCC - bankInfo.personalPosNeg
                                            : bankInfo.personalSpending
                                    )}
                                </p>

                                {showPersonal && (
                                    <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-emerald-600">Bank Balance</span>
                                            <span className="font-medium text-emerald-800">${formatter.format(bankInfo.personalBank + bankInfo.personalPosNeg)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-emerald-600">Total Spending</span>
                                            <span className="font-medium text-red-600">-${formatter.format(bankInfo.personalCC + bankInfo.personalPosNeg)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs pl-3">
                                            <span className="text-emerald-500">Credit Card Charges</span>
                                            <span className="text-red-400">-${formatter.format(bankInfo.personalCC)}</span>
                                        </div>
                                        {bankInfo.personalPosNeg > 0 && (
                                            <div className="flex justify-between text-xs pl-3">
                                                <span className="text-emerald-500">Bank Account Spending</span>
                                                <span className="text-red-400">-${formatter.format(bankInfo.personalPosNeg)}</span>
                                            </div>
                                        )}
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
                            </>
                        )}
                    </div>

                    {/* Non-Negotiable Spending */}
                    <div className="bg-blue-50 rounded-xl p-5 cursor-pointer select-none" onClick={() => setShowNonNegotiable(!showNonNegotiable)}>
                        <p className="text-lg text-blue-700 font-medium">Non-Negotiable Spending</p>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                <SemiCircleChart
                                    bank={bankInfo.nonNegotiableBank + bankInfo.nonNegotiablePosNeg}
                                    spent={bankInfo.nonNegotiableCC + bankInfo.nonNegotiablePosNeg}
                                    limit={activeNonNegotiableLimit}
                                    spentColor="rgba(239, 68, 68, 0.8)"
                                    remainingColor="rgba(59, 130, 246, 0.8)"
                                />
                                <p className="text-4xl font-bold text-blue-900">
                                    ${formatter.format(
                                        activeNonNegotiableLimit !== undefined && activeNonNegotiableLimit < bankInfo.nonNegotiableBank + bankInfo.nonNegotiablePosNeg
                                            ? activeNonNegotiableLimit - bankInfo.nonNegotiableCC - bankInfo.nonNegotiablePosNeg
                                            : bankInfo.nonNegotiableSpending
                                    )}
                                </p>

                                {showNonNegotiable && (
                                    <div className="mt-3 pt-3 border-t border-blue-200 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-600">Bank Balance</span>
                                            <span className="font-medium text-blue-800">${formatter.format(bankInfo.nonNegotiableBank + bankInfo.nonNegotiablePosNeg)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-600">Total Spending</span>
                                            <span className="font-medium text-red-600">-${formatter.format(bankInfo.nonNegotiableCC + bankInfo.nonNegotiablePosNeg)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs pl-3">
                                            <span className="text-blue-500">Credit Card Charges</span>
                                            <span className="text-red-400">-${formatter.format(bankInfo.nonNegotiableCC)}</span>
                                        </div>
                                        {bankInfo.nonNegotiablePosNeg > 0 && (
                                            <div className="flex justify-between text-xs pl-3">
                                                <span className="text-blue-500">Bank Account Spending</span>
                                                <span className="text-red-400">-${formatter.format(bankInfo.nonNegotiablePosNeg)}</span>
                                            </div>
                                        )}
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}