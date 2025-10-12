import { useEffect, useState } from 'react';
import { getItem, setItem } from '@/services/storage';
import { Training } from '@/types';

export function useTrainings() {
  const [items, setItems] = useState<Training[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getItem<Training[]>('trainings');
    setItems(data || []);
  };

  const add = async (t: Training) => {
    const next = [...items, t];
    await setItem('trainings', next);
    setItems(next);
  };

  const update = async (id: string, partial: Partial<Training>) => {
    const index = items.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Entrenamiento con ID ${id} no encontrado`);
    }

    const updated = [...items];
    updated[index] = { ...updated[index], ...partial };
    
    await setItem('trainings', updated);
    setItems(updated);
  };

  const remove = async (id: string) => {
    const next = items.filter((t) => t.id !== id);
    await setItem('trainings', next);
    setItems(next);
  };

  return {
    trainings: items,
    items, // Alias para compatibilidad con código existente
    add,
    update,
    remove,
    load, // Alias para reload
    reload: load,
  };
}