export class GamesStatisticQueryRepoType {
  sumScore: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
}

export class GamesStatisticViewDtoTypeorm {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;

  static mapToView(
    stat: GamesStatisticQueryRepoType,
  ): GamesStatisticViewDtoTypeorm {
    const viewStat = new GamesStatisticViewDtoTypeorm();

    const avgScore = (stat.sumScore / stat.gamesCount).toFixed(2);

    viewStat.sumScore = Number(stat.sumScore);
    viewStat.gamesCount = Number(stat.gamesCount);
    viewStat.avgScores = parseFloat(avgScore);
    viewStat.winsCount = Number(stat.winsCount);
    viewStat.lossesCount = Number(stat.lossesCount);
    viewStat.drawsCount = Number(stat.drawsCount);

    return viewStat;
  }
}
