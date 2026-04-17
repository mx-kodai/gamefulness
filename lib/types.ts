export type AgeBand = "~19" | "20s" | "30s" | "40s" | "50s" | "60s" | "70s" | "80+";

export const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: "~19", label: "19才まで" },
  { value: "20s", label: "20代" },
  { value: "30s", label: "30代" },
  { value: "40s", label: "40代" },
  { value: "50s", label: "50代" },
  { value: "60s", label: "60代" },
  { value: "70s", label: "70代" },
  { value: "80+", label: "80才以上" },
];

export type FacilityType =
  | "デイサービス"
  | "特別養護老人ホーム"
  | "有料老人ホーム"
  | "サ高住"
  | "放課後デイ"
  | "児童発達支援"
  | "リハ病院"
  | "個人"
  | "その他";

export const FACILITY_TYPES: FacilityType[] = [
  "デイサービス",
  "特別養護老人ホーム",
  "有料老人ホーム",
  "サ高住",
  "放課後デイ",
  "児童発達支援",
  "リハ病院",
  "個人",
  "その他",
];

export type User = {
  id: string;
  nickname: string;
  ageBand: AgeBand;
  facilityId: string | null;
  createdAt: number;
  isSeed?: boolean;
};

export type Facility = {
  id: string;
  name: string;
  type: FacilityType;
  location: string;
  createdAt: number;
  isSeed?: boolean;
};

export type ScoreEntry = {
  id: string;
  userId: string;
  gameSlug: string;
  level: number;
  score: number;
  playedAt: number;
};
