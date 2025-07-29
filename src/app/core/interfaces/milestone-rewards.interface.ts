export interface IMilestoneReward {
  id: number;
  userId: number;
  businessId: number;
  milestoneType: 'points_10' | 'points_50' | 'points_100';
  rewardCode: string;
  isUsed: boolean;
  usedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMilestoneRewardResponse {
  id: number;
  userId: number;
  businessId: number;
  businessName: string;
  businessLogo?: string;
  milestoneType: string;
  rewardCode: string;
  isUsed: boolean;
  usedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  availableRewards?: IAvailableReward[];
}

export interface IAvailableReward {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  imageUrl?: string;
  rewardType: string;
  isActive: boolean;
}

export interface IClaimMilestoneReward {
  rewardCode: string;
  selectedRewardId: number;
}

export interface IMilestoneRewardClaim {
  milestoneRewardId: number;
  selectedRewardId: number;
  claimedAt: Date;
  redemptionCode: string;
}

export interface IUserMilestoneRewards {
  availableRewards: IMilestoneRewardResponse[];
  usedRewards: IMilestoneRewardResponse[];
  totalMilestones: number;
}

export interface MilestoneRewardsApiResponse {
  success: boolean;
  data: IUserMilestoneRewards;
}
