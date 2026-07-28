/**
 * Fixed UUIDs for seed data. All seed records use these IDs so you can
 * delete everything with `npm run unseed` or the SQL in scripts/unseed.sql.
 */
export const SEED = {
  anonToken: "00000000-0000-4000-8000-000000000001",
  anonToken2: "00000000-0000-4000-8000-000000000002",

  posts: {
    faith: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01",
    prayer: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02",
  },
  replies: {
    faith1: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11",
    faith2: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa12",
  },
  prayers: {
    public: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb01",
    private: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb02",
  },
  dailyDrop: "dddddddd-dddd-4ddd-8ddd-dddddddddd01",
  moments: {
    one: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01",
    two: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02",
  },
  honest: {
    one: "ffffffff-ffff-4fff-8fff-ffffffffff01",
    two: "ffffffff-ffff-4fff-8fff-ffffffffff02",
  },
} as const;

export const SEED_DAILY_DATE = "2099-01-01";
