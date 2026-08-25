import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
];

type CategoryData = {
  category: string;
  total: number;
};

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No billed items in this range.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(props) => {
            const category = props.payload?.category ?? "";
            const percent = props.percent ?? 0;

            return `${category} (${(percent * 100).toFixed(0)}%)`;
          }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value) => {
            const amount = Number(value ?? 0);
            return `$${amount.toFixed(2)}`;
          }}
        />

        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
