import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface HealthWeights {
  allocation: number;
  coverage: number;
  spof: number;
  busFactor: number;
}

export const DEFAULT_WEIGHTS: HealthWeights = {
  allocation: 30,
  coverage: 30,
  spof: 20,
  busFactor: 20,
};

interface HealthWeightsContextValue {
  weights: HealthWeights;
  setWeights: (weights: HealthWeights) => void;
  resetWeights: () => void;
  /** Normalized weights that sum to 1.0 */
  normalized: HealthWeights;
}

const HealthWeightsContext = createContext<HealthWeightsContextValue | null>(null);

export function HealthWeightsProvider({ children }: { children: ReactNode }) {
  const [weights, setWeightsRaw] = useState<HealthWeights>(() => {
    try {
      const stored = localStorage.getItem("tessira-health-weights");
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_WEIGHTS;
  });

  const setWeights = useCallback((w: HealthWeights) => {
    setWeightsRaw(w);
    localStorage.setItem("tessira-health-weights", JSON.stringify(w));
  }, []);

  const resetWeights = useCallback(() => {
    setWeightsRaw(DEFAULT_WEIGHTS);
    localStorage.removeItem("tessira-health-weights");
  }, []);

  const total = weights.allocation + weights.coverage + weights.spof + weights.busFactor;
  const normalized: HealthWeights = total > 0
    ? {
        allocation: weights.allocation / total,
        coverage: weights.coverage / total,
        spof: weights.spof / total,
        busFactor: weights.busFactor / total,
      }
    : { allocation: 0.25, coverage: 0.25, spof: 0.25, busFactor: 0.25 };

  return (
    <HealthWeightsContext.Provider value={{ weights, setWeights, resetWeights, normalized }}>
      {children}
    </HealthWeightsContext.Provider>
  );
}

export function useHealthWeights() {
  const ctx = useContext(HealthWeightsContext);
  if (!ctx) throw new Error("useHealthWeights must be used within HealthWeightsProvider");
  return ctx;
}
