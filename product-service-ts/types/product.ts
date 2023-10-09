export interface IProduct {
  description: string;
  id: number;
  price: number;
  title: string;
  image: string;
  count: number;
}

export type TProducts = IProduct[];
