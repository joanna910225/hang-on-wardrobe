import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '../components/BrandHeader';
import { colors, fonts } from '../theme';

type CheckScreenProps = {
  imageUri?: string;
  liking: number;
  analyzing: boolean;
  onSetLiking: (value: number) => void;
  onPickImage: (source: 'camera' | 'library') => void;
  onAnalyze: () => void;
};

export function CheckScreen({
  imageUri,
  liking,
  analyzing,
  onSetLiking,
  onPickImage,
  onAnalyze,
}: CheckScreenProps) {
  return (
    <View style={styles.screen}>
      <BrandHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Check a new find</Text>
        <Text style={styles.subtitle}>Add one clear product photo.</Text>

        <Pressable onPress={() => onPickImage('library')} style={({ pressed }) => [styles.photoCard, pressed && styles.pressed]}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
              <View style={styles.changePill}><Ionicons name="images-outline" size={14} color={colors.ink} /><Text style={styles.changeText}>Change</Text></View>
            </>
          ) : (
            <View style={styles.emptyPhoto}>
              <View style={styles.photoIcon}><Ionicons name="images-outline" size={27} color={colors.ink} /></View>
              <Text style={styles.emptyTitle}>Choose a photo</Text>
              <Text style={styles.emptyBody}>A front-facing product image works best</Text>
            </View>
          )}
        </Pressable>

        <Pressable onPress={() => onPickImage('camera')} style={styles.cameraLink}>
          <Ionicons name="camera-outline" size={16} color={colors.moss} />
          <Text style={styles.cameraLinkText}>Take a photo instead</Text>
        </Pressable>

        <View style={styles.likingRow}>
          <View>
            <Text style={styles.label}>How much do you like it?</Text>
            <Text style={styles.likingHint}>Your instinct matters in the score.</Text>
          </View>
          <View style={styles.hearts}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => onSetLiking(value)} hitSlop={5}>
                <Ionicons name={value <= liking ? 'heart' : 'heart-outline'} size={24} color={value <= liking ? colors.coral : colors.muted} />
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable disabled={analyzing} onPress={onAnalyze} style={({ pressed }) => [styles.analyzeButton, pressed && !analyzing && styles.pressed]}>
          {analyzing ? <ActivityIndicator color={colors.ink} /> : <Ionicons name="sparkles-outline" size={20} color={colors.ink} />}
          <Text style={styles.analyzeText}>{analyzing ? 'Checking your wardrobe…' : 'See the wardrobe fit'}</Text>
          {!analyzing && <Ionicons name="arrow-forward" size={20} color={colors.ink} />}
        </Pressable>
        <Text style={styles.privacy}>Only this candidate photo may be analyzed. Wardrobe photos stay on your device.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 120 },
  title: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 37, color: colors.ink },
  subtitle: { marginTop: 5, fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  photoCard: { height: 260, marginTop: 22, borderRadius: 24, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.ink },
  photo: { width: '100%', height: '100%' },
  emptyPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoIcon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime },
  emptyTitle: { marginTop: 14, fontFamily: fonts.sansBold, fontSize: 15, color: colors.ink },
  emptyBody: { marginTop: 4, fontFamily: fonts.sans, fontSize: 10, color: colors.muted },
  changePill: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 99, backgroundColor: 'rgba(255,252,245,0.9)' },
  changeText: { fontFamily: fonts.sansBold, fontSize: 10, color: colors.ink },
  cameraLink: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  cameraLinkText: { fontFamily: fonts.sansMedium, fontSize: 10, color: colors.moss },
  label: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.ink },
  likingRow: { minHeight: 77, marginTop: 14, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  likingHint: { marginTop: 3, fontFamily: fonts.sans, fontSize: 9, color: colors.muted },
  hearts: { flexDirection: 'row', gap: 4 },
  analyzeButton: { height: 56, marginTop: 20, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 18, backgroundColor: colors.lime, borderWidth: 1.5, borderColor: colors.ink },
  analyzeText: { flex: 1, textAlign: 'center', fontFamily: fonts.sansBold, fontSize: 14, color: colors.ink },
  privacy: { marginTop: 10, textAlign: 'center', fontFamily: fonts.sans, fontSize: 8, lineHeight: 12, color: colors.muted },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
