import { useState } from 'react';
import { Training } from '@/types';
import { getItem, setItem } from '@/services/storage';

const KEY = 'trainings';

export function useTrainings() {
  const [items, setItems] = useState<Training[]>([]);

  async function load() {
    setItems((await getItem<Training[]>(KEY)) ?? []);
  }

  async function add(t: Training) {
    const next = [...items, t];
    setItems(next);
    await setItem(KEY, next);
  }

  const remove = async (id: string) => {
    const updated = items.filter(t => t.id !== id);
    setItems(updated);
    await setItem(KEY, updated);
  };

  return { items, load, add, remove };
}