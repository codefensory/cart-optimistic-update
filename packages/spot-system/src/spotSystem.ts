import { IntelligentPromises, IntelliItem } from "./intelligentPromises";

type Groups<V> = {
  [key: string]: IntelligentPromises<V> | undefined;
};

export class SpotSystem<V> {
  public isPending: boolean = false;

  private groups: Groups<V> = {};

  private listeners: Set<(isPending: boolean) => void> = new Set();

  private groupsPending: { [key: string]: boolean } = {};

  private countPendingPromises: number = 0;

  public addSpot(groupId: string, spot: IntelliItem<V>) {
    let intelligentPromise = this.groups[groupId];

    if (!intelligentPromise) {
      intelligentPromise = this.groups[groupId] = new IntelligentPromises<V>(
        (isPending) => this.onPending(groupId, isPending)
      );
    }

    return intelligentPromise.add(spot);
  }

  private onPending(groupId: string, isPending: boolean) {
    const group = this.groupsPending[groupId];

    if (isPending) {
      if (!group) {
        this.groupsPending[groupId] = true;

        this.countPendingPromises += 1;
      }
    } else {
      if (group) {
        delete this.groupsPending[groupId];

        this.countPendingPromises -= 1;
      }
    }

    this.isPending = this.countPendingPromises === 0;

    this.notifyPendingEvent();
  }

  public subscribe(listener: (isPending: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notifyPendingEvent() {
    this.listeners.forEach((l) => l(this.isPending));
  }
}
