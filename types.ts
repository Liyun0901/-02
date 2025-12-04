export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  PROCESSING = 'PROCESSING',
  INTERACTIVE = 'INTERACTIVE'
}

export interface Dimensions {
  width: number;
  height: number;
}
