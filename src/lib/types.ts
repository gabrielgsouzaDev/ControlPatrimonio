export type Asset = {
  id: string;
  name: string;
  codeId: string;
  city: string;
  value: number;
  observation?: string;
  category: string;
};

export type Anomaly = {
  codeId: string;
  anomalyType: string;
  description: string;
};

export type Category = {
    id: string;
    name: string;
};
