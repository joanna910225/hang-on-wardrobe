import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { WardrobeItem } from '../types';

type ClothingTileProps = {
  item: WardrobeItem;
  compact?: boolean;
  style?: ViewStyle;
};

export function ClothingTile({ item, compact = false, style }: ClothingTileProps) {
  return (
    <View style={[styles.container, compact && styles.compactContainer, style]}>
      <View style={[styles.imageArea, { backgroundColor: item.background }, compact && styles.compactImage]}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={[styles.emoji, compact && styles.compactEmoji]}>{item.emoji}</Text>
        )}
      </View>
      {!compact && (
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.category}>{item.colorName} · {item.category}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  compactContainer: {
    width: 62,
    height: 62,
    borderRadius: 17,
  },
  imageArea: {
    height: 138,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  compactImage: {
    height: 60,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 62,
  },
  compactEmoji: {
    fontSize: 31,
  },
  meta: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 13,
  },
  name: {
    color: colors.ink,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
  },
  category: {
    color: colors.muted,
    fontFamily: fonts.sans,
    fontSize: 11,
    marginTop: 3,
  },
});
