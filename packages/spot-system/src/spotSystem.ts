import { IntelligentQueue } from "./intelligentQueue";
import { SpotItem, SpotState } from "./spot";

export type CreateSpotProps = {
  id: string;
  depends?: Array<string>;
  canReplace?: boolean;
  value?: any;
  onError?: () => void;
};

type Groups = {
  [key: string]: IntelligentQueue<SpotItem>;
};

export class SpotSystem {
  private groups: Groups = {};

  createSpot(groupId: string, action: Promise<any>, options: CreateSpotProps) {
    const spot = SpotItem.create(action);

    return {
      id: spot.id,
      promise: () => new Promise((resove, reject) => {
        const group = this.groups[groupId] ?? new IntelligentQueue();
        this.groups.enqueue(spot);
        this.groups[groupId] = group;
      }),
    };
  }
}
