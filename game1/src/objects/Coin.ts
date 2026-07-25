import Phaser from 'phaser';
import { ASSET, COIN_RADIUS } from '../constants';

export function createCoinTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(ASSET.COIN_TEX)) return;

  const size = COIN_RADIUS * 2 + 4;
  const g = scene.add.graphics();

  g.fillStyle(0xcc8800, 1);
  g.fillCircle(size / 2, size / 2, COIN_RADIUS);

  g.fillStyle(0xffcc00, 1);
  g.fillCircle(size / 2, size / 2, COIN_RADIUS - 2);

  g.fillStyle(0xffee88, 1);
  g.fillCircle(size / 2 - 4, size / 2 - 4, COIN_RADIUS * 0.35);

  g.lineStyle(1.5, 0xcc8800, 1);
  g.strokeCircle(size / 2, size / 2, COIN_RADIUS - 5);

  g.generateTexture(ASSET.COIN_TEX, size, size);
  g.destroy();
}
