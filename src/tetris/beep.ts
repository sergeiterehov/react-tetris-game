const audioContext = new AudioContext();

export function beep(
  duration = 200,
  frequency = 440,
  volume = 100,
  type: OscillatorType = "square"
) {
  return new Promise<void>((resolve, reject) => {
    try {
      const oscillatorNode = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillatorNode.connect(gainNode);

      oscillatorNode.frequency.value = frequency;

      oscillatorNode.type = type;
      gainNode.connect(audioContext.destination);

      gainNode.gain.value = volume * 0.01;

      oscillatorNode.start(audioContext.currentTime);
      oscillatorNode.stop(audioContext.currentTime + duration * 0.001);

      oscillatorNode.onended = () => {
        resolve();
      };
    } catch (error) {
      reject(error);
    }
  });
}

export async function beepMany(
  ...list: (
    | [number, number, number, OscillatorType]
    | [number, number, number]
  )[]
) {
  for (const item of list) {
    await beep(...(item as any));
  }
}
