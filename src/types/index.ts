// Ana veri tipi
export interface DailyData {
  date: string;
  steps: number;
  calories: number;
}

// Geçmiş verileri için array tipi
export type StepHistory = DailyData[];

// Widget veri tipi
export interface WidgetData extends DailyData {
  lastUpdated: number; // timestamp
}

// Sensör verisi için tip
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

// Step Counter modülü için tip
export interface StepCounterModule {
  updateWidget: (steps: number, calories: number) => Promise<void>;
  startStepCounter: () => void;
  stopStepCounter: () => void;
  getStepCount: () => Promise<DailyData>;
}

// Hook dönüş tipi
export interface StepCounterHook {
  steps: number;
  calories: number;
  history: StepHistory;
}

// Hata tipleri
export type StepCounterError = {
  code: string;
  message: string;
  details?: unknown;
}