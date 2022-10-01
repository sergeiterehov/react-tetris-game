import { useEffect, useState } from "react";
import { Group, Layer, Path, Rect, Stage, Text } from "react-konva";
import MusicPlayer from "./music/MusicPlayer";
import sounds from "./sounds";
import { FigurePixel, Tetris, TetrisFigure } from "./Tetris";
import theme, { pallettes } from "./theme";
import katyusha from "./music/katyusha.json";

const pixelSize = 20;
const padding = 2;
const fieldX = 220;
const fieldY = 70;

const Pixel: React.FC<{
  type: FigurePixel;
  x: number;
  y: number;
  level: number;
}> = ({ type, x, y, level }) => {
  if (type === FigurePixel.Empty) return null;

  const colorList = pallettes[level % pallettes.length];

  return (
    <Group x={x} y={y}>
      <Rect
        width={pixelSize - padding * 2}
        height={pixelSize - padding * 2}
        x={padding}
        y={padding}
        fill={colorList[(type - 1) % colorList.length]}
      />
      {type === FigurePixel.C ? (
        <Rect
          fill="rgb(255,255,255)"
          width={pixelSize - padding * 4}
          height={pixelSize - padding * 4}
          x={padding * 2}
          y={padding * 2}
        />
      ) : null}
      {type === FigurePixel.A || type === FigurePixel.B ? (
        <Path
          stroke="rgb(255,255,255)"
          data={`M${padding * 4},0L0,0L0,${padding * 4}`}
          strokeWidth={padding}
          x={padding * 2}
          y={padding * 2}
        />
      ) : null}
    </Group>
  );
};

export const TetrisGame: React.FC = () => {
  const [, setFrame] = useState(0);

  const [game] = useState(() => new Tetris());
  const [music] = useState(() => new MusicPlayer());

  // Start game
  useEffect(() => {
    music.volume = 0.03;
    music.load(katyusha as any);

    game.onFrame = () => setFrame((prev) => prev + 1);

    game.onDrop = sounds.drop;
    game.onTetris = sounds.tetris;
    game.onClear = sounds.clear;
    game.onLevelUp = sounds.levelUp;
    game.onFinal = () => {
      music.stop();
      sounds.final();
    };
    game.onMove = sounds.move;
    game.onRotate = sounds.rotate;

    const pressedKeys: Record<string, boolean> = {};

    const keyDownHandler = (e: KeyboardEvent) => {
      if (pressedKeys[e.key]) return;

      pressedKeys[e.key] = true;

      if (e.key === "ArrowLeft") {
        game.move(-1);
      } else if (e.key === "ArrowRight") {
        game.move(1);
      } else if (e.key === "ArrowUp") {
        game.rotate();
      } else if (e.key === "ArrowDown") {
        game.setSoftDrop(true);
      } else if (e.key === "Enter") {
        if (!game.getInProgress()) {
          game.run();
          music.play(true);
        }
      }
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      if (!pressedKeys[e.key]) return;

      pressedKeys[e.key] = false;

      if (e.key === "ArrowDown") {
        game.setSoftDrop(false);
      }
    };

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);

      game.destroy();

      music.stop();
    };
  }, [game, music]);

  const field = game.getField();
  const level = game.getLevel();
  const stat = game.getStatistics();
  const inProgress = game.getInProgress();
  const fieldWidth = pixelSize * game.getWidth();
  const fieldHeight = pixelSize * game.getHeight();
  const rightX = fieldX + fieldWidth + 12;

  const borderColorInProgress = inProgress ? theme.success : theme.danger;

  music.speed = game.getHeight() - game.getCurrentHeight() <= 10 ? 1.4 : 1;

  return (
    <Stage width={640} height={480}>
      <Layer>
        <Rect width={640} height={480} fill={theme.background} />
        <Group y={40} x={60}>
          <Rect strokeWidth={2} height={34} width={110} stroke={theme.border} />
          <Text
            fontFamily="monospace"
            fontSize={26}
            y={4}
            fontStyle="bolder"
            align="center"
            text="A-TYPE"
            width={110}
            fill={theme.textSecond}
          />
        </Group>
        <Group y={100} x={25}>
          <Rect
            strokeWidth={2}
            height={320}
            width={180}
            stroke={theme.border}
          />
          <Text
            fontFamily="monospace"
            fontSize={26}
            y={4}
            fontStyle="bolder"
            align="center"
            text="STATISTICS"
            width={180}
            fill={theme.textSecond}
          />
          <Group x={40} y={32}>
            <Text
              fontFamily="monospace"
              fontSize={26}
              fontStyle="bolder"
              align="left"
              lineHeight={1.5}
              fill={theme.textThird}
              text={[
                `T  ${stat[TetrisFigure.T]}`,
                `S  ${stat[TetrisFigure.S]}`,
                `Z  ${stat[TetrisFigure.Z]}`,
                `L  ${stat[TetrisFigure.L]}`,
                `J  ${stat[TetrisFigure.J]}`,
                `I  ${stat[TetrisFigure.I]}`,
                `O  ${stat[TetrisFigure.O]}`,
              ].join("\n")}
            />
          </Group>
        </Group>
        <Group y={20} x={rightX}>
          <Rect strokeWidth={2} height={64} width={150} stroke={theme.border} />
          <Text
            fontFamily="monospace"
            fontSize={26}
            y={4}
            x={10}
            fontStyle="bolder"
            align="left"
            width={150}
            fill={theme.text}
            text={`SCORE\n${game.getScore()}`}
          />
        </Group>
        <Group y={20} x={fieldX}>
          <Rect
            strokeWidth={2}
            height={34}
            stroke={theme.border}
            width={fieldWidth}
          />
          <Text
            fontFamily="monospace"
            fontSize={26}
            y={4}
            fontStyle="bolder"
            align="center"
            fill={theme.text}
            width={fieldWidth}
            text={`LINES-${game.getLines()}`}
          />
        </Group>
        <Group y={340} x={rightX}>
          <Rect strokeWidth={2} height={64} width={100} stroke={theme.border} />
          <Text
            fontFamily="monospace"
            fontSize={26}
            y={4}
            x={10}
            fontStyle="bolder"
            align="left"
            width={100}
            fill={theme.text}
            text={`LEVEL\n${level}`}
          />
        </Group>
        <Group y={200} x={rightX}>
          <Rect
            strokeWidth={4}
            height={120}
            width={100}
            stroke={borderColorInProgress}
          />
          <Text
            fontFamily="monospace"
            fontSize={26}
            y={4}
            fontStyle="bolder"
            align="center"
            width={100}
            text="NEXT"
            fill={theme.textSecond}
          />
          <Group x={10} y={32}>
            {game.getNextFigure().flatMap((row, y) =>
              row.map((pixel, x) => {
                return (
                  <Pixel
                    key={`${x};${y}`}
                    type={pixel}
                    level={level}
                    x={x * pixelSize}
                    y={y * pixelSize}
                  />
                );
              })
            )}
          </Group>
        </Group>
        <Group x={fieldX} y={fieldY}>
          <Rect
            strokeWidth={4}
            x={-4}
            y={-4}
            width={fieldWidth + 8}
            height={fieldHeight + 8}
            stroke={borderColorInProgress}
          />
          {field.flatMap((row, y) =>
            row.map((pixel, x) => {
              return (
                <Pixel
                  key={`${x};${y}`}
                  type={pixel}
                  level={level}
                  x={x * pixelSize}
                  y={y * pixelSize}
                />
              );
            })
          )}
          {inProgress ? null : (
            <Group x={-4} y={(fieldHeight - 34) / 2}>
              <Rect height={34} fill={theme.danger} width={fieldWidth + 8} />
              <Text
                fontFamily="monospace"
                fontSize={26}
                y={4}
                fontStyle="bolder"
                align="center"
                fill="rgb(255, 255, 255)"
                width={fieldWidth + 8}
                text="PRESS ENTER"
              />
            </Group>
          )}
        </Group>
      </Layer>
    </Stage>
  );
};
