export enum TetrisFigure {
  O,
  S,
  Z,
  I,
  T,
  L,
  J,
}

export enum FigurePixel {
  Empty = 0,
  A,
  B,
  C,
}

function fill(pixel: FigurePixel) {
  return (x: number) => (x ? pixel : FigurePixel.Empty);
}

export class Tetris {
  private static figures: Record<TetrisFigure, number[]> = {
    [TetrisFigure.O]: [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0].map(
      fill(FigurePixel.C)
    ),
    [TetrisFigure.S]: [0, 0, 0, 0, 1, 1, 1, 1, 0].map(fill(FigurePixel.A)),
    [TetrisFigure.Z]: [0, 0, 0, 1, 1, 0, 0, 1, 1].map(fill(FigurePixel.B)),
    [TetrisFigure.I]: [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0].map(
      fill(FigurePixel.C)
    ),
    [TetrisFigure.T]: [0, 0, 0, 1, 1, 1, 0, 1, 0].map(fill(FigurePixel.C)),
    [TetrisFigure.L]: [0, 1, 0, 0, 1, 0, 0, 1, 1].map(fill(FigurePixel.B)),
    [TetrisFigure.J]: [0, 1, 0, 0, 1, 0, 1, 1, 0].map(fill(FigurePixel.A)),
  };

  // eslint-disable-next-line max-len
  private static framePerRowByLevel: number[] = [
    48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 1,
  ];

  private readonly fps = 50;
  private readonly width = 10;
  private readonly height = 20;
  private readonly field: number[] = new Array(this.width * this.height).fill(
    0
  );
  private readonly clock = setInterval(this.frame.bind(this), 1000 / this.fps);

  private inProgress = false;
  private frameCounter = 1;
  private softDrop = false;

  private prev: TetrisFigure | undefined;
  private next = TetrisFigure.T;
  private figure: number[] = Tetris.figures[TetrisFigure.T];
  private figureX = 0;
  private figureY = 0;

  private level = 0;
  private lines = 0;
  private score = 0;
  private softDropRows = 0;

  private statistics: Record<TetrisFigure, number> = {
    [TetrisFigure.O]: 0,
    [TetrisFigure.S]: 0,
    [TetrisFigure.Z]: 0,
    [TetrisFigure.I]: 0,
    [TetrisFigure.T]: 0,
    [TetrisFigure.L]: 0,
    [TetrisFigure.J]: 0,
  };

  public onFrame?: () => void;
  public onDrop?: () => void;
  public onTetris?: () => void;
  public onClear?: () => void;
  public onLevelUp?: () => void;
  public onFinal?: () => void;
  public onMove?: () => void;
  public onRotate?: () => void;

  public run() {
    this.field.fill(0);

    this.nextFigure();
    this.nextFigure();

    this.frameCounter = 1;
    this.softDrop = false;
    this.level = 0;
    this.lines = 0;
    this.score = 0;
    this.softDropRows = 0;

    this.statistics[TetrisFigure.T] = 0;
    this.statistics[TetrisFigure.L] = 0;
    this.statistics[TetrisFigure.J] = 0;
    this.statistics[TetrisFigure.S] = 0;
    this.statistics[TetrisFigure.Z] = 0;
    this.statistics[TetrisFigure.I] = 0;
    this.statistics[TetrisFigure.O] = 0;

    this.inProgress = true;
  }

  public stop() {
    this.inProgress = false;
  }

  public destroy() {
    clearInterval(this.clock);
  }

  public getInProgress() {
    return this.inProgress;
  }

  public setSoftDrop(value: boolean) {
    this.softDrop = value;
  }

  public getLevel() {
    return this.level;
  }

  public getLines() {
    return this.lines;
  }

  public getScore() {
    return this.score;
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public getNext() {
    return this.next;
  }

  public getStatistics() {
    return { ...this.statistics };
  }

  public getNextFigure() {
    const figure = Tetris.figures[this.next];
    const size = figure.length === 16 ? 4 : 3;
    const grid: number[][] = [];

    for (let y = 0; y < size; y += 1) {
      const row: number[] = [];

      for (let x = 0; x < size; x += 1) {
        row.push(figure[y * size + x]);
      }

      grid.push(row);
    }

    return grid;
  }

  public getField() {
    const grid: number[][] = [];

    for (let y = 0; y < this.height; y += 1) {
      const row: number[] = [];

      for (let x = 0; x < this.width; x += 1) {
        row.push(this.field[y * this.width + x]);
      }

      grid.push(row);
    }

    const size = this.figure.length === 16 ? 4 : 3;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const pixel = this.figure[y * size + x];

        if (pixel) {
          grid[this.figureY + y][this.figureX + x] = pixel;
        }
      }
    }

    return grid;
  }

  public move(dx: number) {
    if (!this.inProgress) return;

    const prevFigureX = this.figureX;

    this.figureX += dx;

    if (this.checkSideCollision()) {
      this.figureX = prevFigureX;
    } else {
      this.onMove?.();
    }
  }

  public rotate() {
    if (!this.inProgress) return;

    const size = this.figure.length === 16 ? 4 : 3;
    const prev = this.figure;
    const next = this.figure.slice();

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        next[(size - x - 1) * size + y] = this.figure[y * size + x];
      }
    }

    this.figure = next;

    if (this.checkSideCollision()) {
      this.figure = prev;
    } else {
      this.onRotate?.();
    }
  }

  private frame() {
    if (!this.inProgress) return;

    this.frameCounter -= this.softDrop ? this.frameCounter : 1;

    if (this.frameCounter <= 0) {
      this.tick();
    }

    this.onFrame?.();
  }

  private tick() {
    const fell = this.checkGroundCollision();

    if (!fell) {
      this.figureY += 1;

      if (this.softDrop) {
        this.softDropRows += 1;
      }
    } else {
      this.fixFigure();

      const final = this.figureY === 0;

      if (final) {
        this.stop();

        this.onFinal?.();
      } else {
        this.clearLines();
        this.nextFigure();

        this.onDrop?.();
      }

      this.softDrop = false;
    }

    // Level

    const prevLevel = this.level;

    this.level = Math.floor(this.lines / 10);

    if (this.level !== prevLevel) {
      this.onLevelUp?.();
    }

    // Speed

    let framePerRow = Tetris.framePerRowByLevel[this.level] || 1;

    if (this.level < 0) {
      framePerRow = Tetris.framePerRowByLevel[0];
    } else if (this.level >= Tetris.framePerRowByLevel.length) {
      framePerRow =
        Tetris.framePerRowByLevel[Tetris.framePerRowByLevel.length - 1];
    }

    this.frameCounter = framePerRow;
  }

  private nextFigure() {
    this.figure = Tetris.figures[this.next];

    const size = this.figure.length === 16 ? 4 : 3;

    this.figureX = Math.round(this.width / 2 - size / 2);
    this.figureY = 0;

    this.statistics[this.next] += 1;

    this.prev = this.next;
    this.next = Math.round(Math.random() * 6);

    if (this.next === this.prev) {
      this.next = Math.round(Math.random() * 6);
    }
  }

  private checkGroundCollision() {
    const size = this.figure.length === 16 ? 4 : 3;

    for (let y = size - 1; y >= 0; y -= 1) {
      for (let x = 0; x < size; x += 1) {
        if (
          this.figure[y * size + x] &&
          (this.figureY + y + 1 === this.height ||
            this.field[(this.figureY + y + 1) * this.width + this.figureX + x])
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private checkSideCollision() {
    const size = this.figure.length === 16 ? 4 : 3;

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (
          this.figure[y * size + x] &&
          (this.figureX + x < 0 ||
            this.figureX + x >= this.width ||
            this.field[(this.figureY + y) * this.width + this.figureX + x])
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private fixFigure() {
    const size = this.figure.length === 16 ? 4 : 3;

    for (let y = size - 1; y >= 0; y -= 1) {
      for (let x = 0; x < size; x += 1) {
        const pixel = this.figure[y * size + x];

        if (pixel) {
          this.field[(this.figureY + y) * this.width + this.figureX + x] =
            pixel;
        }
      }
    }
  }

  private clearLines() {
    let lines = 0;

    for (let y = 0; y < this.height; y += 1) {
      let filled = true;

      for (let x = 0; x < this.width; x += 1) {
        if (!this.field[y * this.width + x]) {
          filled = false;

          break;
        }
      }

      if (!filled) continue;

      for (let l = y; l > 0; l -= 1) {
        for (let x = 0; x < this.width; x += 1) {
          this.field[l * this.width + x] = this.field[(l - 1) * this.width + x];
        }
      }

      for (let x = 0; x < this.width; x += 1) {
        this.field[x] = 0;
      }

      lines += 1;
    }

    this.score += this.softDropRows;

    if (lines === 0) {
      // nop
    } else if (lines === 1) {
      this.score += 40 * (this.level + 1);
      this.onClear?.();
    } else if (lines === 2) {
      this.score += 100 * (this.level + 1);
      this.onClear?.();
    } else if (lines === 3) {
      this.score += 300 * (this.level + 1);
      this.onClear?.();
    } else if (lines >= 4) {
      this.score += 1200 * (this.level + 1);
      this.onTetris?.();
    }

    this.lines += lines;
    this.softDropRows = 0;
  }
}
