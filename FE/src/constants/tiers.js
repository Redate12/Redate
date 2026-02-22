export const TIERS = {
  FREE: 'free',
  PLUS: 'plus',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

export const TIER_LIMITS = {
  [TIERS.FREE]: {
    dailySwipes: 10,
    dailySuperLikes: 1,
    dailyUndo: 1,
    maxDistance: 50,
  },
  [TIERS.PLUS]: {
    dailySwipes: Infinity,
    dailySuperLikes: 5,
    dailyUndo: Infinity,
    maxDistance: 150,
    seeWhoLiked: true,
    undoSwipe: true,
  },
  [TIERS.GOLD]: {
    dailySwipes: Infinity,
    dailySuperLikes: 10,
    dailyUndo: Infinity,
    maxDistance: Infinity,
    seeWhoLiked: true,
    undoSwipe: true,
    passport: true,
    readMessagesBeforeMatch: true,
  },
  [TIERS.PLATINUM]: {
    dailySwipes: Infinity,
    dailySuperLikes: Infinity,
    dailyUndo: Infinity,
    maxDistance: Infinity,
    seeWhoLiked: true,
    undoSwipe: true,
    passport: true,
    readMessagesBeforeMatch: true,
    messageFirst: 3,
  },
};