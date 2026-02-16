export type ContributionWindow = {
  id: number;
  name: string;
  start_at: string;
  end_at: string;
  min_amount: string;
  max_amount: string | null;
  created_at: string;
};

export type CreateContributionWindowInput = {
  name: string;
  start_at: string;
  end_at: string;
  min_amount: number;
};

export type PaginatedContributionWindows = {
  results: ContributionWindow[];
  count: number;
  next: string | null;
  previous: string | null;
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};
