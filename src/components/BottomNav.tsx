import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import { MainTab } from '../types';

type IconName = ComponentProps<typeof Ionicons>['name'];

const tabs: { id: MainTab; label: string; icon: IconName; activeIcon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'check', label: 'Check', icon: 'camera-outline', activeIcon: 'camera' },
  { id: 'wardrobe', label: 'Wardrobe', icon: 'shirt-outline', activeIcon: 'shirt' },
];

type BottomNavProps = {
  active: MainTab;
  onChange: (tab: MainTab) => void;
};

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [styles.tab, isActive && styles.activeTab, pressed && styles.pressed]}
          >
            <Ionicons name={isActive ? tab.activeIcon : tab.icon} size={20} color={isActive ? colors.ink : colors.muted} />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 18, marginBottom: 8, padding: 6, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  tab: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 16 },
  activeTab: { backgroundColor: colors.lime },
  label: { fontFamily: fonts.sansMedium, fontSize: 10, color: colors.muted },
  activeLabel: { color: colors.ink },
  pressed: { opacity: 0.65 },
});
