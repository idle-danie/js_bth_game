import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { IntroScene } from './scenes/IntroScene';
import { GameScene } from './scenes/GameScene';
import { ClearScene } from './scenes/ClearScene';

new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: document.body,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [IntroScene, GameScene, ClearScene],
});
