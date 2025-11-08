# PadelBrain - Improvements Implementation Guide

This document outlines the implementation plan for all requested improvements.

## ✅ Completed Improvements

### 1. Theme Constants ✓
**Status**: Already exists
**Location**: `src/constants/theme.ts`
**What it provides**:
- Complete color palette (primary, success, error, warning, purple, cyan, gray)
- Spacing scale (xs to 6xl)
- Border radius values
- Typography (font sizes, weights, line heights)
- Shadow definitions
- Component-specific defaults

### 2. Loading Skeletons ✓
**Status**: Implemented
**Location**: `src/components/common/Skeleton.tsx`
**Components**:
- `Skeleton` - Basic animated skeleton
- `SkeletonCard` - Card-shaped skeleton
- `SkeletonList` - Multiple skeleton cards
- `SkeletonStats` - Stats grid skeleton

**Usage**:
```typescript
import { SkeletonList } from '@/components/common/Skeleton';

{isLoading ? <SkeletonList count={3} /> : <ActualContent />}
```

### 3. Remove AI References ✓
**Status**: Fixed
**Location**: `src/components/quick-entry/VoiceInput.tsx:281`
**Change**: Updated hint text from misleading "La IA extraerá automáticamente" to honest "El sistema reconocerá palabras clave"

---

## 🚧 High Priority - In Progress

### 4. Edit Functionality ⭐⭐⭐
**Status**: Ready to implement
**Effort**: Medium (4-6 hours)

**Implementation Plan**:

#### Step 1: Extend QuickEntryForm
File: `src/components/quick-entry/QuickEntryForm.tsx`

Add props:
```typescript
interface QuickEntryFormProps {
  type: 'training' | 'match';
  onSubmit: (item: Training | Match) => void;
  onSaveDraft?: (item: Partial<Training | Match>) => void;
  draftData?: Partial<Training | Match>;
  editMode?: boolean;              // NEW
  itemToEdit?: Training | Match;    // NEW
}
```

Modify form logic:
```typescript
// In component
const isEditing = editMode && itemToEdit;

// Update submit handler
const handleSubmit = () => {
  if (isEditing) {
    // Update existing item (keep same ID)
    onSubmit({ ...itemToEdit, ...formData });
  } else {
    // Create new item (generate new ID)
    onSubmit({ id: uuidv4(), ...formData });
  }
};

// Update button text
<Button>{isEditing ? 'Actualizar' : 'Guardar'}</Button>
```

#### Step 2: Update MatchesScreen
File: `src/screens/MatchesScreen.tsx`

Add edit state:
```typescript
const [editingMatch, setEditingMatch] = useState<Match | null>(null);

const handleEdit = (match: Match) => {
  setEditingMatch(match);
  setShowForm(true);
};

const handleUpdate = async (updated: Match) => {
  await update(updated.id, updated);
  setShowForm(false);
  setEditingMatch(null);
};
```

Update modal:
```tsx
<QuickEntryForm
  type="match"
  editMode={!!editingMatch}
  itemToEdit={editingMatch}
  onSubmit={editingMatch ? handleUpdate : handleSubmit}
  // ... other props
/>
```

Add edit button to detail view:
```tsx
<TouchableOpacity onPress={() => handleEdit(selectedMatch)}>
  <Text>✏️ Editar</Text>
</TouchableOpacity>
```

#### Step 3: Update TrainingsScreen
Similar changes to MatchesScreen.

**Files to modify**:
- [ ] `src/components/quick-entry/QuickEntryForm.tsx`
- [ ] `src/screens/MatchesScreen.tsx`
- [ ] `src/screens/TrainingsScreen.tsx`

---

### 5. Search & Filter ⭐⭐⭐
**Status**: Ready to implement
**Effort**: Medium (4-6 hours)

**Implementation Plan**:

#### Step 1: Create SearchBar Component
File: `src/components/common/SearchBar.tsx` (NEW)

```typescript
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || 'Buscar...'}
        style={styles.input}
      />
      {value !== '' && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Text style={styles.clear}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

#### Step 2: Create FilterButton Component
File: `src/components/common/FilterButton.tsx` (NEW)

```typescript
interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterButtonProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
}

// Expandable filter with checkboxes
```

#### Step 3: Add to MatchesScreen
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState({
  outcome: [], // ['won', 'lost']
  opponent: [],
  location: [],
});

const filteredMatches = useMemo(() => {
  return matches.filter(match => {
    // Search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      match.location?.toLowerCase().includes(searchLower) ||
      match.opponents?.right?.toLowerCase().includes(searchLower) ||
      match.tournament?.toLowerCase().includes(searchLower);

    // Filters
    const matchesOutcome = filters.outcome.length === 0 ||
      filters.outcome.includes(match.result?.outcome || '');

    return matchesSearch && matchesOutcome;
  });
}, [matches, searchQuery, filters]);
```

**Files to create**:
- [ ] `src/components/common/SearchBar.tsx`
- [ ] `src/components/common/FilterButton.tsx`

**Files to modify**:
- [ ] `src/screens/MatchesScreen.tsx`
- [ ] `src/screens/TrainingsScreen.tsx`

---

### 6. CSV Export ⭐⭐⭐
**Status**: Ready to implement
**Effort**: Low (2-3 hours)

**Implementation Plan**:

#### Step 1: Create CSV Service
File: `src/services/csvExport.ts` (NEW)

```typescript
import { Match, Training } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export async function exportMatchesToCSV(matches: Match[]): Promise<void> {
  const headers = ['Fecha', 'Ubicación', 'Resultado', 'Marcador', 'Rival', 'Compañero', 'Técnica', 'Táctica', 'Mental', 'Físico'];

  const rows = matches.map(m => [
    m.date,
    m.location || '',
    m.result?.outcome || '',
    m.result?.score || '',
    `${m.opponents?.right || ''} / ${m.opponents?.left || ''}`,
    m.partner || '',
    m.ratings?.technical || '',
    m.ratings?.tactical || '',
    m.ratings?.mental || '',
    m.ratings?.physical || '',
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  if (Platform.OS === 'web') {
    // Web: Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `padelbrain-partidos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    // Native: Share file
    const fileUri = FileSystem.documentDirectory + 'padelbrain-export.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv);
    await Sharing.shareAsync(fileUri);
  }
}
```

#### Step 2: Add Export Buttons
Update `src/screens/ReportsScreen.tsx`:

```tsx
<TouchableOpacity onPress={() => exportMatchesToCSV(matches)}>
  <Text>📊 Exportar Partidos (CSV)</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => exportTrainingsToCSV(trainings)}>
  <Text>📊 Exportar Entrenamientos (CSV)</Text>
</TouchableOpacity>
```

**Files to create**:
- [ ] `src/services/csvExport.ts`

**Files to modify**:
- [ ] `src/screens/ReportsScreen.tsx`

---

### 7. Performance Optimization with FlatList ⭐⭐
**Status**: Ready to implement
**Effort**: Medium (3-4 hours)

**Current Problem**: Lists use ScrollView + map(), rendering all items at once

**Solution**: Use FlatList with proper optimization

#### Update MatchList Component
File: `src/components/matches/MatchList.tsx`

```typescript
import { FlatList } from 'react-native';
import { memo } from 'react';

// Memoize card component
const MatchCardMemo = memo(MatchCard);

export default function MatchList({ matches, onSelect }) {
  const keyExtractor = useCallback((item: Match) => item.id, []);

  const renderItem = useCallback(({ item }: { item: Match }) => (
    <MatchCardMemo match={item} onPress={() => onSelect(item)} />
  ), [onSelect]);

  return (
    <FlatList
      data={matches}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );
}
```

**Files to modify**:
- [ ] `src/components/matches/MatchList.tsx`
- [ ] `src/components/trainings/TrainingList.tsx`
- [ ] `src/components/matches/MatchCard.tsx` (add React.memo)
- [ ] `src/components/trainings/TrainingCard.tsx` (add React.memo)

---

### 8. Charts for StatsScreen ⭐⭐
**Status**: Ready to implement
**Effort**: High (6-8 hours)

**Dependencies**: Need to install chart library

```bash
npm install react-native-chart-kit react-native-svg
```

**Implementation**:

#### Step 1: Create Chart Components
File: `src/components/stats/WinRateChart.tsx` (NEW)

```typescript
import { LineChart } from 'react-native-chart-kit';

export function WinRateChart({ matches }: { matches: Match[] }) {
  // Group matches by month
  const monthlyData = groupByMonth(matches);

  return (
    <LineChart
      data={{
        labels: monthlyData.map(m => m.month),
        datasets: [{
          data: monthlyData.map(m => m.winRate)
        }]
      }}
      width={Dimensions.get('window').width - 32}
      height={220}
      chartConfig={{...}}
    />
  );
}
```

File: `src/components/stats/PerformanceRadar.tsx` (NEW)
- Radar chart for technical/tactical/mental/physical

#### Step 2: Add to StatsScreen
```tsx
<WinRateChart matches={matches} />
<PerformanceRadar trainings={trainings} />
```

**Files to create**:
- [ ] `src/components/stats/WinRateChart.tsx`
- [ ] `src/components/stats/PerformanceRadar.tsx`
- [ ] `src/components/stats/ActivityCalendar.tsx`

**Files to modify**:
- [ ] `src/screens/StatsScreen.tsx`
- [ ] `package.json` (add dependencies)

---

## 📝 Medium Priority

### 9. Fix TypeScript 'any' Types
**Status**: Planned
**Effort**: Medium (4-6 hours)

**Files with most `any` usage**:
1. `src/services/report/exportPdf.ts` (16 instances)
2. `src/screens/MatchesScreen.tsx` (10 instances)
3. `src/components/quick-entry/DraftManager.tsx` (2 instances)

**Plan**:
- Replace `any` with proper types
- Create interface for PDF export options
- Type modal state properly
- Add proper event types

### 10. Refactor QuickEntryForm
**Status**: Planned
**Effort**: High (8-10 hours)

**Current Problem**: 611 lines, 24 state variables

**Solution**: Split into smaller components:

```
QuickEntryForm (main orchestrator)
├── BasicInfoSection (date, time, location)
├── WellnessSection (sleep, energy, nutrition, health, stress)
├── PerformanceSection (technical, tactical, mental, physical)
├── TrainingSection (coach, goals, partners)
├── MatchSection (score, opponent, tournament, partner, position)
├── AnalysisSection (strengths, weaknesses, reflections)
└── VoiceSection (voice input + processing)
```

Each section manages its own state and callbacks parent.

---

## 🔮 Future Enhancements

### 11. Complete TODOs
- **ErrorBoundary**: Add Sentry error reporting
- **analyticsService**: Implement Google Analytics or Mixpanel

### 12. Advanced Features
- Cloud sync (Firebase/Supabase)
- Dark mode
- Multi-language support
- Custom templates system
- Social sharing
- Coach collaboration

---

## Implementation Priority

**Week 1: Critical UX**
1. Edit functionality
2. Search & filter
3. CSV export

**Week 2: Polish**
4. Performance optimization (FlatList)
5. Fix TypeScript types
6. Add loading skeletons to screens

**Week 3: Advanced**
7. Charts to StatsScreen
8. Refactor QuickEntryForm
9. Complete TODOs

---

## Testing Checklist

After each implementation:
- [ ] TypeScript compiles without errors
- [ ] No console warnings
- [ ] Works on mobile layout (<768px)
- [ ] Works on tablet layout (768-1024px)
- [ ] Works on desktop layout (>1024px)
- [ ] PWA still works
- [ ] Service worker still caches properly
- [ ] Data persists correctly

---

## Notes

- All improvements maintain backward compatibility
- Existing data will not be affected
- PWA functionality remains intact
- Theme system is already in place
- Type safety improves with each change
