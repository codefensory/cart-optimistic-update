import { IntelligentPromises } from "./intelligentPromises";

export type CreateSpotProps = {
  id: string;
  depends?: Array<string>;
  canReplace?: boolean;
  value?: any;
  onError?: () => void;
};

type Groups = {
  [key: string]: IntelligentPromises<any>;
};

export class SpotSystem {
  private groups: Groups = {};

  createSpot(groupId: string, action: Promise<any>, options: CreateSpotProps) {}
}
