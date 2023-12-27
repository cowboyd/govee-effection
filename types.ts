import type { Operation } from "effection";

export type ScanResponse = GoveeResponse<"scan", {
  ip: string;
  device: string;
  sku: string;
  bleVersionHard: string;
  bleVersionSoft: string;
  wifiVersionHard: string;
  wifiVersionSoft: string;
}>;

export interface GoveeResponse<TCmd, TData> {
  msg: {
    cmd: TCmd;
    data: TData;
  };
}

export type StatusResponse = GoveeResponse<"devStatus", {
  onOff: 0;
  brightness: 75;
  color: { r: 255; g: 50; b: 30 };
  colorTemInKelvin: 0;
}>;

export interface GoveeDevice {
  on(): Operation<void>;
  off(): Operation<void>;
  brightness(value: number): Operation<void>;
  devStatus(): Operation<StatusResponse["msg"]["data"]>;
}
