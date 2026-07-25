import Phaser from 'phaser';
import {
  ASSET,
  GROUND_Y,
  PLAYER_JUMP_VELOCITY,
  RUN_FPS,
  JUMP_FPS,
  SUCCESS_FPS,
} from '../constants';

type PlayerState = 'running' | 'jumping' | 'success';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private playerState: PlayerState = 'running';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, ASSET.RUN(1));
    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject);

    this.setCollideWorldBounds(true);
    this.setGravityY(0);
    this.setScale(0.14);
    this.setOrigin(0.5, 1);

    this.createAnimations(scene);
    this.play('run');
  }

  private createAnimations(scene: Phaser.Scene): void {
    if (!scene.anims.exists('run')) {
      scene.anims.create({
        key: 'run',
        frames: Array.from({ length: 11 }, (_, i) => ({
          key: ASSET.RUN(i + 1),
        })),
        frameRate: RUN_FPS,
        repeat: -1,
      });
    }
    if (!scene.anims.exists('jump')) {
      scene.anims.create({
        key: 'jump',
        frames: Array.from({ length: 21 }, (_, i) => ({
          key: ASSET.JUMP(i + 1),
        })),
        frameRate: JUMP_FPS,
        repeat: 0,
      });
    }
    if (!scene.anims.exists('success')) {
      scene.anims.create({
        key: 'success',
        frames: Array.from({ length: 45 }, (_, i) => ({
          key: ASSET.SUCCESS(i + 1),
        })),
        frameRate: SUCCESS_FPS,
        repeat: -1,
      });
    }
  }

  jump(): void {
    if (this.playerState !== 'running') return;
    this.playerState = 'jumping';
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(PLAYER_JUMP_VELOCITY);
    this.play('jump');
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.playerState === 'jumping') {
        this.play('run');
      }
    });
  }

  land(): void {
    if (this.playerState !== 'jumping') return;
    this.playerState = 'running';
    this.play('run');
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(0);
    this.y = GROUND_Y;
  }

  celebrate(): void {
    this.playerState = 'success';
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(0);
    this.y = GROUND_Y;
    this.play('success');
  }

  isOnGround(): boolean {
    return this.y >= GROUND_Y;
  }

  getState(): PlayerState {
    return this.playerState;
  }

  update(): void {
    if (this.playerState === 'jumping' && this.isOnGround()) {
      this.land();
    }
  }
}
