export type Match = {
  date: string;
  id: string;
  score: {
    [team: string]: number;
  };
  players: {
    [team: string]: string[];
  };
};

export type MatchData = {
  matches: Match[];
};
