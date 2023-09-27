export type AstElement = AstTopLayer | AstBottomLayerValue

export type AstTopLayer = {
  operand: 'AND' | 'OR',
  children: AstElement[]
}

export type AstBottomLayerValue = {
  key: string;
  type: string;
  system?: string;
  value: string | boolean | Array<string> | {min: number, max: number} | {min: Date | undefined, max: Date | undefined}
}
