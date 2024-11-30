export interface DailyData {
  date: string;
  steps: number;
  calories: number;
}

// Geçmiş verileri için array tipi
export type StepHistory = DailyData[];