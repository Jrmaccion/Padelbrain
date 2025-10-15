import { useCallback, useEffect } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { Match } from '@/types';

export function useMatches() {
  const matches = useDataStore((state) => state.matches);
  const loadMatches = useDataStore((state) => state.loadMatches);
  const addMatch = useDataStore((state) => state.addMatch);
  const updateMatch = useDataStore((state) => state.updateMatch);
  const removeMatch = useDataStore((state) => state.removeMatch);

  const load = useCallback(async () => {
    await loadMatches();
  }, [loadMatches]);

  const add = useCallback(async (match: Match) => {
    await addMatch(match);
  }, [addMatch]);

  const update = useCallback(async (id: string, partial: Partial<Match>) => {
    await updateMatch(id, partial);
  }, [updateMatch]);

  const remove = useCallback(async (id: string) => {
    await removeMatch(id);
  }, [removeMatch]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    matches,
    items: matches, // Alias para compatibilidad con código existente
    add,
    update,
    remove,
    load,
    reload: load,
  };
}
