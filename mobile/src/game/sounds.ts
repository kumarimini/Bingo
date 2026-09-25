import { createAudioPlayer, AudioPlayer } from 'expo-audio';

let tapPlayer: AudioPlayer | null = null;
let winPlayer: AudioPlayer | null = null;

function getTapPlayer(): AudioPlayer {
  if (!tapPlayer) tapPlayer = createAudioPlayer(require('../../assets/sounds/tap.wav'));
  return tapPlayer;
}

function getWinPlayer(): AudioPlayer {
  if (!winPlayer) winPlayer = createAudioPlayer(require('../../assets/sounds/win.wav'));
  return winPlayer;
}

export function playTapSound() {
  try {
    const player = getTapPlayer();
    player.seekTo(0);
    player.play();
  } catch {
    // Audio is best-effort — never let a sound failure break gameplay.
  }
}

export function playWinSound() {
  try {
    const player = getWinPlayer();
    player.seekTo(0);
    player.play();
  } catch {
    // Audio is best-effort — never let a sound failure break gameplay.
  }
}
