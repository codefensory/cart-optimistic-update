import { OnlineShop } from "../onlineShop";

export class StorageFeature {
  constructor(private shop: OnlineShop, private prefix: string | undefined) {}

  set(key: string, value: string) {
    if (!this.isAvalible()) {
      return;
    }

    window.localStorage.setItem(this.withPrefix(key), value);
  }

  get(key: string): string | null {
    if (!this.isAvalible) {
      return null;
    }

    return window.localStorage.getItem(this.withPrefix(key));
  }

  private withPrefix(key: string): string {
    return (this.prefix ?? "") + key;
  }

  private isAvalible(): boolean {
    return typeof window !== "undefined";
  }
}
