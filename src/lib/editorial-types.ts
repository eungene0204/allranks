export type EditorialReference = { title: string; url: string };
export type EditorialProfile = {
  id: string;
  question: string;
  interpretation: string;
  decision: string;
  limitation: string;
  references?: EditorialReference[];
};
export type RankingArticle = {
  title: string;
  lead: string;
  profile: string;
  sections: { title: string; paragraphs: string[] }[];
  references: EditorialReference[];
  definitionExcerpt?: { text: string; url: string; retrievedAt: string };
  sourceAccess?: { checkedAt: string; status?: number; error?: string };
};
