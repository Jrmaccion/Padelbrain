import { useEffect, useState } from 'react';
import { getItem, setItem } from '@/services/storage';
import { Match } from '@/types';

export function useMatches() {
  const [items, setItems] = useState<Match[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getItem<Match[]>('matches');
    setItems(data || []);
  };

  const add = async (m: Match) => {
    const next = [...items, m];
    await setItem('matches', next);
    setItems(next);
  };

  const update = async (id: string, partial: Partial<Match>) => {
    const index = items.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Partido con ID ${id} no encontrado`);
    }

    const updated = [...items];
    updated[index] = { ...updated[index], ...partial };
    
    await setItem('matches', updated);
    setItems(updated);
  };

  const remove = async (id: string) => {
    const next = items.filter((m) => m.id !== id);
    await setItem('matches', next);
    setItems(next);
  };

  return {
    matches: items,
    items, // Alias para compatibilidad con código existente
    add,
    update,
    remove,
    load, // Alias para reload
    reload: load,
  };
}