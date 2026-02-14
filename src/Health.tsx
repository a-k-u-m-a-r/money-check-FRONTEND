import {useEffect, useState} from "react";

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
            const response = await fetch("http://localhost:8000/balances")
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
                        <p className="text-lg text-emerald-700 font-medium mb-1">Personal Spending</p>
                        <p className="text-4xl font-bold text-emerald-900">${formatter.format(bankInfo.personalSpending)}</p>
                        {showPersonal && (
                            <div className="mt-3 pt-3 border-t border-emerald-200 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-600">Bank Balance</span>
                                    <span className="font-medium text-emerald-800">${formatter.format(bankInfo.personalBank)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-emerald-600">Credit Card Charges</span>
                                    <span className="font-medium text-red-600">-${formatter.format(bankInfo.personalCC)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Non-Negotiable Spending */}
                    <div className="bg-blue-50 rounded-xl p-5 cursor-pointer select-none" onClick={() => setShowNonNegotiable(!showNonNegotiable)}>
                        <p className="text-lg text-blue-700 font-medium mb-1">Non-Negotiable Spending</p>
                        <p className="text-4xl font-bold text-blue-900">${formatter.format(bankInfo.nonNegotiableSpending)}</p>
                        {showNonNegotiable && (
                            <div className="mt-3 pt-3 border-t border-blue-200 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-600">Bank Balance</span>
                                    <span className="font-medium text-blue-800">${formatter.format(bankInfo.nonNegotiableBank)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-600">Credit Card Charges</span>
                                    <span className="font-medium text-red-600">-${formatter.format(bankInfo.nonNegotiableCC)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}