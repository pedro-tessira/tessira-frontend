// Utility functions for sharing views

export interface SharedViewData {
  id: string;
  teamId: string;
  createdAt: string;
}

const SHARE_STORAGE_KEY = 'team-horizon-shares';

// Generate a random share ID
export const generateShareId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Save share data to localStorage
export const saveShare = (shareData: SharedViewData): void => {
  const shares = getShares();
  shares[shareData.id] = shareData;
  localStorage.setItem(SHARE_STORAGE_KEY, JSON.stringify(shares));
};

// Get all shares
export const getShares = (): Record<string, SharedViewData> => {
  try {
    const data = localStorage.getItem(SHARE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

// Get a specific share by ID
export const getShareById = (shareId: string): SharedViewData | null => {
  const shares = getShares();
  return shares[shareId] || null;
};

// Generate the full share URL
export const getShareUrl = (shareId: string): string => {
  return `${window.location.origin}/share/${shareId}`;
};
