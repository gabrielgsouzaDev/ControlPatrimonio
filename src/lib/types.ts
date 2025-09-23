export type Asset = {
  id: string;
  name: string;
  codeId: string;
  city: string;
  value: number;
  observation?: string;
};

export type Anomaly = {
  codeId: string;
  anomalyType: string;
  description: string;
};
