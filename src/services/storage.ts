import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error saving data:', error);
    throw new Error(`Failed to save data for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) return null;

    return JSON.parse(jsonValue) as T;
  } catch (error) {
    console.error('Error reading data:', error);

    // Distinguish between different error types
    if (error instanceof SyntaxError) {
      // Corrupted data - clear it to prevent future issues
      console.warn(`Corrupted data for key "${key}", clearing...`);
      await AsyncStorage.removeItem(key).catch(() => {});
      throw new Error(`Corrupted data for key "${key}"`);
    }

    throw new Error(`Failed to read data for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data:', error);
    throw new Error(`Failed to remove data for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}