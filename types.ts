
export enum AppScreen {
  LANDING = 'LANDING',
  QUESTION = 'QUESTION',
  PUZZLE = 'PUZZLE',
  REVEAL = 'REVEAL',
  FOLLOW_GATE = 'FOLLOW_GATE',
  AUTO_DM = 'AUTO_DM',
  SHARE = 'SHARE',
  FINAL = 'FINAL'
}

export interface PuzzlePiece {
  id: number;
  currentIndex: number;
  correctIndex: number;
  imageUrl: string;
}
