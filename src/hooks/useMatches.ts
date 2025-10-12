import { useState } from 'react';
import { Match } from '@/types';
import { getItem, setItem } from '@/services/storage';

const KEY = 'matches';

export function useMatches() {
  const [items, setItems] = useState<Match[]>([]);

  async function load() {
    setItems((await getItem<Match[]>(KEY)) ?? []);
  }

  async function add(m: Match) {
    const next = [...items, m];
    setItems(next);
    await setItem(KEY, next);
  }

  const remove = async (id: string) => {
    const updated = items.filter(m => m.id !== id);
    setItems(updated);
    await setItem(KEY, updated);
  };

  return { items, load, add, remove };
}