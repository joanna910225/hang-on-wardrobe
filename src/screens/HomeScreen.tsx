import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '../components/BrandHeader';
import { colors, fonts } from '../theme';
import { MatchCheck, WardrobeItem } from '../types';

type HomeScreenProps = {
  wardrobe: WardrobeItem[];
  checks: MatchCheck[];
  onStartCheck: () => void;
  onOpenResult: () => void;
  onOpenHistory: () => void;
  onOpenWardrobe: () => void;
};

export function HomeScreen({ wardrobe, checks, onStartCheck, onOpenResult, onOpenHistory, onOpenWardrobe }: HomeScreenProps) {
  const latestCheck = checks[0];

  return (
    <View style={styles.screen}>
      <BrandHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Before you buy it,{`\n`}check your closet.</Text>
        <Text style={styles.subtitle}>One photo shows how well a new piece fits what you already wear.</Text>

        <Pressable onPress={onStartCheck} style={({ pressed }) => [styles.checkButton, pressed && styles.pressed]}>
          <View style={styles.checkIcon}><Ionicons name="camera" size={24} color={colors.ink} /></View>
          <View style={styles.checkCopy}>
            <Text style={styles.checkTitle}>Check a new find</Text>
            <Text style={styles.checkBody}>See the score and possible outfits</Text>
          </View>
          <Ionicons name="arrow-forward" size={21} color={colors.ink} />
        </Pressable>

        <Pressable onPress={onOpenWardrobe} style={({ pressed }) => [styles.wardrobeRow, pressed && styles.pressed]}>
          <View style={styles.rowIcon}><Ionicons name="shirt-outline" size={21} color={colors.ink} /></View>
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>Your wardrobe</Text>
            <Text style={styles.rowBody}>{wardrobe.length} saved pieces</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={colors.muted} />
        </Pressable>

        {latestCheck && (
          <View style={styles.latestSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest check</Text>
              <Pressable onPress={onOpenHistory} hitSlop={8}><Text style={styles.historyLink}>View all</Text></Pressable>
            </View>
            <Pressable onPress={onOpenResult} style={({ pressed }) => [styles.latestCard, pressed && styles.pressed]}>
              <View style={[styles.latestImage, { backgroundColor: latestCheck.candidateBackground }]}>
                {latestCheck.candidateImageUri ? (
                  <Image source={{ uri: latestCheck.candidateImageUri }} style={styles.photo} />
                ) : (
                  <Text style={styles.emoji}>{latestCheck.candidateEmoji}</Text>
                )}
              </View>
              <View style={styles.latestCopy}>
                <Text style={styles.latestName} numberOfLines={1}>{latestCheck.candidateName}</Text>
                <Text style={styles.latestMeta}>{latestCheck.outfitCount} outfits · {latestCheck.overlapCount} similar</Text>
              </View>
              <View style={styles.score}><Text style={styles.scoreText}>{latestCheck.score}</Text></View>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 34, paddingBottom: 120 },
  title: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 42, letterSpacing: -1.1, color: colors.ink },
  subtitle: { maxWidth: 335, marginTop: 12, fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.muted },
  checkButton: { minHeight: 90, marginTop: 32, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 22, backgroundColor: colors.lime, borderWidth: 1.5, borderColor: colors.ink },
  checkIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  checkCopy: { flex: 1 },
  checkTitle: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.ink },
  checkBody: { marginTop: 3, fontFamily: fonts.sans, fontSize: 11, color: '#555149' },
  wardrobeRow: { minHeight: 76, marginTop: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  rowIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.softGreen },
  rowCopy: { flex: 1 },
  rowTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.ink },
  rowBody: { marginTop: 2, fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  latestSection: { marginTop: 34 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.sansBold, fontSize: 18, color: colors.ink },
  historyLink: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.moss },
  latestCard: { minHeight: 92, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  latestImage: { width: 72, height: 72, borderRadius: 15, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  emoji: { fontSize: 38 },
  latestCopy: { flex: 1 },
  latestName: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.ink },
  latestMeta: { marginTop: 5, fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  score: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.softGreen },
  scoreText: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.moss },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
