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

    const [bankInfo, setBankInfo] = useState({
        personalSpending: 0,
        nonNegotiableSpending: 0
    })

    useEffect(() => {
        async function fetchBankInfo() {
            const response = await fetch("http://localhost:8000/balances")
            const data = await response.json()

            console.log(data)
            setBankInfo({
                personalSpending: data["PERSONAL"]["differential"],
                nonNegotiableSpending: data["MANDATORY"]["differential"]
            })
        }

        fetchBankInfo()
    }, []);


    return (
        <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Health</h2>

                <div className="space-y-4">
                    {/* Sub-card 1 */}
                    <div className="bg-emerald-50 rounded-xl p-5">
                        <p className="text-lg text-emerald-700 font-medium mb-1">Personal Spending</p>
                        <p className="text-4xl font-bold text-emerald-900">${formatter.format(bankInfo.personalSpending)}</p>
                    </div>

                    {/* Sub-card 2 */}
                    <div className="bg-blue-50 rounded-xl p-5">
                        <p className="text-lg text-blue-700 font-medium mb-1">Non-Negotiable Spending</p>
                        <p className="text-4xl font-bold text-blue-900">${formatter.format(bankInfo.nonNegotiableSpending)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}