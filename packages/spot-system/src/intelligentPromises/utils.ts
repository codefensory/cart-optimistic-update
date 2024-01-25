import debug from "debug"
import { IntelliState } from "./contants";
import { IntelliItem } from "./intelliItem";

const log = debug("spot-system:IntelligentUtils");

export function findItemByState<V>(
  item: IntelliItem<V> | undefined,
  states: IntelliState
): IntelliItem<V> | undefined {
  if (!item) {
    return;
  }

  if (!(item.state & states)) {
    return item;
  }

  return findItemByState(item.prevItem, states);
}

export function verifyIfNextItemsIsLast<V>(
  item: IntelliItem<V> | undefined,
  lastId: IntelliItem<V>["id"] | undefined
): boolean {
  if (!item) {
    return false;
  }

  if (item.id === lastId) {
    return true;
  }

  return verifyIfNextItemsIsLast(item.nextItem, lastId);
}

export function findPendingState<V>(item: IntelliItem<V> | undefined): boolean {
  if (!item) {
    return false;
  }

  if (item.isPending()) {
    return true;
  }

  if (item.isError() || item.isCanceled() || item.isPartialComplete()) {
    return findPendingState(item.prevItem);
  }

  return false;
}
