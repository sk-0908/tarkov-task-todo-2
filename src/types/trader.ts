export interface BarterOffer {
  id: string;
  rewardItems: {
    item: {
      id: string;
      name: string;
      shortName: string;
      iconLink: string;
      types?: string[];
    };
    count: number;
  }[];
  requiredItems: {
    item: {
      id: string;
      name: string;
      shortName: string;
      iconLink: string;
      types?: string[];
    };
    count: number;
  }[];
  trader: {
    id: string;
  };
  level: number;
}

export interface CashOffer {
  id: string;
  item: {
    id: string;
    name: string;
    shortName: string;
    iconLink: string;
    types?: string[];
  };
  price: number;
  currency: string;
  minTraderLevel: number;
}

export interface TraderLevel {
  id: string;
  level: number;
  barters: BarterOffer[];
  cashOffers: CashOffer[];
}

export interface Trader {
  id: string;
  name: string;
  currency: {
    id: string;
    name: string;
    shortName: string;
  };
  imageLink: string;
  barters?: BarterOffer[];
  cashOffers?: CashOffer[];
}
