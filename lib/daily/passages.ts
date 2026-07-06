/** Curated passages — indexed by day-of-year so the drop is stable all day. */
export const DAILY_PASSAGES = [
  "John 3:16",
  "Psalm 23",
  "Philippians 4:6-7",
  "Romans 8:28",
  "Jeremiah 29:11",
  "Proverbs 3:5-6",
  "Isaiah 41:10",
  "Matthew 11:28-30",
  "Psalm 46:10",
  "Joshua 1:9",
  "Romans 12:2",
  "2 Timothy 1:7",
  "Psalm 27:1",
  "Hebrews 11:1",
  "Galatians 5:22-23",
  "Ephesians 2:8-9",
  "1 Corinthians 13:4-7",
  "Psalm 119:105",
  "Micah 6:8",
  "Matthew 5:14-16",
  "John 14:27",
  "Psalm 34:18",
  "Romans 15:13",
  "Colossians 3:23",
  "James 1:5",
  "Psalm 37:4",
  "Isaiah 40:31",
  "Matthew 6:33",
  "Lamentations 3:22-23",
  "Psalm 139:14",
  "1 Peter 5:7",
  "John 16:33",
  "Psalm 91:1-2",
  "Romans 5:8",
  "Philippians 4:13",
  "Psalm 16:11",
  "Hebrews 13:5",
  "Matthew 28:20",
  "Psalm 55:22",
  "Galatians 2:20",
  "Psalm 103:12",
  "John 1:12",
  "Romans 8:38-39",
  "Psalm 121:1-2",
  "Ephesians 3:20",
  "Isaiah 43:2",
  "Matthew 5:9",
  "Psalm 23:4",
  "2 Corinthians 5:17",
  "John 15:5",
  "Psalm 18:2",
  "Romans 8:1",
  "Proverbs 16:3",
  "Psalm 62:1-2",
  "Hebrews 12:1-2",
  "Matthew 7:7",
  "Psalm 42:11",
  "1 John 4:19",
  "Psalm 100:4-5",
  "Romans 12:12",
] as const;

export function passageForDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return DAILY_PASSAGES[dayOfYear % DAILY_PASSAGES.length];
}

export const DEFAULT_REFLECTION =
  "Take a quiet moment with this verse. Let it settle before you rush into the day.";

export const DEFAULT_QUESTION =
  "What word or phrase from this passage stays with you today?";
