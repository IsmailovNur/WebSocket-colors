export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export type IncomingMessage =
  | { type: "DRAW_POINTS"; payload: Pixel[] }
  | { type: "CLEAR" };