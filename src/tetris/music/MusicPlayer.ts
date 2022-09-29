import { beep } from "../beep";
import frequencies from "./frequencies.json";

type Note = {
  offset: number;
  note: string;
  duration: number;
  volume: number;
};

class MusicPlayer {
  public speed = 1;
  public volume = 0.05;

  private notes: Note[] = [];

  private playTimer: any = 0;

  public load(data: [number, string, number][]) {
    this.notes = data.map(([offset, note, duration]) => ({
      offset: (offset / 16) * 1000,
      note,
      duration: (duration / 16) * 1000,
      volume: 100,
    }));
  }

  public stop() {
    clearInterval(this.playTimer);
  }

  public play(loop = false, skipSilence = true) {
    this.stop();

    const musicStart = Math.min(...this.notes.map((note) => note.offset));
    const musicEnd = Math.max(
      ...this.notes.map((note) => note.offset + note.duration)
    );

    let frameFromAbsolute = Date.now();

    if (skipSilence) {
      frameFromAbsolute -= musicStart;
    }

    let frameFrom = 0;
    let frameTo = 0;

    const startAbsolute = frameFromAbsolute;

    this.playTimer = setInterval(() => {
      frameFrom = frameTo;
      frameTo += (Date.now() - frameFromAbsolute) * this.speed;
      frameFromAbsolute = Date.now();

      for (const note of this.notes) {
        const offset = note.offset;

        if (offset >= frameFrom && offset < frameTo) {
          this.playNote(note);
        }
      }

      if (startAbsolute + musicEnd < frameFromAbsolute) {
        if (loop) {
          this.play(loop, skipSilence);
        } else {
          this.stop();
        }
      }
    }, 10);
  }

  private playNote(note: Note) {
    const noteMatch = /([A-G][#b]?)([0-8])/.exec(note.note);

    if (!noteMatch) return;

    const noteName = noteMatch[1] as keyof typeof frequencies;
    const octave = Number(noteMatch[2]);

    const frequency = frequencies[noteName][octave];

    beep(note.duration / this.speed, frequency, note.volume * this.volume);
  }
}

export default MusicPlayer;
