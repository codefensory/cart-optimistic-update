import shortid from "shortid";

export enum SpotState {
  Block,
  Pending,
  Complete,
  Error,
}

export class SpotItem {
  static create(action: Promise<any>) {
    const id = shortid.generate();
    return new SpotItem(id, action, undefined);
  }

  constructor(
    public id: string,
    public action: Promise<any>,
    public state: SpotState | undefined
  ) {}
}
