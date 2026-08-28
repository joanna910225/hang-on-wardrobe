import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadows } from '../theme';
import { WardrobeCategory, WardrobeItem } from '../types';

const goals: { category: WardrobeCategory; target: number; color: string; emoji: string; note: string }[] = [
  { category: 'Tops', target: 4, color: colors.lime, emoji: '👕', note: 'The ones you reach for' },
  { category: 'Bottoms', target: 3, color: colors.sky, emoji: '👖', note: 'Jeans, trousers or skirts' },
  { category: 'Shoes', target: 2, color: colors.butter, emoji: '👞', note: 'Your everyday pairs' },
  { category: 'Outerwear', target: 2, color: colors.lilac, emoji: '🧥', note: 'Jackets, coats or layers' },
];

type OnboardingScreenProps = {
  wardrobe: WardrobeItem[];
  onAdd: (category: WardrobeCategory) => void;
  onUseDemo: () => void;
  onFinish: () => void;
};

export function OnboardingScreen({ wardrobe, onAdd, onUseDemo, onFinish }: OnboardingScreenProps) {
  const [page, setPage] = useState<'welcome' | 'build'>(wardrobe.length > 0 ? 'build' : 'welcome');
  const progress = useMemo(
    () => goals.map((goal) => ({
      ...goal,
      current: wardrobe.filter((item) => item.category === goal.category).length,
    })),
    [wardrobe],
  );
  const completedCount = progress.reduce((sum, goal) => sum + Math.min(goal.current, goal.target), 0);
  const ready = progress.every((goal) => goal.current >= goal.target);

  if (page === 'welcome') {
    return (
      <View style={styles.welcome}>
        <View style={styles.wordmarkWrap}>
          <Text style={styles.wordmark}>hang on<Text style={styles.dot}>.</Text></Text>
          <Text style={styles.wordmarkSub}>BUY LESS. WEAR MORE.</Text>
        </View>
        <LinearGradient colors={[colors.lilac, colors.sky]} style={styles.welcomeArt}>
          <View style={styles.hangerCircle}><Text style={styles.hanger}>?</Text></View>
          <View style={[styles.floatPiece, styles.floatPieceOne]}><Text style={styles.floatEmoji}>👔</Text></View>
          <View style={[styles.floatPiece, styles.floatPieceTwo]}><Text style={styles.floatEmoji}>👖</Text></View>
          <View style={[styles.floatPiece, styles.floatPieceThree]}><Text style={styles.floatEmoji}>👞</Text></View>
          <Text style={styles.artCaption}>YOUR CLOSET,{`\n`}IN THE CONVERSATION.</Text>
        </LinearGradient>
        <View style={styles.welcomeCopy}>
          <Text style={styles.welcomeKicker}>START SMALL</Text>
          <Text style={styles.welcomeTitle}>Your most-worn pieces are enough.</Text>
          <Text style={styles.welcomeBody}>Add 11 everyday items—not your whole closet. Hang On will use them to make every match check more personal.</Text>
        </View>
        <Pressable onPress={() => setPage('build')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>Build my starter closet</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.ink} />
        </Pressable>
        <Pressable onPress={onUseDemo} style={styles.demoButton}>
          <Text style={styles.demoText}>Explore with an example wardrobe</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.buildScreen}>
      <View style={styles.buildHeader}>
        <Pressable onPress={() => setPage('welcome')} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={colors.ink} />
        </Pressable>
        <View style={styles.buildHeaderCopy}>
          <Text style={styles.buildHeaderTitle}>Starter closet</Text>
          <Text style={styles.buildHeaderSubtitle}>{completedCount} of 11 essentials</Text>
        </View>
        <View style={styles.progressBadge}><Text style={styles.progressBadgeText}>{completedCount}/11</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.buildContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.buildKicker}>YOUR REAL ROTATION</Text>
        <Text style={styles.buildTitle}>Add what you actually wear.</Text>
        <Text style={styles.buildBody}>A quick front-facing photo is perfect. You can edit every detail before saving.</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(completedCount / 11) * 100}%` }]} />
        </View>

        <View style={styles.goalList}>
          {progress.map((goal, index) => {
            const isDone = goal.current >= goal.target;
            return (
              <View key={goal.category} style={styles.goalCard}>
                <View style={[styles.goalVisual, { backgroundColor: goal.color }]}>
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <Text style={styles.goalIndex}>0{index + 1}</Text>
                </View>
                <View style={styles.goalCopy}>
                  <Text style={styles.goalTitle}>{goal.target} {goal.category.toLowerCase()}</Text>
                  <Text style={styles.goalNote}>{goal.note}</Text>
                  <View style={styles.goalMiniTrack}>
                    {Array.from({ length: goal.target }).map((_, dotIndex) => (
                      <View key={dotIndex} style={[styles.goalMiniDot, dotIndex < goal.current && { backgroundColor: goal.color }]} />
                    ))}
                  </View>
                </View>
                <Pressable
                  onPress={() => onAdd(goal.category)}
                  style={[styles.goalAction, isDone && styles.goalActionDone]}
                >
                  <Ionicons name={isDone ? 'checkmark' : 'add'} size={19} color={colors.ink} />
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={21} color={colors.ink} />
          <Text style={styles.tipText}>Choose pieces you wore in the last two weeks. That’s more useful than cataloguing everything.</Text>
        </View>
      </ScrollView>
      <View style={styles.buildFooter}>
        <Pressable
          disabled={!ready}
          onPress={onFinish}
          style={({ pressed }) => [styles.finishButton, !ready && styles.finishDisabled, pressed && ready && styles.pressed]}
        >
          <Text style={[styles.finishText, !ready && styles.finishTextDisabled]}>{ready ? 'My starter closet is ready' : `${11 - completedCount} pieces to go`}</Text>
          <Ionicons name={ready ? 'checkmark-circle' : 'lock-closed-outline'} size={19} color={ready ? colors.ink : colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcome: { flex: 1, backgroundColor: colors.paper, paddingHorizontal: 22, paddingBottom: 20 },
  wordmarkWrap: { paddingTop: 12, paddingBottom: 16 },
  wordmark: { fontFamily: fonts.sansBold, fontSize: 27, letterSpacing: -1.2, color: colors.ink },
  dot: { color: colors.coral },
  wordmarkSub: { fontFamily: fonts.sansMedium, fontSize: 8, letterSpacing: 1.5, color: colors.muted, marginTop: -2 },
  welcomeArt: { flex: 1, minHeight: 300, maxHeight: 410, borderRadius: 32, borderWidth: 1.5, borderColor: colors.ink, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  hangerCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.lime, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-7deg' }] },
  hanger: { fontFamily: fonts.serif, fontSize: 67, color: colors.ink },
  floatPiece: { position: 'absolute', width: 78, height: 78, borderRadius: 23, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  floatPieceOne: { left: 25, top: 32, transform: [{ rotate: '-9deg' }] },
  floatPieceTwo: { right: 25, top: 70, transform: [{ rotate: '8deg' }] },
  floatPieceThree: { left: 48, bottom: 55, transform: [{ rotate: '5deg' }] },
  floatEmoji: { fontSize: 40 },
  artCaption: { position: 'absolute', right: 20, bottom: 18, textAlign: 'right', fontFamily: fonts.sansBold, fontSize: 9, lineHeight: 13, letterSpacing: 1.1, color: colors.ink },
  welcomeCopy: { paddingTop: 23 },
  welcomeKicker: { fontFamily: fonts.sansBold, fontSize: 9, letterSpacing: 1.3, color: colors.moss },
  welcomeTitle: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 33, letterSpacing: -0.6, color: colors.ink, marginTop: 6 },
  welcomeBody: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 8 },
  primaryButton: { height: 56, borderRadius: 18, borderWidth: 1.5, borderColor: colors.ink, backgroundColor: colors.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 19, marginTop: 20 },
  primaryText: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.ink },
  demoButton: { alignItems: 'center', paddingVertical: 13 },
  demoText: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.muted, textDecorationLine: 'underline' },
  buildScreen: { flex: 1, backgroundColor: colors.paper },
  buildHeader: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 11 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  buildHeaderCopy: { flex: 1 },
  buildHeaderTitle: { fontFamily: fonts.sansBold, fontSize: 15, color: colors.ink },
  buildHeaderSubtitle: { fontFamily: fonts.sans, fontSize: 9, color: colors.muted, marginTop: 1 },
  progressBadge: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 99, backgroundColor: colors.lime, borderWidth: 1, borderColor: colors.ink },
  progressBadgeText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.ink },
  buildContent: { paddingHorizontal: 20, paddingTop: 17, paddingBottom: 120 },
  buildKicker: { fontFamily: fonts.sansBold, fontSize: 9, letterSpacing: 1.3, color: colors.moss },
  buildTitle: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 35, color: colors.ink, marginTop: 6 },
  buildBody: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18, color: colors.muted, maxWidth: 335, marginTop: 7 },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: colors.line, overflow: 'hidden', marginTop: 22 },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: colors.lime },
  goalList: { gap: 11, marginTop: 20 },
  goalCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 12, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  goalVisual: { width: 74, height: 78, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  goalEmoji: { fontSize: 39 },
  goalIndex: { position: 'absolute', left: 7, top: 6, fontFamily: fonts.sansBold, fontSize: 7, color: colors.ink },
  goalCopy: { flex: 1 },
  goalTitle: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.ink },
  goalNote: { fontFamily: fonts.sans, fontSize: 9, color: colors.muted, marginTop: 2 },
  goalMiniTrack: { flexDirection: 'row', gap: 5, marginTop: 10 },
  goalMiniDot: { width: 22, height: 5, borderRadius: 3, backgroundColor: colors.line },
  goalAction: { width: 40, height: 40, borderRadius: 15, backgroundColor: colors.lime, borderWidth: 1, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  goalActionDone: { backgroundColor: colors.softGreen },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 16, borderRadius: 20, backgroundColor: colors.butter, marginTop: 18 },
  tipText: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 10, lineHeight: 15, color: colors.ink },
  buildFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14, paddingHorizontal: 20, backgroundColor: 'rgba(244,240,231,0.96)' },
  finishButton: { height: 55, borderRadius: 18, backgroundColor: colors.lime, borderWidth: 1.5, borderColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  finishDisabled: { backgroundColor: colors.card, borderColor: colors.line },
  finishText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.ink },
  finishTextDisabled: { color: colors.muted },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
