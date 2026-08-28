import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

type BrandHeaderProps = {
  eyebrow?: string;
  title?: string;
  onBack?: () => void;
  actionIcon?: 'notifications-outline' | 'ellipsis-horizontal' | 'add';
  onAction?: () => void;
};

export function BrandHeader({ eyebrow, title, onBack, actionIcon, onAction }: BrandHeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.roundButton} hitSlop={10}>
          <Ionicons name="arrow-back" size={21} color={colors.ink} />
        </Pressable>
      ) : (
        <View>
          <Text style={styles.wordmark}>hang on<Text style={styles.dot}>.</Text></Text>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        </View>
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      {actionIcon ? (
        <Pressable onPress={onAction} style={styles.roundButton} hitSlop={10}>
          <Ionicons name={actionIcon} size={21} color={colors.ink} />
        </Pressable>
      ) : onBack ? <View style={styles.spacer} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  wordmark: {
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 25,
    letterSpacing: -1.2,
  },
  dot: {
    color: colors.coral,
  },
  eyebrow: {
    color: colors.muted,
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: -2,
    textTransform: 'uppercase',
  },
  title: {
    position: 'absolute',
    left: 70,
    right: 70,
    textAlign: 'center',
    color: colors.ink,
    fontFamily: fonts.sansBold,
    fontSize: 17,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  spacer: { width: 40, height: 40 },
});
