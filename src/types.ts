export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isPopular?: boolean;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  ingredients?: string[];
  customizable?: boolean;
  allergens?: string[];
  views?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
