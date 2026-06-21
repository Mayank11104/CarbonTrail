import { Train, Utensils, Zap, ShoppingBag } from 'lucide-react';

export const CATEGORY_CONFIG = {
  transport: {
    title: 'Transport',
    Icon: Train,
    color: '#40916C',
    blobColor: 'bg-[#94D4B1]/20',
    bgColor: 'bg-[#40916C]/10',
    textColor: 'text-[#40916C]',
    options: ['Car', 'Bus', 'Metro', 'Walk/Bike'] as const,
    inputLabel: 'Distance (km)',
  },
  food: {
    title: 'Food',
    Icon: Utensils,
    color: '#C07B52',
    blobColor: 'bg-[#E8D5B0]/30',
    bgColor: 'bg-[#C07B52]/10',
    textColor: 'text-[#C07B52]',
    options: ['Beef/Lamb', 'Chicken/Pork', 'Vegetarian', 'Vegan'] as const,
    inputLabel: 'Meals',
  },
  energy: {
    title: 'Energy',
    Icon: Zap,
    color: '#D97706',
    blobColor: 'bg-[#FFD180]/20',
    bgColor: 'bg-[#D97706]/10',
    textColor: 'text-[#D97706]',
    options: ['AC (Hours)', 'Heater (Hours)', 'General Usage'] as const,
    inputLabel: 'Hours / Amount',
  },
  shopping: {
    title: 'Shopping',
    Icon: ShoppingBag,
    color: '#1B4332',
    blobColor: 'bg-[#95D5B2]/15',
    bgColor: 'bg-[#1B4332]/10',
    textColor: 'text-[#1B4332]',
    options: ['Electronics', 'Clothing', 'Home Goods', 'Other'] as const,
    inputLabel: 'Items',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORY_CONFIG;
