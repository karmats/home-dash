export type ArmedStatus = 'full' | 'partial' | 'off' | 'unknown';
export interface HomeAlarmInfo {
  status: 'full' | 'partial' | 'off' | 'unknown';
  online: boolean;
  time: Date | number;
}
