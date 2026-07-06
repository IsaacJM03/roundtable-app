import { passageForDate } from "./passages";

export type FetchedVerse = {
  verse_ref: string;
  verse_text: string;
  passage: string;
};

/** Free, no API key — World English Bible (public domain). https://bible-api.com */
export async function fetchVerseForDate(dateStr: string): Promise<FetchedVerse> {
  const passage = passageForDate(dateStr);
  const url = `https://bible-api.com/${encodeURIComponent(passage)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`bible-api.com failed: ${res.status}`);

  const data = (await res.json()) as { reference?: string; text?: string };
  const text = data.text?.replace(/\s+/g, " ").trim();
  if (!data.reference || !text) throw new Error("Invalid verse response");

  return {
    verse_ref: data.reference,
    verse_text: text.slice(0, 500),
    passage,
  };
}
