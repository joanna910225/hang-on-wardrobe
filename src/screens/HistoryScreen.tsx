import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '../components/BrandHeader';
import { colors, fonts } from '../theme';
import { MatchCheck } from '../types';

type HistoryScreenProps = {
  checks: MatchCheck[];
  onBack: () => void;
  onSelect: (check: MatchCheck) => void;
  onStartCheck: () => void;
};

export function HistoryScreen({ checks, onBack, onSelect, onStartCheck }: HistoryScreenProps) {
  return (
    <View style={styles.screen}>
      <BrandHeader title="History" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Past checks</Text>
        <Text style={styles.body}>Revisit a score or see what you added.</Text>

        {checks.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}><Ionicons name="scan-outline" size={31} color={colors.ink} /></View>
            <Text style={styles.emptyTitle}>No checks yet</Text>
            <Text style={styles.emptyBody}>Your first wardrobe-fit result will appear here.</Text>
            <Pressable onPress={onStartCheck} style={styles.emptyButton}><Text style={styles.emptyButtonText}>Check a new find</Text></Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {checks.map((check) => (
              <Pressable key={check.id} onPress={() => onSelect(check)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={[styles.imageWrap, { backgroundColor: check.candidateBackground }]}>
                  {check.candidateImageUri ? <Image source={{ uri: check.candidateImageUri }} style={styles.image} /> : <Text style={styles.emoji}>{check.candidateEmoji}</Text>}
                  <View style={styles.score}><Text style={styles.scoreText}>{check.score}</Text></View>
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.date}>{new Date(check.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }).toUpperCase()}</Text>
                  <Text style={styles.cardTitle} numberOfLines={1}>{check.candidateName}</Text>
                  <Text style={styles.cardBody}>{check.outfitCount} outfits · {check.overlapCount} similar</Text>
                  <View style={styles.cardFooter}>
                    <View style={[styles.statusDot, { backgroundColor: check.score >= 75 ? colors.moss : colors.coral }]} />
                    <Text style={styles.statusText}>{check.addedToWardrobe ? 'Added to wardrobe' : check.score >= 75 ? 'Strong fit' : 'Worth another thought'}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={19} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  title: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 5 },
  list: { gap: 10, marginTop: 20 },
  card: { minHeight: 116, flexDirection: 'row', alignItems: 'center', gap: 13, padding: 12, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  imageWrap: { width: 86, height: 91, borderRadius: 17, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  emoji: { fontSize: 44 },
  score: { position: 'absolute', right: 5, bottom: 5, width: 33, height: 33, borderRadius: 17, backgroundColor: colors.lime, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.ink },
  cardCopy: { flex: 1 },
  date: { fontFamily: fonts.sansBold, fontSize: 8, letterSpacing: 1, color: colors.muted },
  cardTitle: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.ink, marginTop: 4 },
  cardBody: { fontFamily: fonts.sans, fontSize: 10, color: colors.muted, marginTop: 3 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: fonts.sansBold, fontSize: 9, color: colors.moss },
  emptyCard: { marginTop: 28, minHeight: 330, borderRadius: 28, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyIcon: { width: 65, height: 65, borderRadius: 22, backgroundColor: colors.lime, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 23, color: colors.ink, marginTop: 17 },
  emptyBody: { textAlign: 'center', fontFamily: fonts.sans, fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 6 },
  emptyButton: { marginTop: 18, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 99, backgroundColor: colors.ink },
  emptyButtonText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.card },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
