export interface ActionHistoryItem {
  id: number;
  device: string;
  action: 'ON' | 'OFF';
  time: string;
  triggeredBy: string;
}

