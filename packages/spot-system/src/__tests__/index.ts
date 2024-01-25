import debug from "debug";

import {
  BaseIntelliItem,
  IntelligentPromises,
  IntelliItem,
} from "../intelligentPromises";

const log = debug("test:main");

// TODO: Esperar si algun padre del padre esta pendiente

function provability(percent: number) {
  percent = percent / 100;

  return Math.random() <= percent;
}

let serverValue = 0;

function updateServer(type: string, value: number) {
  serverValue = type === "add" ? serverValue + 1 : value;

  return serverValue;
}

function wait(type: string, value: any, time?: number, fail?: boolean) {
  return new Promise((resolve, reject) =>
    setTimeout(
      () =>
        fail
          ? reject()
          : fail === false
          ? resolve(updateServer(type, value))
          : provability(100)
          ? resolve(updateServer(type, value))
          : reject(),
      time ?? Math.random() * 2000
    )
  );
}

function generateAdd<V>(
  nextValue: V,
  fail?: boolean,
  time?: number,
  onComplete?: (isLast: boolean, value: V, lastValueCompleted: V) => void,
  onError?: (isLast: boolean, value: V) => void
): IntelliItem<V> {
  return new BaseIntelliItem({
    name: "add",
    waitFor: ["update"],
    action: () => wait("add", nextValue, time, fail),
    onComplete,
    onError,
  });
}

function generateUpdate<V>(
  nextValue: V,
  fail?: boolean,
  time?: number,
  onComplete?: (isLast: boolean, value: V, lastValueCompleted: V) => void,
  onError?: (isLast: boolean, value: V) => void
): IntelliItem<V> {
  return new BaseIntelliItem({
    name: "update",
    waitFor: ["update", "add"],
    action: () => wait("update", nextValue, time, fail),
    onComplete,
    onError,
  });
}

async function test() {
  let localValue = 0;

  const intelli = new IntelligentPromises<number>((pending) => {
    if (!pending) {
      log("finish values");

      log("server value:", serverValue);
      log("local value:", localValue);
    }
  });

  const start = performance.now();

  function addTestSpot(options: {
    type: "add" | "update";
    value: number;
    fail?: boolean;
    time?: number;
  }) {
    const isAdd = options.type === "add";

    const generator = isAdd ? generateAdd : generateUpdate;

    const nextValue = isAdd ? localValue + options.value : options.value;

    localValue = nextValue;

    return intelli
      .add(
        generator(
          nextValue,
          options.fail,
          options.time,
          (isLast, value, lastValueCompleted) => {
            if (isLast) {
              localValue = value;
            }

            log(
              "✔",
              options.type,
              "value",
              value,
              "complete in:",
              performance.now() - start,
              "isLast:",
              isLast,
              "lastValueCompleted:",
              lastValueCompleted
            );
          },
          (isLast, value) => {
            if (isAdd) {
              if (isLast && value) {
                localValue = value;

                return;
              }

              localValue -= options.value;
            }
          }
        )
      )
      .catch(() => void 0);
  }

  addTestSpot({ type: "add", value: 1, time: 1500 });

  addTestSpot({ type: "add", value: 2, time: 100 });

  addTestSpot({ type: "add", value: 1, time: 200, fail: true });

  addTestSpot({ type: "update", value: 5, time: 1000 });

  addTestSpot({ type: "add", value: 1, time: 500 });

  addTestSpot({ type: "add", value: 1, time: 300 });

  log("local value:", localValue);
}

test().catch(() => void 0);
