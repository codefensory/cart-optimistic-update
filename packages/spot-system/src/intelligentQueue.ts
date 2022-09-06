import { Option } from "oxide.ts";
import debug from "debug";

const log = debug("spot-system:IntelligentQueue");

export enum IntelliItemState {
  None,
  Block,
  Pending,
  Complete,
  Error,
  Canceled,
}

export interface IntelliItem {
  id: string;
  name: string;
  action: () => Promise<any>;
  state?: IntelliItemState;
  depends?: string[];
  waitFor?: string[];
  canReplace?: boolean;

  value?: any;
  prevAreNotPending?: boolean;
  prevItem?: IntelliItem;

  onError(isLast: boolean, value: any): void;
}

export interface QueueItem<T> {
  data: T;
  resolve(value: any): void;
  reject(reason: { item: IntelliItem; err: any }): void;
}

export class IntelligentQueue<T extends IntelliItem> {
  public items: QueueItem<T>[] = [];

  private lastItem: QueueItem<T> | undefined = undefined;

  // Agregar un item a la cola, este es el que se llama desde el exterior
  public add(itemData: T) {
    // Si encontramos dependencias pero no tenemos waitFor, entonces las dependecias seran nuestro waitFor
    // Esto se puede refactorizar con una funcion getWaitFor
    if (itemData.depends && !itemData.waitFor) {
      itemData.waitFor = itemData.depends;
    }

    // Devolvemos una promesa que envuelve la promesa de la cola
    // esto para devolver un error personalizado
    return new Promise((resolve, reject) => {
      this.enqueue(itemData)
        .then(resolve)
        .catch((reason) => {
          // La razon del error de la cola contiene la informacion del item que fallo
          const item = reason?.item as IntelliItem;

          // Verificamos si el item que fallo es el ultimo
          const isLast = this.lastItem?.data.id === item?.id;

          // Obtenemos el valor del ultimo spot que se completo
          const value = this.findCompleteValue(item);

          // Devolvemos un error personalizado con los datos anteriores
          item.onError(isLast, value);

          // Tambien devolvermos el error original
          reject(reason.err);
        });
    });
  }

  // Encola un nuevo item, esto compara, asigna un estado y prepara el item para su procesamiento
  private enqueue(itemData: T) {
    // Devuelve una promesa que tambien se encola
    return new Promise((resolve, reject) => {
      // Preparamos un item diferente para agregarlo a la cola
      const item = { data: itemData, resolve, reject };

      log(`➤ enqueue ${item.data.name} ${item.data.id}`);

      // Asignamos un estado por default
      item.data.state = IntelliItemState.None;

      // Obtenemos el ultimo item de la cola
      const lastI = this.items[this.items.length - 1];

      if (lastI) {
        if (lastI.data.state === IntelliItemState.Block) {
          // Si ese ultimo objeto esta bloqueado, entonces tambien asigna este nuevo item como bloqueado
          item.data.state = IntelliItemState.Block;

          // Si el item anterior esta bloqueado es el mismo tipo que el nuevo item, y este permite reemplazarce
          // Entonces remplazamos el item anterior y lo cancelamos
          if (item.data.canReplace && lastI.data.name === item.data.name) {
            item.data.prevItem = lastI.data.prevItem;

            this.lastItem = item;

            this.items[this.items.length - 1] = item;

            // cuando se reemplace, el item reemplazado va a responde como si se completo correctamente
            // pero devolviendo null
            lastI.resolve(null);
            return;
          }
        }

        // Si tenemos el item anterior dentro de waitFor, y es diferente a COMPLETE, ERRO o CANCELED, entonces bloqueamos el nuevo item
        if (
          item.data.waitFor &&
          item.data.waitFor.indexOf(this.lastItem?.data.name ?? "") !== -1 &&
          this.lastItem?.data.state !== IntelliItemState.Complete &&
          this.lastItem?.data.state !== IntelliItemState.Error &&
          this.lastItem?.data.state !== IntelliItemState.Canceled
        ) {
          item.data.state = IntelliItemState.Block;
        }
      }

      // Asignamos el prevItem al nuevo item
      item.data.prevItem = this.lastItem?.data;

      // Este nuevo Item sera el prevItem
      this.lastItem = item;

      // Enculamos:)
      this.items.push(item);

      // Y procesamos, aqui es donde ocurre la magia
      this.process();
    });
  }

  // Busca el ultimo valor COMPLETE de sus prevItems
  private findCompleteValue(item: IntelliItem | undefined): any {
    if (!item) {
      return;
    }

    if (item.state === IntelliItemState.Complete) {
      return item.value;
    }

    return this.findCompleteValue(item.prevItem);
  }

  // Verifica si algunos de sus prevItems esta pendiente
  private isPending(item: IntelliItem | undefined): any {
    if (!item) {
      return false;
    }

    if (item.state === IntelliItemState.Pending) {
      return true;
    }

    if (
      item.state === IntelliItemState.Error ||
      item.state === IntelliItemState.Canceled
    ) {
      return this.isPending(item.prevItem);
    }

    return false;
  }

  // Procesamos los items de la cola
  public async process() {
    let itemWrap = this.peek();

    // Si no hay mas elementos, sale
    if (itemWrap.isNone()) {
      return;
    }

    let item = itemWrap.unwrap();

    // Si el elemento anterior esta bloqueado, se cambia el estado a bloqueado y sale
    if (item.data.prevItem?.state === IntelliItemState.Block) {
      item.data.state === IntelliItemState.Block;

      return;
    }

    const prevItem = item.data.prevItem;

    const waitFor = item.data.waitFor;

    // Si se encuentra dentro de la lista de espera y esta pendiente, se cambia el estado a bloqueado y sale
    if (
      waitFor &&
      waitFor.indexOf(prevItem?.name ?? "") !== -1 &&
      this.isPending(prevItem)
    ) {
      item.data.state = IntelliItemState.Block;

      return;
    }

    // Dequeue :eyes:
    item = this.dequeue().unwrap();

    const depends = item.data.depends;

    // Si depende del item anterior y el item anterior tiene un error o esta cancelado, entonces cancela este item
    if (
      depends &&
      depends.indexOf(prevItem?.name ?? "") !== -1 &&
      (prevItem?.state === IntelliItemState.Error ||
        prevItem?.state === IntelliItemState.Canceled)
    ) {
      log("\x1b[31m%s\x1b[0m", "✖ Canceled", item.data.name, item.data.id);

      item.data.state = IntelliItemState.Canceled;

      item.reject({ item: item.data, err: "canceled" });

      this.process();

      return;
    }

    // Cambia es estado a pendiente
    item.data.state = IntelliItemState.Pending;

    log("\x1b[38;5;178m%s\x1b[0m", "⇅ calling", item.data.name, item.data.id);

    // Ejecuta la promesa
    item.data
      .action()
      .then((result) => {
        log("\x1b[32m%s\x1b[0m", "✔ Complete", item.data.name, item.data.id);

        item.data.state = IntelliItemState.Complete;

        item.resolve(result);
      })
      .catch((err) => {
        log("\x1b[31m%s\x1b[0m", "✖ Error", item.data.name, item.data.id);

        item.data.state = IntelliItemState.Error;

        item.reject({ item: item.data, err });
      })
      // al terminar de ejecutar la promesa, volver a ejecutar el proceso
      .finally(() => this.process());

    // Si hay elementos, volver a ejecutar el proceso
    if (this.peek().isSome()) {
      this.process();
    }
  }

  // Vemos el siguiente item
  public peek(): Option<QueueItem<T>> {
    return Option(this.items[0]);
  }

  // Obtenemos y eliminamos el siguiente item de la cola
  private dequeue(): Option<QueueItem<T>> {
    return Option(this.items.shift());
  }
}
