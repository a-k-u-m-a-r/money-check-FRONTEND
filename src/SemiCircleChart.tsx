import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

interface SemiCircleChartProps {
    bank: number;
    spent: number;
    limit?: number;
    spentColor?: string;
    remainingColor?: string;
}

export default function SemiCircleChart({
    bank,
    spent,
    limit,
    spentColor = "rgba(239, 68, 68, 0.8)",
    remainingColor = "rgba(34, 197, 94, 0.8)",
}: SemiCircleChartProps) {
    // Use limit if provided and smaller than bank, otherwise use bank
    const effectiveTotal = limit !== undefined && limit < bank ? limit : bank;
    const remaining = Math.max(effectiveTotal - spent, 0);

    const data = {
        labels: ["Spent", "Remaining"],
        datasets: [
            {
                data: [spent, remaining],
                backgroundColor: [spentColor, remainingColor],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        circumference: 180,
        rotation: -90,
        cutout: "70%",
        plugins: {
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <div className="relative flex flex-col items-center -my-2" style={{ maxWidth: 160, margin: "0 auto" }}>
            <Doughnut data={data} options={options} />
        </div>
    );
}
