export interface BrandCampaignItem {
  id: string;
  src: string;
  title: string;
  caption: string;
}

// public/brands/ 폴더에 번호를 붙여 파일을 넣고 아래 목록을 갱신(또는 npm run sync-brands)하면 추후 교체/추가도 반영됩니다.
export const BRAND_CAMPAIGN_ITEMS: BrandCampaignItem[] = [
  {
    id: "01",
    src: "/brands/01_blackfiday.jpg",
    title: "01 · BLACKFIDAY",
    caption: "Swipe left or right to browse campaign visuals"
  },
  {
    id: "02",
    src: "/brands/02_earthdrop.jpg",
    title: "02 · EARTHDROP",
    caption: "Swipe left or right to browse campaign visuals"
  },
  {
    id: "03",
    src: "/brands/03_timesale.jpg",
    title: "03 · TIMESALE",
    caption: "Swipe left or right to browse campaign visuals"
  }
];
