// types.ts
export type AppStep = 'setup' | 'voting' | 'results';

export interface Option {
  id: string;
  name: string;
}

export interface VoteData {
  [optionIndex: number]: number;
}

export interface VoteResults {
  [contestantName: string]: number;
}