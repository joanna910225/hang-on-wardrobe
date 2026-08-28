import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '../components/BrandHeader';
import { ClothingTile } from '../components/ClothingTile';
import { candidate } from '../data';
import { colors, fonts } from '../theme';
import { MatchCheck, WardrobeItem } from '../types';

const outfitLabels = ['Work', 'Weekend', 'Dinner'];

type ResultScreenProps = {
  wardrobe: WardrobeItem[];
  match: MatchCheck;
  onBack: () => void;
  onAdd: () => void;
};

export function ResultScreen({ wardrobe, match, onBack, onAdd }: ResultScreenProps) {
  const tops = wardrobe.filter((item) => item.category === 'Tops');
  const bottoms = wardrobe.filter((item) => item.category === 'Bottoms');
  const shoes = wardrobe.filter((item) => item.category === 'Shoes');
  const outfitLooks = outfitLabels.map((_, index) => [
    tops[index % Math.max(tops.length, 1)],
    bottoms[index % Math.max(bottoms.length, 1)],
    shoes[index % Math.max(shoes.length, 1)],
  ].filter((item): item is WardrobeItem => Boolean(item)));
  const alternativeLook = [tops[0], tops[1], bottoms[0]].filter((item): item is WardrobeItem => Boolean(item));
  const alternativeNames = alternativeLook.map((item) => item.name.toLowerCase()).join(' + ');
  const fitLabel = match.score >= 80 ? 'Strong fit' : match.score >= 65 ? 'Promising' : 'Think again';

  return (
    <View style={styles.screen}>
      <BrandHeader title="Result" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.candidateCard, { backgroundColor: match.candidateBackground }]}>
            {match.candidateImageUri ? (
              <Image source={{ uri: match.candidateImageUri }} style={styles.candidateImage} resizeMode="cover" />
            ) : (
              <Text style={styles.candidateEmoji}>{match.candidateEmoji || candidate.emoji}</Text>
            )}
          </View>
          <View style={styles.scoreSide}>
            <Text style={styles.scoreLabel}>WARDROBE FIT</Text>
            <Text style={styles.score}>{match.score}</Text>
            <Text style={styles.scoreUnit}>out of 100</Text>
            <View style={styles.fitPill}><Text style={styles.fitText}>{fitLabel}</Text></View>
            <Text style={styles.source}>{match.analysisSource === 'vision' ? 'Photo analyzed' : 'Local estimate'}</Text>
          </View>
        </View>

        <Text style={styles.verdict}>{match.verdict}</Text>
        <Text style={styles.summary}>{match.candidateName} can make about {match.outfitCount} outfits with your wardrobe.</Text>

        <View style={styles.stats}>
          <Stat value={`${match.outfitCount}`} label="outfits" />
          <View style={styles.divider} />
          <Stat value={`${match.colorScore}/5`} label="color" />
          <View style={styles.divider} />
          <Stat value={`${match.overlapCount}`} label="similar" />
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.sectionLabel}>WHY</Text>
          {match.reasons.map((reason, index) => (
            <View key={`${reason.kind}-${index}`} style={[styles.reasonRow, index > 0 && styles.reasonBorder]}>
              <Ionicons
                name={reason.kind === 'caveat' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                size={18}
                color={reason.kind === 'caveat' ? colors.coral : colors.moss}
              />
              <Text style={styles.reasonText}>{reason.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Wear it with</Text>
          <Text style={styles.sectionHint}>Swipe</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outfits} snapToInterval={244} decelerationRate="fast">
          {outfitLooks.map((look, index) => (
            <View key={outfitLabels[index]} style={styles.outfitCard}>
              <Text style={styles.outfitLabel}>{outfitLabels[index]}</Text>
              <View style={styles.lookPieces}>
                {look.map((item, pieceIndex) => (
                  <ClothingTile key={item.id} item={item} compact style={{ marginLeft: pieceIndex === 0 ? 0 : -7 }} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.alternativeCard}>
          <View style={styles.altHeader}>
            <Text style={styles.altLabel}>HANG ON—</Text>
            <Ionicons name="leaf-outline" size={20} color={colors.lime} />
          </View>
          <Text style={styles.altTitle}>Get the feeling without buying it.</Text>
          <Text style={styles.altBody}>{alternativeNames || 'Pieces already in your wardrobe'} can create a similar look first.</Text>
          <View style={styles.altLook}>
            {alternativeLook.map((item, index) => (
              <ClothingTile key={item.id} item={item} compact style={{ marginLeft: index === 0 ? 0 : -7 }} />
            ))}
          </View>
        </View>

        <Pressable disabled={match.addedToWardrobe} onPress={onAdd} style={({ pressed }) => [styles.addButton, match.addedToWardrobe && styles.addedButton, pressed && styles.pressed]}>
          <Ionicons name={match.addedToWardrobe ? 'checkmark' : 'add'} size={20} color={colors.ink} />
          <Text style={styles.addText}>{match.addedToWardrobe ? 'Added to wardrobe' : 'Add to my wardrobe'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  candidateCard: { width: '52%', height: 222, borderRadius: 23, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  candidateImage: { width: '100%', height: '100%' },
  candidateEmoji: { fontSize: 83 },
  scoreSide: { flex: 1, alignItems: 'flex-start' },
  scoreLabel: { fontFamily: fonts.sansBold, fontSize: 8, letterSpacing: 1.1, color: colors.muted },
  score: { marginTop: 2, fontFamily: fonts.serif, fontSize: 62, lineHeight: 67, color: colors.ink },
  scoreUnit: { fontFamily: fonts.sans, fontSize: 10, color: colors.muted },
  fitPill: { marginTop: 12, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 99, backgroundColor: colors.softGreen },
  fitText: { fontFamily: fonts.sansBold, fontSize: 9, color: colors.moss },
  source: { marginTop: 7, fontFamily: fonts.sans, fontSize: 8, color: colors.muted },
  verdict: { marginTop: 24, fontFamily: fonts.serif, fontSize: 27, lineHeight: 32, color: colors.ink },
  summary: { marginTop: 8, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.muted },
  stats: { height: 78, marginTop: 18, flexDirection: 'row', alignItems: 'center', borderRadius: 19, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: fonts.sansBold, fontSize: 18, color: colors.ink },
  statLabel: { marginTop: 2, fontFamily: fonts.sans, fontSize: 9, color: colors.muted },
  divider: { width: 1, height: 30, backgroundColor: colors.line },
  reasonCard: { marginTop: 13, padding: 16, borderRadius: 19, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  sectionLabel: { fontFamily: fonts.sansBold, fontSize: 8, letterSpacing: 1.2, color: colors.moss },
  reasonRow: { minHeight: 48, paddingVertical: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  reasonBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  reasonText: { flex: 1, fontFamily: fonts.sans, fontSize: 11, lineHeight: 16, color: colors.ink },
  sectionHeader: { marginTop: 28, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: fonts.sansBold, fontSize: 19, color: colors.ink },
  sectionHint: { fontFamily: fonts.sansMedium, fontSize: 9, color: colors.muted },
  outfits: { gap: 10, paddingRight: 20 },
  outfitCard: { width: 232, height: 124, padding: 15, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  outfitLabel: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.ink },
  lookPieces: { marginTop: 10, flexDirection: 'row', alignItems: 'center' },
  alternativeCard: { marginTop: 24, padding: 18, borderRadius: 22, backgroundColor: colors.ink },
  altHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  altLabel: { fontFamily: fonts.sansBold, fontSize: 8, letterSpacing: 1.1, color: colors.lime },
  altTitle: { marginTop: 13, fontFamily: fonts.serif, fontSize: 21, lineHeight: 25, color: colors.card },
  altBody: { marginTop: 7, fontFamily: fonts.sans, fontSize: 10, lineHeight: 15, color: '#C9C5BA' },
  altLook: { marginTop: 15, flexDirection: 'row', alignItems: 'center' },
  addButton: { height: 55, marginTop: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 18, backgroundColor: colors.lime, borderWidth: 1.5, borderColor: colors.ink },
  addedButton: { backgroundColor: colors.softGreen, borderColor: colors.line },
  addText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.ink },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
