export type SerialInputSource = 'KEYBOARD' | 'PASTE' | 'USB_SCANNER' | 'CAMERA';

export interface ScannedSerialItem {
  id: string;
  serialNumber: string;
  source: SerialInputSource;
  status: 'READY' | 'DUPLICATE' | 'CONFLICT' | 'INVALID';
  message?: string;
  timestamp: number;
}

export type CameraScannerMode = 'single' | 'continuous';
