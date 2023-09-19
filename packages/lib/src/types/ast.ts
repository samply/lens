export type Ast = {
    operand: 'AND' | 'OR',
    children: Ast[]
  } | {
    key: string,
    type: string,
    system: string,
    value: string | { min: number, max: number }
  }
  
  