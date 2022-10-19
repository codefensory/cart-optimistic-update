import { useEffect, useState } from "react";
import {
  BaseIntelliItem,
  IntelliItem,
  IntelliProps,
} from "./intelligentPromises";

import { SpotSystem } from "./spotSystem";

type SpotItem<V> = IntelliItem<V>;

type SpotProps<V> = Omit<IntelliProps<V>, "action">;

export function createSpotStore<V>() {
  return new SpotSystem<V>();
}

export function createSpot<V>(
  action: () => Promise<any>,
  options: SpotProps<V>
): SpotItem<V> {
  return new BaseIntelliItem<V>({ ...options, action });
}

export function useSpotStore<V>(store: SpotSystem<V>) {
  const add = (groupId: string, spot: SpotItem<V>) => {
    return store.addSpot(groupId, spot);
  };

  return { add };
}

export function useStoreStatus<V>(store: SpotSystem<V>) {
  const [isPending, setIsPending] = useState(store.isPending);

  useEffect(() => {
    const unsubscribe = store.subscribe((pending) => setIsPending(pending));

    return unsubscribe;
  }, []);

  return isPending;
}
