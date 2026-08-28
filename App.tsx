import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNav } from './src/components/BottomNav';
import { ItemEditorModal } from './src/components/ItemEditorModal';
import { createLocalMatch, createVisionMatch } from './src/domain/matching';
import { CheckScreen } from './src/screens/CheckScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { WardrobeScreen } from './src/screens/WardrobeScreen';
import {
  getSetting,
  loadMatchChecks,
  loadWardrobeItems,
  markMatchAdded,
  migrateDatabase,
  removeWardrobeItem,
  saveMatchCheck,
  saveWardrobeItem,
  seedStarterWardrobe,
  setSetting,
} from './src/storage/database';
import { deleteManagedImage, persistCheckImage, persistWardrobeImage } from './src/storage/files';
import { analyzeCandidateWithVision, isVisionAnalysisConfigured } from './src/services/analysisApi';
import { colors, fonts } from './src/theme';
import { MainTab, MatchCheck, Screen, WardrobeCategory, WardrobeItem, WardrobeItemDraft } from './src/types';

type EditorState = {
  visible: boolean;
  item?: WardrobeItem;
  imageUri?: string;
  defaultCategory: WardrobeCategory;
};

const emptyEditor: EditorState = {
  visible: false,
  defaultCategory: 'Tops',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="hang-on.db" onInit={migrateDatabase}>
        <AppShell />
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

function AppShell() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [lastMainTab, setLastMainTab] = useState<MainTab>('home');
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [checks, setChecks] = useState<MatchCheck[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<MatchCheck>();
  const [candidateImage, setCandidateImage] = useState<string>();
  const [candidateName, setCandidateName] = useState('Cocoa suede jacket');
  const [candidateCategory, setCandidateCategory] = useState<WardrobeCategory>('Outerwear');
  const [liking, setLiking] = useState(4);
  const [analyzing, setAnalyzing] = useState(false);
  const [editor, setEditor] = useState<EditorState>(emptyEditor);
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const [savedWardrobe, savedChecks, completed] = await Promise.all([
          loadWardrobeItems(db),
          loadMatchChecks(db),
          getSetting(db, 'onboarding_completed'),
        ]);
        if (!active) return;
        setWardrobe(savedWardrobe);
        setChecks(savedChecks);
        setOnboardingComplete(completed === 'true');
      } catch {
        Alert.alert('Could not open your wardrobe', 'Please close and reopen Hang On to try again.');
      } finally {
        if (active) setReady(true);
      }
    };

    void initialize();
    return () => {
      active = false;
    };
  }, [db]);

  const navigateTab = (tab: MainTab) => {
    setLastMainTab(tab);
    setScreen(tab);
  };

  const refreshWardrobe = async () => {
    const items = await loadWardrobeItems(db);
    setWardrobe(items);
    return items;
  };

  const pickCandidateImage = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Camera access needed', 'Allow camera access to photograph a piece you are considering.');
          return;
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Photo access needed', 'Allow photo access to choose a product image.');
          return;
        }
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.8 });

      if (!result.canceled) {
        setCandidateImage(result.assets[0].uri);
        setCandidateName('New find');
      }
    } catch {
      Alert.alert(
        source === 'camera' ? 'Camera unavailable' : 'Could not open photos',
        source === 'camera'
          ? 'The iOS Simulator has no camera. Choose a photo or continue with the demo piece.'
          : 'Please try again or continue with the demo piece.',
      );
    }
  };

  const launchWardrobePicker = async (category: WardrobeCategory, source: 'camera' | 'library') => {
    try {
      const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          source === 'camera' ? 'Camera access needed' : 'Photo access needed',
          `Allow ${source === 'camera' ? 'camera' : 'photo'} access to add your wardrobe pieces.`,
        );
        return;
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 0.8 });
      if (!result.canceled) {
        setEditor({ visible: true, imageUri: result.assets[0].uri, defaultCategory: category });
      }
    } catch {
      Alert.alert(
        source === 'camera' ? 'Camera unavailable' : 'Could not open photos',
        source === 'camera' ? 'The iOS Simulator has no camera. Choose from photos instead.' : 'Please try again in a moment.',
      );
    }
  };

  const addWardrobeItem = (category: WardrobeCategory) => {
    Alert.alert('Add a piece', 'A quick, front-facing photo works best.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take photo', onPress: () => void launchWardrobePicker(category, 'camera') },
      { text: 'Choose photo', onPress: () => void launchWardrobePicker(category, 'library') },
    ]);
  };

  const saveEditorItem = async (draft: WardrobeItemDraft) => {
    if (savingItem) return;
    setSavingItem(true);
    const now = new Date().toISOString();
    const id = editor.item?.id ?? `wardrobe-${Date.now()}`;

    try {
      const shouldPersistImage = draft.imageUri && draft.imageUri !== editor.item?.imageUri;
      const imageUri = shouldPersistImage ? await persistWardrobeImage(draft.imageUri!, id) : draft.imageUri;
      const item: WardrobeItem = {
        ...draft,
        id,
        imageUri,
        createdAt: editor.item?.createdAt ?? now,
        updatedAt: now,
      };
      await saveWardrobeItem(db, item);
      await refreshWardrobe();
      setEditor(emptyEditor);
    } catch {
      Alert.alert('Could not save this piece', 'Your photo is still safe. Please try again.');
    } finally {
      setSavingItem(false);
    }
  };

  const deleteEditorItem = () => {
    const item = editor.item;
    if (!item) return;
    Alert.alert('Remove this piece?', 'It will no longer be used in future match checks.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await removeWardrobeItem(db, item.id);
              deleteManagedImage(item.imageUri);
              await refreshWardrobe();
              setEditor(emptyEditor);
            } catch {
              Alert.alert('Could not remove this piece', 'Please try again.');
            }
          })();
        },
      },
    ]);
  };

  const useDemoWardrobe = async () => {
    try {
      await seedStarterWardrobe(db);
      await refreshWardrobe();
      setOnboardingComplete(true);
    } catch {
      Alert.alert('Could not load the example wardrobe', 'Please try again.');
    }
  };

  const finishOnboarding = async () => {
    try {
      await setSetting(db, 'onboarding_completed', 'true');
      setOnboardingComplete(true);
    } catch {
      Alert.alert('Could not finish setup', 'Please try again.');
    }
  };

  const analyze = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    try {
      const id = `check-${Date.now()}`;
      const storedImage = candidateImage ? await persistCheckImage(candidateImage, id) : undefined;
      let usedLocalFallback = false;
      let match: MatchCheck;

      if (storedImage && isVisionAnalysisConfigured()) {
        try {
          const response = await analyzeCandidateWithVision({
            imageUri: storedImage,
            candidateName,
            categoryHint: candidateCategory,
            liking,
            wardrobe,
          });
          match = createVisionMatch(id, storedImage, liking, response);
        } catch {
          usedLocalFallback = true;
          match = createLocalMatch({
            id,
            name: candidateName,
            imageUri: storedImage,
            category: candidateCategory,
            liking,
            wardrobe,
          });
        }
      } else {
        match = createLocalMatch({
          id,
          name: candidateName,
          imageUri: storedImage,
          category: candidateCategory,
          liking,
          wardrobe,
        });
      }
      await saveMatchCheck(db, match);
      setCandidateImage(storedImage);
      setCandidateName(match.candidateName);
      setCandidateCategory(match.candidateCategory);
      setChecks((existing) => [match, ...existing]);
      setSelectedCheck(match);
      setScreen('result');
      if (usedLocalFallback) {
        Alert.alert('Photo analysis paused', 'We used a private local estimate this time. Your result is still saved.');
      }
    } catch {
      Alert.alert('Could not finish this match check', 'Please try again in a moment.');
    } finally {
      setAnalyzing(false);
    }
  };

  const openCheck = (check: MatchCheck) => {
    setSelectedCheck(check);
    setScreen('result');
  };

  const addCandidateToWardrobe = async () => {
    const match = selectedCheck;
    if (!match || match.addedToWardrobe) return;

    try {
      const id = `wardrobe-${Date.now()}`;
      const now = new Date().toISOString();
      const imageUri = match.candidateImageUri ? await persistWardrobeImage(match.candidateImageUri, id) : undefined;
      const item: WardrobeItem = {
        id,
        name: match.candidateName,
        category: match.candidateCategory,
        emoji: match.candidateEmoji,
        background: match.candidateBackground,
        colorName: match.candidateAnalysis?.primaryColor ?? 'Not set',
        imageUri,
        subcategory: match.candidateAnalysis?.subcategory ?? '',
        styleTags: match.candidateAnalysis?.styleTags ?? [],
        seasonTags: match.candidateAnalysis?.seasonTags ?? [],
        occasionTags: match.candidateAnalysis?.occasionTags ?? [],
        favoriteScore: match.liking,
        createdAt: now,
        updatedAt: now,
      };
      await saveWardrobeItem(db, item);
      await markMatchAdded(db, match.id);
      const updatedMatch = { ...match, addedToWardrobe: true };
      setSelectedCheck(updatedMatch);
      setChecks((existing) => existing.map((check) => check.id === match.id ? updatedMatch : check));
      await refreshWardrobe();
    } catch {
      Alert.alert('Could not add this piece', 'Please try again.');
    }
  };

  if (!ready) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }] }>
        <StatusBar style="dark" />
        <ActivityIndicator color={colors.moss} />
        <Text style={styles.loadingTitle}>Opening your wardrobe…</Text>
      </View>
    );
  }

  if (!onboardingComplete) {
    return (
      <View style={[styles.app, { paddingTop: insets.top }] }>
        <StatusBar style="dark" />
        <OnboardingScreen
          wardrobe={wardrobe}
          onAdd={addWardrobeItem}
          onUseDemo={() => void useDemoWardrobe()}
          onFinish={() => void finishOnboarding()}
        />
        <ItemEditorModal
          visible={editor.visible}
          item={editor.item}
          imageUri={editor.imageUri}
          defaultCategory={editor.defaultCategory}
          saving={savingItem}
          onClose={() => setEditor(emptyEditor)}
          onSave={(draft) => void saveEditorItem(draft)}
          onDelete={editor.item ? deleteEditorItem : undefined}
        />
      </View>
    );
  }

  const mainTab: MainTab = screen === 'home' || screen === 'check' || screen === 'wardrobe' ? screen : lastMainTab;
  const showNavigation = screen === 'home' || screen === 'check' || screen === 'wardrobe';

  return (
    <View style={[styles.app, { paddingTop: insets.top }] }>
      <StatusBar style="dark" />
      {screen === 'home' && (
        <HomeScreen
          wardrobe={wardrobe}
          checks={checks}
          onStartCheck={() => navigateTab('check')}
          onOpenResult={() => checks[0] && openCheck(checks[0])}
          onOpenHistory={() => setScreen('history')}
          onOpenWardrobe={() => navigateTab('wardrobe')}
        />
      )}
      {screen === 'check' && (
        <CheckScreen
          imageUri={candidateImage}
          liking={liking}
          analyzing={analyzing}
          onSetLiking={setLiking}
          onPickImage={pickCandidateImage}
          onAnalyze={() => void analyze()}
        />
      )}
      {screen === 'wardrobe' && (
        <WardrobeScreen
          wardrobe={wardrobe}
          onAdd={addWardrobeItem}
          onEdit={(item) => setEditor({ visible: true, item, defaultCategory: item.category })}
        />
      )}
      {screen === 'history' && (
        <HistoryScreen
          checks={checks}
          onBack={() => setScreen('home')}
          onSelect={openCheck}
          onStartCheck={() => navigateTab('check')}
        />
      )}
      {screen === 'result' && selectedCheck && (
        <ResultScreen
          wardrobe={wardrobe}
          match={selectedCheck}
          onBack={() => setScreen(lastMainTab === 'home' ? 'home' : 'check')}
          onAdd={() => void addCandidateToWardrobe()}
        />
      )}
      {showNavigation && (
        <View style={[styles.navigation, { paddingBottom: Math.max(insets.bottom, 5) }]}>
          <BottomNav active={mainTab} onChange={navigateTab} />
        </View>
      )}
      <ItemEditorModal
        visible={editor.visible}
        item={editor.item}
        imageUri={editor.imageUri}
        defaultCategory={editor.defaultCategory}
        saving={savingItem}
        onClose={() => setEditor(emptyEditor)}
        onSave={(draft) => void saveEditorItem(draft)}
        onDelete={editor.item ? deleteEditorItem : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.paper,
  },
  loadingTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.muted,
  },
  navigation: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
