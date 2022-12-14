import { beep, beepMany } from "./beep";

const sounds = {
  drop: () => {
    beepMany(
      [30, 70, 8, "sawtooth"],
      [30, 60, 8, "sine"],
      [30, 80, 8, "square"],
      [30, 70, 5, "sawtooth"],
      [30, 80, 3, "sine"]
    );
  },
  tetris: () => {
    beepMany(
      [100, 600, 10],
      [50, 720, 10],
      [100, 600, 10],
      [50, 720, 10],
      [100, 600, 10],
      [100, 720, 5]
    );
  },
  clear: () => {
    beepMany([100, 500, 10], [50, 600, 10], [100, 500, 5]);
  },
  levelUp: () => {
    beepMany(
      [50, 300, 10],
      [100, 500, 10],
      [50, 0, 0],
      [50, 400, 10],
      [100, 600, 10],
      [50, 0, 0],
      [50, 500, 10],
      [100, 700, 10]
    );
  },
  final: () => {
    beepMany(
      [250, 720, 10],
      [100, 0, 0],
      [250, 600, 10],
      [100, 0, 0],
      [1000, 510, 10]
    );
  },
  move: () => {
    beep(50, 720, 10);
  },
  rotate: () => {
    beepMany([50, 600, 10], [50, 0, 0], [50, 600, 10]);
  },
};

export default sounds;
