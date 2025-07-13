export class AllGamesStatisticQueryRepoType {
  sumScore: number;
  gamesCount: number;
  avgScores: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  playerId: string;
  playerLogin: string;
}

export class AllGamesStatisticViewDtoTypeorm {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: {
    id: string;
    login: string;
  };

  static mapToView(
    stat: AllGamesStatisticQueryRepoType,
  ): AllGamesStatisticViewDtoTypeorm {
    const viewStat = new AllGamesStatisticViewDtoTypeorm();

    const avgScore = Number(stat.avgScores).toFixed(2);

    viewStat.sumScore = Number(stat.sumScore) || 0;
    viewStat.gamesCount = Number(stat.gamesCount) || 0;
    viewStat.avgScores = parseFloat(avgScore) || 0;
    viewStat.winsCount = Number(stat.winsCount) || 0;
    viewStat.lossesCount = Number(stat.lossesCount) || 0;
    viewStat.drawsCount = Number(stat.drawsCount) || 0;
    viewStat.player = {
      id: stat.playerId,
      login: stat.playerLogin,
    };

    return viewStat;
  }
}
