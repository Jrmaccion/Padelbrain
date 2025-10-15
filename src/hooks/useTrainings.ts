import { useCallback, useEffect } from 'react';
import { Training } from '@/types';
import { useDataStore } from '@/store/useDataStore';

export function useTrainings() {
  const trainings = useDataStore((state) => state.trainings);
  const loadTrainings = useDataStore((state) => state.loadTrainings);
  const addTraining = useDataStore((state) => state.addTraining);
  const updateTraining = useDataStore((state) => state.updateTraining);
  const removeTraining = useDataStore((state) => state.removeTraining);

  const load = useCallback(async () => {
    await loadTrainings();
  }, [loadTrainings]);

  const add = useCallback(async (training: Training) => {
    await addTraining(training);
  }, [addTraining]);

  const update = useCallback(async (id: string, partial: Partial<Training>) => {
    await updateTraining(id, partial);
  }, [updateTraining]);

  const remove = useCallback(async (id: string) => {
    await removeTraining(id);
  }, [removeTraining]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    trainings,
    items: trainings, // Alias para compatibilidad con código existente
    add,
    update,
    remove,
    load, // Alias para reload
    reload: load,
  };
}
