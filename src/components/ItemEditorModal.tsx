import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { WardrobeCategory, WardrobeItem, WardrobeItemDraft } from '../types';

const categories: WardrobeCategory[] = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Bags'];
const styleOptions = ['Minimal', 'Classic', 'Relaxed', 'Tailored', 'Sporty', 'Romantic'];
const seasonOptions = ['Spring', 'Summer', 'Autumn', 'Winter'];
const occasionOptions = ['Everyday', 'Work', 'Weekend', 'Dinner', 'Travel'];

const categoryVisuals: Record<WardrobeCategory, { emoji: string; background: string }> = {
  Tops: { emoji: '👕', background: '#DFE8E2' },
  Bottoms: { emoji: '👖', background: '#C7D7E8' },
  Outerwear: { emoji: '🧥', background: '#D7C2B0' },
  Shoes: { emoji: '👞', background: '#D6BEA8' },
  Bags: { emoji: '👜', background: '#D8C3AE' },
};

type ItemEditorModalProps = {
  visible: boolean;
  item?: WardrobeItem;
  imageUri?: string;
  defaultCategory: WardrobeCategory;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: WardrobeItemDraft) => void;
  onDelete?: () => void;
};

export function ItemEditorModal({ visible, item, imageUri, defaultCategory, saving, onClose, onSave, onDelete }: ItemEditorModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WardrobeCategory>(defaultCategory);
  const [colorName, setColorName] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [seasonTags, setSeasonTags] = useState<string[]>([]);
  const [occasionTags, setOccasionTags] = useState<string[]>([]);
  const [favoriteScore, setFavoriteScore] = useState(4);

  useEffect(() => {
    if (!visible) return;
    setName(item?.name ?? '');
    setCategory(item?.category ?? defaultCategory);
    setColorName(item?.colorName ?? '');
    setSubcategory(item?.subcategory ?? '');
    setStyleTags(item?.styleTags ?? []);
    setSeasonTags(item?.seasonTags ?? []);
    setOccasionTags(item?.occasionTags ?? []);
    setFavoriteScore(item?.favoriteScore ?? 4);
  }, [defaultCategory, item, visible]);

  const visual = categoryVisuals[category];
  const visibleImage = imageUri ?? item?.imageUri;

  const toggleTag = (tag: string, selected: string[], setSelected: (tags: string[]) => void) => {
    setSelected(selected.includes(tag) ? selected.filter((value) => value !== tag) : [...selected, tag]);
  };

  const save = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      category,
      colorName: colorName.trim() || 'Not set',
      subcategory: subcategory.trim(),
      styleTags,
      seasonTags,
      occasionTags,
      favoriteScore,
      emoji: visual.emoji,
      background: visual.background,
      imageUri: visibleImage,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
          <Pressable onPress={onClose} style={styles.headerButton}><Ionicons name="close" size={21} color={colors.ink} /></Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{item ? 'Edit piece' : 'Add a piece'}</Text>
            <Text style={styles.headerSubtitle}>A few details make better matches</Text>
          </View>
          <Pressable disabled={!name.trim() || saving} onPress={save} style={[styles.savePill, (!name.trim() || saving) && styles.saveDisabled]}>
            <Text style={styles.savePillText}>{saving ? 'Saving' : 'Save'}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.photoCard, { backgroundColor: visual.background }]}>
            {visibleImage ? <Image source={{ uri: visibleImage }} style={styles.photo} resizeMode="cover" /> : <Text style={styles.photoEmoji}>{visual.emoji}</Text>}
            <View style={styles.privatePill}><Ionicons name="lock-closed" size={11} color={colors.ink} /><Text style={styles.privateText}>PRIVATE</Text></View>
          </View>

          <FieldLabel number="01" title="Name it your way" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Blue work shirt"
            placeholderTextColor={colors.muted}
            style={styles.input}
            returnKeyType="done"
          />

          <FieldLabel number="02" title="What kind of piece?" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {categories.map((value) => (
              <Pressable key={value} onPress={() => setCategory(value)} style={[styles.chip, category === value && styles.chipActive]}>
                <Text style={[styles.chipText, category === value && styles.chipTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <Text style={styles.smallLabel}>COLOR</Text>
              <TextInput value={colorName} onChangeText={setColorName} placeholder="Navy" placeholderTextColor={colors.muted} style={styles.smallInput} />
            </View>
            <View style={styles.column}>
              <Text style={styles.smallLabel}>TYPE</Text>
              <TextInput value={subcategory} onChangeText={setSubcategory} placeholder="Cardigan" placeholderTextColor={colors.muted} style={styles.smallInput} />
            </View>
          </View>

          <TagSection number="03" title="How would you describe it?" options={styleOptions} selected={styleTags} onToggle={(tag) => toggleTag(tag, styleTags, setStyleTags)} />
          <TagSection number="04" title="When does it work?" options={seasonOptions} selected={seasonTags} onToggle={(tag) => toggleTag(tag, seasonTags, setSeasonTags)} />
          <TagSection number="05" title="Where would you wear it?" options={occasionOptions} selected={occasionTags} onToggle={(tag) => toggleTag(tag, occasionTags, setOccasionTags)} />

          <View style={styles.favoriteCard}>
            <View>
              <Text style={styles.favoriteTitle}>How much do you like it?</Text>
              <Text style={styles.favoriteBody}>Your feeling stays separate from utility.</Text>
            </View>
            <View style={styles.hearts}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable key={value} onPress={() => setFavoriteScore(value)} hitSlop={5}>
                  <Ionicons name={value <= favoriteScore ? 'heart' : 'heart-outline'} size={25} color={value <= favoriteScore ? colors.coral : colors.muted} />
                </Pressable>
              ))}
            </View>
          </View>

          {item && onDelete && (
            <Pressable onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={18} color={colors.coral} />
              <Text style={styles.deleteText}>Remove from wardrobe</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ number, title }: { number: string; title: string }) {
  return (
    <View style={styles.fieldLabel}>
      <View style={styles.numberPill}><Text style={styles.numberText}>{number}</Text></View>
      <Text style={styles.fieldTitle}>{title}</Text>
    </View>
  );
}

function TagSection({ number, title, options, selected, onToggle }: { number: string; title: string; options: string[]; selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <View style={styles.tagSection}>
      <FieldLabel number={number} title={title} />
      <View style={styles.wrapChips}>
        {options.map((tag) => {
          const active = selected.includes(tag);
          return (
            <Pressable key={tag} onPress={() => onToggle(tag)} style={[styles.chip, active && styles.tagActive]}>
              {active && <Ionicons name="checkmark" size={14} color={colors.ink} />}
              <Text style={styles.chipText}>{tag}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 18, paddingBottom: 11, borderBottomWidth: 1, borderColor: colors.line },
  headerButton: { width: 39, height: 39, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  headerTitle: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.ink },
  headerSubtitle: { fontFamily: fonts.sans, fontSize: 9, color: colors.muted, marginTop: 1 },
  savePill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99, backgroundColor: colors.lime, borderWidth: 1, borderColor: colors.ink },
  saveDisabled: { opacity: 0.45 },
  savePillText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.ink },
  content: { padding: 20, paddingBottom: 50 },
  photoCard: { height: 225, borderRadius: 25, borderWidth: 1.5, borderColor: colors.ink, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%' },
  photoEmoji: { fontSize: 87 },
  privatePill: { position: 'absolute', right: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.75)' },
  privateText: { fontFamily: fonts.sansBold, fontSize: 7, letterSpacing: 1, color: colors.ink },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 23, marginBottom: 10 },
  numberPill: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.lime, borderWidth: 1, borderColor: colors.ink },
  numberText: { fontFamily: fonts.sansBold, fontSize: 8, color: colors.ink },
  fieldTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.ink },
  input: { height: 53, borderRadius: 16, paddingHorizontal: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  chips: { gap: 8 },
  chip: { minHeight: 39, paddingHorizontal: 14, borderRadius: 99, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fonts.sansMedium, fontSize: 10, color: colors.ink },
  chipTextActive: { color: colors.card },
  twoColumns: { flexDirection: 'row', gap: 10, marginTop: 17 },
  column: { flex: 1 },
  smallLabel: { fontFamily: fonts.sansBold, fontSize: 8, letterSpacing: 1.1, color: colors.muted, marginBottom: 6 },
  smallInput: { height: 48, borderRadius: 15, paddingHorizontal: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink },
  tagSection: { marginTop: 1 },
  wrapChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagActive: { backgroundColor: colors.softGreen, borderColor: colors.moss },
  favoriteCard: { marginTop: 26, padding: 16, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  favoriteTitle: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.ink },
  favoriteBody: { fontFamily: fonts.sans, fontSize: 9, color: colors.muted, marginTop: 2 },
  hearts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  deleteButton: { height: 50, marginTop: 17, borderRadius: 16, borderWidth: 1, borderColor: colors.blush, backgroundColor: '#FFF4F1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deleteText: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.coral },
});
