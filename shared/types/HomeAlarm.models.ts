export enum ArmedStatus {
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
  OFF = 'OFF',
  UNKNOWN = 'UNKNOWN'
}
export type HomeAlarmInfo = {
  status: ArmedStatus;
  online: boolean;
  time: Date;
};
