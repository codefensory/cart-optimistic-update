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

let count = 0;

function generateAdd<V>(
  value: V,
  fail?: boolean,
  time?: number
): IntelliItem<V> {
  return new BaseIntelliItem({
    name: "add",
    value,
    waitFor: ["update"],
    action: () => wait(time, fail),
    onError: (isLast, value) => {
      log("✖ Error add", count++, "{", isLast, ",", value, "}");
    },
  });
}

function generateUpdate<T>(
  value: any,
  fail?: boolean,
  time?: number
): IntelliItem<T> {
  return new BaseIntelliItem({
    name: "update",
    value,
    depends: ["add", "update"],
    action: () => wait(time, fail),
    onError: (isLast, value) => {
      log("✖ Error update", count++, "{", isLast, ",", value, "}");
    },
  });
}

async function test() {
  const intelli = new IntelligentPromises<number>();

  const start = performance.now();

  intelli
    .add(generateAdd(1, false, 1000))
    .then(() => log("✔ add", 2, "complete in:", performance.now() - start))
    .catch(() => void 0);

  intelli
    .add(generateAdd(2, true, 100))
    .then(() => log("✔ add", 2, "complete in:", performance.now() - start))
    .catch(() => void 0);

  intelli
    .add(generateUpdate(4, false, 1000))
    .then(() => {
      log("✔ update", 3, "complete in:", performance.now() - start);
    })
    .catch(() => void 0);

  intelli
    .add(generateUpdate(4, false, 1000))
    .then(() => log("✔ update", 4, "complete in:", performance.now() - start))
    .catch(() => void 0);

  intelli
    .add(generateAdd(11, false, 1000))
    .then(() => log("✔ add", 5, "complete in:", performance.now() - start))
    .catch(() => void 0);

  intelli
    .add(generateAdd(12, false, 1000))
    .then(() => log("✔ add", 6, "complete in:", performance.now() - start))
    .catch(() => void 0);
}

test().catch(() => void 0);
