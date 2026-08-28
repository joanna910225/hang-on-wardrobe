import { type SQLiteDatabase } from 'expo-sqlite';
import { starterWardrobe } from '../data';
import { ClothingAnalysis, MatchCheck, MatchReason, WardrobeCategory, WardrobeItem } from '../types';

const DATABASE_VERSION = 2;

type WardrobeRow = {
  id: string;
  name: string;
  category: WardrobeCategory;
  emoji: string;
  background: string;
  color_name: string;
  image_uri: string | null;
  subcategory: string;
  style_tags: string;
  season_tags: string;
  occasion_tags: string;
  favorite_score: number;
  created_at: string;
  updated_at: string;
};

type MatchRow = {
  id: string;
  candidate_name: string;
  candidate_image_uri: string | null;
  candidate_category: WardrobeCategory;
  candidate_emoji: string;
  candidate_background: string;
  liking: number;
  score: number;
  outfit_count: number;
  color_score: number;
  overlap_count: number;
  verdict: string;
  reasons: string;
  analysis_source: string;
  candidate_analysis: string | null;
  added_to_wardrobe: number;
  created_at: string;
};

function parseTags(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === 'string') : [];
  } catch {
    return [];
  }
}

function parseReasons(value: string): MatchReason[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      if (typeof entry === 'string') return [{ kind: 'strength' as const, text: entry }];
      if (!entry || typeof entry !== 'object') return [];
      const reason = entry as Partial<MatchReason>;
      const validKind = reason.kind === 'strength' || reason.kind === 'caveat' || reason.kind === 'alternative';
      return validKind && typeof reason.text === 'string' ? [{ kind: reason.kind!, text: reason.text }] : [];
    });
  } catch {
    return [];
  }
}

function wardrobeFromRow(row: WardrobeRow): WardrobeItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    emoji: row.emoji,
    background: row.background,
    colorName: row.color_name,
    imageUri: row.image_uri ?? undefined,
    subcategory: row.subcategory,
    styleTags: parseTags(row.style_tags),
    seasonTags: parseTags(row.season_tags),
    occasionTags: parseTags(row.occasion_tags),
    favoriteScore: row.favorite_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function matchFromRow(row: MatchRow): MatchCheck {
  let candidateAnalysis: ClothingAnalysis | undefined;
  try {
    candidateAnalysis = row.candidate_analysis ? JSON.parse(row.candidate_analysis) as ClothingAnalysis : undefined;
  } catch {
    candidateAnalysis = undefined;
  }
  const savedReasons = parseReasons(row.reasons);
  const reasons = savedReasons.length > 0 ? savedReasons : [
    {
      kind: 'strength' as const,
      text: `This piece can support about ${row.outfit_count} complete ${row.outfit_count === 1 ? 'look' : 'looks'} in your saved wardrobe.`,
    },
    row.overlap_count > 0
      ? { kind: 'caveat' as const, text: `${row.overlap_count} saved ${row.overlap_count === 1 ? 'piece fills' : 'pieces fill'} a similar role.` }
      : { kind: 'strength' as const, text: 'No close category overlap was found in this saved check.' },
  ];

  return {
    id: row.id,
    candidateName: row.candidate_name,
    candidateImageUri: row.candidate_image_uri ?? undefined,
    candidateCategory: row.candidate_category,
    candidateEmoji: row.candidate_emoji,
    candidateBackground: row.candidate_background,
    liking: row.liking,
    score: row.score,
    outfitCount: row.outfit_count,
    colorScore: row.color_score,
    overlapCount: row.overlap_count,
    verdict: row.verdict,
    reasons,
    analysisSource: row.analysis_source === 'vision' ? 'vision' : 'local',
    candidateAnalysis,
    addedToWardrobe: row.added_to_wardrobe === 1,
    createdAt: row.created_at,
  };
}

export async function migrateDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;
  let migratedVersion = currentVersion;

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS wardrobe_items (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        emoji TEXT NOT NULL,
        background TEXT NOT NULL,
        color_name TEXT NOT NULL,
        image_uri TEXT,
        subcategory TEXT NOT NULL DEFAULT '',
        style_tags TEXT NOT NULL DEFAULT '[]',
        season_tags TEXT NOT NULL DEFAULT '[]',
        occasion_tags TEXT NOT NULL DEFAULT '[]',
        favorite_score INTEGER NOT NULL DEFAULT 3,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS match_checks (
        id TEXT PRIMARY KEY NOT NULL,
        candidate_name TEXT NOT NULL,
        candidate_image_uri TEXT,
        candidate_category TEXT NOT NULL,
        candidate_emoji TEXT NOT NULL,
        candidate_background TEXT NOT NULL,
        liking INTEGER NOT NULL,
        score INTEGER NOT NULL,
        outfit_count INTEGER NOT NULL,
        color_score INTEGER NOT NULL,
        overlap_count INTEGER NOT NULL,
        verdict TEXT NOT NULL,
        added_to_wardrobe INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_wardrobe_category ON wardrobe_items(category);
      CREATE INDEX IF NOT EXISTS idx_checks_created ON match_checks(created_at DESC);
      PRAGMA user_version = 1;
    `);
    migratedVersion = 1;
  }

  if (migratedVersion < 2) {
    await db.execAsync(`
      ALTER TABLE match_checks ADD COLUMN reasons TEXT NOT NULL DEFAULT '[]';
      ALTER TABLE match_checks ADD COLUMN analysis_source TEXT NOT NULL DEFAULT 'local';
      ALTER TABLE match_checks ADD COLUMN candidate_analysis TEXT;
      PRAGMA user_version = 2;
    `);
  }

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(`Database version ${currentVersion} is newer than supported version ${DATABASE_VERSION}.`);
  }
}

export async function loadWardrobeItems(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<WardrobeRow>('SELECT * FROM wardrobe_items ORDER BY created_at DESC');
  return rows.map(wardrobeFromRow);
}

export async function saveWardrobeItem(db: SQLiteDatabase, item: WardrobeItem) {
  await db.runAsync(
    `INSERT INTO wardrobe_items (
      id, name, category, emoji, background, color_name, image_uri, subcategory,
      style_tags, season_tags, occasion_tags, favorite_score, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      emoji = excluded.emoji,
      background = excluded.background,
      color_name = excluded.color_name,
      image_uri = excluded.image_uri,
      subcategory = excluded.subcategory,
      style_tags = excluded.style_tags,
      season_tags = excluded.season_tags,
      occasion_tags = excluded.occasion_tags,
      favorite_score = excluded.favorite_score,
      updated_at = excluded.updated_at`,
    item.id,
    item.name,
    item.category,
    item.emoji,
    item.background,
    item.colorName,
    item.imageUri ?? null,
    item.subcategory,
    JSON.stringify(item.styleTags),
    JSON.stringify(item.seasonTags),
    JSON.stringify(item.occasionTags),
    item.favoriteScore,
    item.createdAt,
    item.updatedAt,
  );
}

export async function removeWardrobeItem(db: SQLiteDatabase, id: string) {
  await db.runAsync('DELETE FROM wardrobe_items WHERE id = ?', id);
}

export async function loadMatchChecks(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<MatchRow>('SELECT * FROM match_checks ORDER BY created_at DESC');
  return rows.map(matchFromRow);
}

export async function saveMatchCheck(db: SQLiteDatabase, check: MatchCheck) {
  await db.runAsync(
    `INSERT INTO match_checks (
      id, candidate_name, candidate_image_uri, candidate_category, candidate_emoji,
      candidate_background, liking, score, outfit_count, color_score, overlap_count,
      verdict, reasons, analysis_source, candidate_analysis, added_to_wardrobe, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    check.id,
    check.candidateName,
    check.candidateImageUri ?? null,
    check.candidateCategory,
    check.candidateEmoji,
    check.candidateBackground,
    check.liking,
    check.score,
    check.outfitCount,
    check.colorScore,
    check.overlapCount,
    check.verdict,
    JSON.stringify(check.reasons),
    check.analysisSource,
    check.candidateAnalysis ? JSON.stringify(check.candidateAnalysis) : null,
    check.addedToWardrobe ? 1 : 0,
    check.createdAt,
  );
}

export async function markMatchAdded(db: SQLiteDatabase, id: string) {
  await db.runAsync('UPDATE match_checks SET added_to_wardrobe = 1 WHERE id = ?', id);
}

export async function getSetting(db: SQLiteDatabase, key: string) {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM app_settings WHERE key = ?', key);
  return row?.value;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

export async function seedStarterWardrobe(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async () => {
    for (const item of starterWardrobe) {
      await saveWardrobeItem(db, item);
    }
  });
  await setSetting(db, 'onboarding_completed', 'true');
}
