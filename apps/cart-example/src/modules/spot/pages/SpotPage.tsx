import { Button, HStack, Input, Text } from "@chakra-ui/react";
import {
  BaseIntelliItem,
  IntelligentPromises,
} from "spot-system/src/intelligentPromises";
import { create } from "zustand";

const intelli = new IntelligentPromises<number>();

localStorage.debug = "spot-system:*";

function provability(percent: number) {
  percent = percent / 100;

  return Math.random() <= percent;
}

function wait(time?: number, fail?: boolean) {
  return new Promise((resolve, reject) =>
    setTimeout(
      () =>
        fail
          ? reject()
          : fail === false
          ? resolve(null)
          : provability(100)
          ? resolve(null)
          : reject(),
      time ?? Math.random() * 2000
    )
  );
}

const useCounterStore = create<{
  value: number;
  externalData: number;
  increment: (fail?: boolean) => void;
  decrement: (fail?: boolean) => void;
  update: (value: number, fail?: boolean) => void;
}>((set, get) => ({
  value: 0,
  externalData: 0,
  increment: (fail) => {
    const newValue = get().value + 1;

    intelli.add(
      new BaseIntelliItem({
        name: "increment",
        waitFor: ["update", "decrement"],
        action: () =>
          wait(1000, fail).then(() => {
            set((state) => ({
              externalData: state.externalData + 1,
            }));

            return get().externalData;
          }),
        onComplete: (isLast, value) => {
          if (isLast) {
            set({ value });
          }
        },
        onError: (isLast, value) => {
          if (isLast && value !== undefined) {
            set({ value });

            return;
          }

          set((state) => ({ value: state.value - 1 }));
        },
      })
    );

    set({ value: newValue });
  },
  decrement: (fail) => {
    const newValue = get().value - 1;

    intelli.add(
      new BaseIntelliItem({
        name: "decrement",
        waitFor: ["update", "increment"],
        action: () =>
          wait(1000, fail).then(() => {
            set((state) => ({
              externalData: state.externalData - 1,
            }));

            return get().externalData;
          }),
        onComplete: (isLast, value) => {
          if (isLast) {
            set({ value });
          }
        },
        onError: (isLast, value) => {
          if (isLast && value !== undefined) {
            set({ value });

            return;
          }

          set((state) => ({ value: state.value + 1 }));
        },
      })
    );

    set({ value: newValue });
  },
  update: (value, fail) => {
    intelli.add(
      new BaseIntelliItem({
        name: "update",
        canReplace: true,
        waitFor: ["update", "decrement", "increment"],
        action: () =>
          wait(1000, fail).then(() => {
            set((state) => ({
              ...state,
              externalData: value,
            }));

            return get().externalData;
          }),
        onComplete: (isLast, val) => {
          if (isLast) {
            set({ value: val });
          }
        },
        onError: (isLast, lastValue) => {
          if (isLast) {
            set({ value: lastValue });
          }
        },
      })
    );

    set({ value });
  },
}));

export const SpotPage = () => {
  const counter = useCounterStore();

  return (
    <>
      <HStack maxW="320px">
        <Button onClick={() => counter.decrement()}>-</Button>
        <Input
          value={counter.value}
          onChange={(e) => counter.update(Number(e.target.value))}
        />
        <Button onClick={() => counter.increment()}>+</Button>
      </HStack>
      <Text>With error</Text>
      <HStack maxW="320px">
        <Button onClick={() => counter.decrement(true)}>-</Button>
        <Input
          value={counter.value}
          onChange={(e) => counter.update(Number(e.target.value), true)}
        />
        <Button onClick={() => counter.increment(true)}>+</Button>
      </HStack>
      <Text>ExternalValue: {counter.externalData}</Text>
    </>
  );
};
