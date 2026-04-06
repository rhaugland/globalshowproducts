export interface AdminVideo {
  id: string;
  title: string;
  youtubeId: string;
  thumbnail: string;
}

export interface AdminEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
}

const DEFAULT_VIDEOS: AdminVideo[] = [
  {id: 'v1', title: 'Slide-a-Bow-Maker - Carnation and Thistle Bow variations', youtubeId: '37yDhJENs4w', thumbnail: 'https://i4.ytimg.com/vi/37yDhJENs4w/hqdefault.jpg'},
  {id: 'v2', title: 'Slide-a-Bow-Maker - How to make a Pom Pom Bow', youtubeId: 'rCys7B0TFZE', thumbnail: 'https://i3.ytimg.com/vi/rCys7B0TFZE/hqdefault.jpg'},
  {id: 'v3', title: 'Magic Bow Maker - How to make a Confetti Bow', youtubeId: 'Mf_0NcW3Ri4', thumbnail: 'https://i2.ytimg.com/vi/Mf_0NcW3Ri4/hqdefault.jpg'},
  {id: 'v4', title: 'Slide-a-Bow-Maker - How to make a Sea Shell Bow', youtubeId: 'pPozMZOa-0E', thumbnail: 'https://i1.ytimg.com/vi/pPozMZOa-0E/hqdefault.jpg'},
  {id: 'v5', title: 'Slide-a-bow-maker - How to make a Caterpillar Bow', youtubeId: 'KQcP3Of3Rfk', thumbnail: 'https://i4.ytimg.com/vi/KQcP3Of3Rfk/hqdefault.jpg'},
  {id: 'v6', title: 'Ribbon Magic Original Bow Maker - Poinsettia or Daisy Bow', youtubeId: 'iZttSknnKpU', thumbnail: 'https://i2.ytimg.com/vi/iZttSknnKpU/hqdefault.jpg'},
  {id: 'v7', title: 'SHREDDING - How to make a Ribbon Flower', youtubeId: 'uryyVcVB_6k', thumbnail: 'https://i2.ytimg.com/vi/uryyVcVB_6k/hqdefault.jpg'},
  {id: 'v8', title: 'Ribbon Magic Original Bow Maker - Ribbon Rose', youtubeId: 'SHADV_pTqY8', thumbnail: 'https://i4.ytimg.com/vi/SHADV_pTqY8/hqdefault.jpg'},
  {id: 'v9', title: 'Bow Dabra - Scrunch Bow', youtubeId: '7Q-H-WfMb2c', thumbnail: 'https://i4.ytimg.com/vi/7Q-H-WfMb2c/hqdefault.jpg'},
  {id: 'v10', title: 'Bow Dabra - How to make a party favor', youtubeId: '2_0Hc_8d7B4', thumbnail: 'https://i3.ytimg.com/vi/2_0Hc_8d7B4/hqdefault.jpg'},
  {id: 'v11', title: 'BOW DABRA BOW MAKER - Wire Ribbon Bow', youtubeId: 'BkSpJfbiXWE', thumbnail: 'https://i3.ytimg.com/vi/BkSpJfbiXWE/hqdefault.jpg'},
  {id: 'v12', title: 'RIBBON MAGIC BOW MAKER - Single Bow', youtubeId: 'htHzSqrlVuI', thumbnail: 'https://i1.ytimg.com/vi/htHzSqrlVuI/hqdefault.jpg'},
  {id: 'v13', title: 'SHREDDING - Shred, Curl and Rippling Bow', youtubeId: 'Nzh_l8e5wdQ', thumbnail: 'https://i3.ytimg.com/vi/Nzh_l8e5wdQ/hqdefault.jpg'},
  {id: 'v14', title: 'SHREDDING - Starburst Peg', youtubeId: 'V1YZgVZh-Vk', thumbnail: 'https://i3.ytimg.com/vi/V1YZgVZh-Vk/hqdefault.jpg'},
  {id: 'v15', title: 'SHREDDING - Ritzy Roll', youtubeId: 'rViR98PAFXE', thumbnail: 'https://i3.ytimg.com/vi/rViR98PAFXE/hqdefault.jpg'},
];

const DEFAULT_EVENTS: AdminEvent[] = [
  {
    id: 'e1',
    name: 'ASD Market Week',
    date: 'June 22–25, 2026',
    location: 'Las Vegas Convention Center, Las Vegas, NV',
    description: 'The largest consumer merchandise trade show in the US. Visit us at our booth to see the latest scooters, toys, and home products.',
  },
  {
    id: 'e2',
    name: 'NY NOW Summer Market',
    date: 'August 9–12, 2026',
    location: 'Javits Center, New York, NY',
    description: 'Discover our newest product lines and meet the team at one of the premier wholesale gift and home shows on the East Coast.',
  },
  {
    id: 'e3',
    name: 'Minneapolis Gift Show',
    date: 'September 18–19, 2026',
    location: 'Minneapolis Convention Center, Minneapolis, MN',
    description: 'A regional favorite — stop by to explore our full catalog and take advantage of show-exclusive pricing.',
  },
  {
    id: 'e4',
    name: 'Holiday Buying Market',
    date: 'October 14–16, 2026',
    location: 'Dallas Market Center, Dallas, TX',
    description: "Get ahead on holiday inventory. We'll be showcasing our best-selling gift items and seasonal specials.",
  },
];

const STORAGE_KEYS = {
  videos: 'gsp_admin_videos',
  events: 'gsp_admin_events',
};

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getVideos(): AdminVideo[] {
  if (!isBrowser()) return DEFAULT_VIDEOS;
  const stored = localStorage.getItem(STORAGE_KEYS.videos);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_VIDEOS;
    }
  }
  return DEFAULT_VIDEOS;
}

export function saveVideos(videos: AdminVideo[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.videos, JSON.stringify(videos));
}

export function getEvents(): AdminEvent[] {
  if (!isBrowser()) return DEFAULT_EVENTS;
  const stored = localStorage.getItem(STORAGE_KEYS.events);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_EVENTS;
    }
  }
  return DEFAULT_EVENTS;
}

export function saveEvents(events: AdminEvent[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
}

export function adminLogin(username: string, password: string): boolean {
  return username === 'globalshowproducts' && password === 'password1723';
}

export function isAdminLoggedIn(): boolean {
  if (!isBrowser()) return false;
  return sessionStorage.getItem('gsp_admin') === '1';
}

export function setAdminLoggedIn(v: boolean) {
  if (!isBrowser()) return;
  if (v) sessionStorage.setItem('gsp_admin', '1');
  else sessionStorage.removeItem('gsp_admin');
}
