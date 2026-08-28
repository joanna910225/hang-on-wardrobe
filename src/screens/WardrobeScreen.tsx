import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '../components/BrandHeader';
import { ClothingTile } from '../components/ClothingTile';
import { colors, fonts } from '../theme';
import { WardrobeCategory, WardrobeItem } from '../types';

const filters: ('All' | WardrobeCategory)[] = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Bags'];

type WardrobeScreenProps = {
  wardrobe: WardrobeItem[];
  onAdd: (category: WardrobeCategory) => void;
  onEdit: (item: WardrobeItem) => void;
};

export function WardrobeScreen({ wardrobe, onAdd, onEdit }: WardrobeScreenProps) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const filtered = useMemo(
    () => filter === 'All' ? wardrobe : wardrobe.filter((item) => item.category === filter),
    [filter, wardrobe],
  );

  return (
    <View style={styles.screen}>
      <BrandHeader actionIcon="add" onAction={() => onAdd(filter === 'All' ? 'Tops' : filter)} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Wardrobe</Text>
          <Text style={styles.count}>{wardrobe.length} pieces</Text>
        </View>
        <Text style={styles.subtitle}>Keep the pieces you wear most. Tap one to edit it.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {filters.map((item) => {
            const active = item === filter;
            return (
              <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, active && styles.filterActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filtered.length > 0 ? (
          <View style={styles.grid}>
            {filtered.map((item) => (
              <Pressable key={item.id} onPress={() => onEdit(item)} style={({ pressed }) => [styles.tileWrap, pressed && styles.pressed]}>
                <ClothingTile item={item} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="shirt-outline" size={28} color={colors.muted} />
            <Text style={styles.emptyTitle}>No pieces here yet</Text>
            <Pressable onPress={() => onAdd(filter === 'All' ? 'Tops' : filter)} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add one</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 118 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink },
  count: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.muted },
  subtitle: { marginTop: 5, fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  filters: { gap: 7, paddingVertical: 20 },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  filterActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { fontFamily: fonts.sansMedium, fontSize: 10, color: colors.muted },
  filterTextActive: { color: colors.card },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tileWrap: { width: '48.2%' },
  empty: { minHeight: 280, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { marginTop: 10, fontFamily: fonts.sansBold, fontSize: 13, color: colors.ink },
  emptyButton: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 99, backgroundColor: colors.lime },
  emptyButtonText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.ink },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
