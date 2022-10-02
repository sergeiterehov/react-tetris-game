import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Group, Layer, Path, Rect, Stage, Text } from "react-konva";
import MusicPlayer from "./music/MusicPlayer";
import sounds from "./sounds";
import { FigurePixel, Tetris } from "./Tetris";
import theme, { pallettes } from "./theme";
import katyusha from "./music/katyusha.json";

const pixelSize = 20;
const padding = 2;
const fieldX = 20;
const fieldY = 20;
const fieldStrokeWidth = 4;
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const rightWidth = 150;

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

  const [maxScore, setMaxScore] = useState(() =>
    Number(localStorage.getItem("max-score") || 0)
  );

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
      const score = game.getScore();

      setMaxScore((prev) => Math.max(score, prev));

      music.stop();
      sounds.final();
    };
    game.onMove = sounds.move;
    game.onRotate = sounds.rotate;

    return () => {
      game.destroy();
      music.stop();
    };
  }, [game, music]);

  // Save max score when change
  useEffect(() => {
    localStorage.setItem("max-score", String(maxScore));
  }, [maxScore]);

  const pressLeftHandler = useCallback(() => {
    game.move(-1);
  }, [game]);

  const pressRightHandler = useCallback(() => {
    game.move(1);
  }, [game]);

  const pressRotateHandler = useCallback(() => {
    if (game.getInProgress()) {
      game.rotate();
    } else {
      game.run();
      music.play(true);
    }
  }, [game, music]);

  const pressDownHandler = useCallback(() => {
    game.setSoftDrop(true);
  }, [game]);

  const releaseDownHandler = useCallback(() => {
    game.setSoftDrop(false);
  }, [game]);

  const field = game.getField();
  const level = game.getLevel();
  const inProgress = game.getInProgress();
  const fieldWidth = pixelSize * game.getWidth();
  const fieldHeight = pixelSize * game.getHeight();
  const rightX = fieldX + fieldWidth + 20;

  const borderColorInProgress = inProgress ? theme.success : theme.danger;

  music.speed = game.getHeight() - game.getCurrentHeight() <= 10 ? 1.4 : 1;

  return (
    <Stage width={screenWidth} height={screenHeight}>
      <Layer>
        <Rect
          width={screenWidth}
          height={screenHeight}
          fill={theme.background}
        />
        <Group x={fieldX} y={fieldY}>
          <Rect
            strokeWidth={fieldStrokeWidth}
            x={-fieldStrokeWidth}
            y={-fieldStrokeWidth}
            width={fieldWidth + fieldStrokeWidth * 2}
            height={fieldHeight + fieldStrokeWidth * 2}
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
                text="ROTATE"
              />
            </Group>
          )}
        </Group>
        <Group y={fieldY} x={rightX + fieldStrokeWidth * 1.5}>
          <Rect
            strokeWidth={fieldStrokeWidth}
            x={-fieldStrokeWidth}
            y={-fieldStrokeWidth}
            height={120 + fieldStrokeWidth * 2}
            width={100 + fieldStrokeWidth * 2}
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
        <Group x={rightX} y={fieldY + 140}>
          <Group y={0}>
            <Rect
              strokeWidth={2}
              height={120}
              width={rightWidth}
              stroke={theme.border}
            />
            <Text
              fontFamily="monospace"
              fontSize={26}
              y={4}
              x={8}
              fontStyle="bolder"
              align="left"
              width={rightWidth}
              fill={theme.text}
              text={`SCORE\n${game.getScore()}`}
            />
            <Text
              fontFamily="monospace"
              fontSize={26}
              y={64}
              x={8}
              fontStyle="bolder"
              align="left"
              width={rightWidth}
              fill={theme.textSecond}
              text={`MAX\n${maxScore}`}
            />
          </Group>
          <Group y={140}>
            <Rect
              strokeWidth={2}
              height={60}
              width={rightWidth}
              stroke={theme.border}
            />
            <Text
              fontFamily="monospace"
              fontSize={26}
              y={4}
              x={8}
              fontStyle="bolder"
              align="left"
              fill={theme.text}
              width={rightWidth}
              text={`LINES\n${game.getLines()}`}
            />
          </Group>
          <Group y={220}>
            <Rect
              strokeWidth={2}
              height={32}
              width={rightWidth}
              stroke={theme.border}
            />
            <Text
              fontFamily="monospace"
              fontSize={26}
              y={4}
              x={8}
              fontStyle="bolder"
              align="left"
              width={rightWidth}
              fill={theme.text}
              text={`LEVEL ${level}`}
            />
          </Group>
        </Group>
        <Group x={20} y={screenHeight - 320}>
          <Group x={48} y={96}>
            <Circle
              radius={42}
              x={0}
              y={0}
              fill={theme.border}
              onTouchStart={pressLeftHandler}
            />
            <Path
              listening={false}
              data="M -3 0 L 2 -3 L 2 3 Z"
              x={0}
              y={0}
              scaleX={5}
              scaleY={5}
              fill={theme.textSecond}
            />
            <Circle
              radius={42}
              x={128}
              y={0}
              fill={theme.border}
              onTouchStart={pressRightHandler}
            />
            <Path
              listening={false}
              data="M 3 0 L -2 -3 L -2 3 Z"
              x={128}
              y={0}
              scaleX={5}
              scaleY={5}
              fill={theme.textSecond}
            />
            <Circle
              radius={42}
              x={64}
              y={96}
              fill={theme.border}
              onTouchStart={pressDownHandler}
              onTouchEnd={releaseDownHandler}
            />
            <Path
              listening={false}
              data="M 0 3 L 3 -2 L -3 -2 Z"
              x={64}
              y={96}
              scaleX={5}
              scaleY={5}
              fill={theme.textSecond}
            />
          </Group>
          <Group x={screenWidth - 40 - 64} y={92}>
            <Circle
              radius={56}
              x={0}
              y={0}
              fill={theme.border}
              onTouchStart={pressRotateHandler}
            />
            <Path
              listening={false}
              data="M4.5639 0.500511C3.65472 0.485978 2.76771 0.781653 2.04909 1.3388C1.33047 1.89595 0.823121 2.68132 0.610675 3.56545C0.398229 4.44959 0.493361 5.37972 0.880394 6.20255C1.26743 7.02537 1.92326 7.69177 2.73979 8.0919C3.55632 8.49204 4.48482 8.60202 5.37224 8.40374C6.25966 8.20545 7.05303 7.71072 7.62159 7.00109C8.08974 6.4168 8.38246 5.71554 8.47126 4.97847L9.69997 5.9C9.92088 6.06569 10.2343 6.02091 10.4 5.8C10.5657 5.57909 10.5209 5.26569 10.3 5.1L7.99997 3.375L5.69997 5.1C5.47906 5.26569 5.43429 5.57909 5.59997 5.8C5.76566 6.02091 6.07906 6.06569 6.29997 5.9L7.45166 5.03623C7.36308 5.52379 7.15453 5.98474 6.84119 6.37582C6.41477 6.90804 5.81973 7.27909 5.15417 7.4278C4.48861 7.57652 3.79223 7.49403 3.17983 7.19393C2.56744 6.89383 2.07556 6.39403 1.78529 5.77691C1.49501 5.15979 1.42366 4.46219 1.583 3.79909C1.74233 3.13599 2.12284 2.54696 2.66181 2.1291C3.20078 1.71124 3.86603 1.48948 4.54792 1.50038C5.22981 1.51128 5.88763 1.75419 6.41297 2.18906C6.62569 2.36515 6.94087 2.33546 7.11696 2.12274C7.29305 1.91002 7.26335 1.59484 7.05064 1.41875C6.35019 0.838919 5.47309 0.515045 4.5639 0.500511Z"
              x={-20}
              y={-20}
              scaleX={5}
              scaleY={5}
              fill={theme.textSecond}
            />
          </Group>
        </Group>
      </Layer>
    </Stage>
  );
};
