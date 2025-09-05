export interface Transaction {
  id: number;
  amount: number;
  type: "income" | "expense";
  category_id: number;
  categories: {
    name: string;
  };
  note: string;
  transaction_at: string;
  created_at: string;
}

export interface ChartData {
  dates: string[];
  income: number[];
  expense: number[];
}

export interface CategoryData {
  name: string;
  value: number;
}
