export type ArmedStatus = 'full' | 'partial' | 'off' | 'unknown';
export interface HomeAlarmInfo {
  status: ArmedStatus;
  online: boolean;
  time: Date | number;
}
