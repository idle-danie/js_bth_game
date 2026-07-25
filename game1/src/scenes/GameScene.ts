import Phaser from 'phaser';
import {
  ASSET, SCENE,
  GAME_WIDTH, GAME_HEIGHT,
  SCROLL_SPEED, GRAVITY,
  COIN_SPAWN_INTERVAL, COIN_TARGET, COIN_MIN_Y, COIN_MAX_Y, COIN_RADIUS,
  PLAYER_X, GROUND_Y,
  HEART_COUNT,
} from '../constants';
import { Player } from '../objects/Player';
import { createCoinTexture } from '../objects/Coin';

export class GameScene extends Phaser.Scene {
  private bg0!: Phaser.GameObjects.Image;
  private bg1!: Phaser.GameObjects.Image;
  private bgWidth = 0;
  private player!: Player;
  private coins!: Phaser.Physics.Arcade.Group;
  private coinCount = 0;
  private coinText!: Phaser.GameObjects.Text;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private bgm!: Phaser.Sound.BaseSound;
  private coinSfx!: Phaser.Sound.BaseSound;
  private cleared = false;
  private jumpKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super(SCENE.GAME);
  }

  create(): void {
    this.cleared = false;
    this.coinCount = 0;

    // 배경: 높이 기준으로 스케일 → 캔버스 전체를 채움, 2장으로 무한 스크롤
    const bgTex = this.textures.get(ASSET.BG);
    const origW = bgTex.getSourceImage().width as number;
    const origH = bgTex.getSourceImage().height as number;
    const bgScale = GAME_HEIGHT / origH;
    this.bgWidth = origW * bgScale;

    this.bg0 = this.add.image(0, 0, ASSET.BG).setOrigin(0, 0).setScale(bgScale);
    this.bg1 = this.add.image(this.bgWidth, 0, ASSET.BG).setOrigin(0, 0).setScale(bgScale);

    // 물리 중력
    this.physics.world.gravity.y = GRAVITY;

    // 코인 텍스처 생성
    createCoinTexture(this);

    // 플레이어
    this.player = new Player(this, PLAYER_X, GROUND_Y);

    // 코인 그룹
    this.coins = this.physics.add.group();

    // 오버랩: 플레이어-코인
    this.physics.add.overlap(
      this.player as unknown as Phaser.GameObjects.GameObject,
      this.coins,
      (_player, coin) => this.collectCoin(coin as Phaser.Physics.Arcade.Sprite),
    );

    // BGM
    this.bgm = this.sound.add(ASSET.BGM, { loop: true, volume: 0.5 });
    this.bgm.play();

    // 코인 효과음
    this.coinSfx = this.sound.add(ASSET.COIN_SFX, { volume: 0.8 });

    // 코인 스폰 타이머
    this.spawnTimer = this.time.addEvent({
      delay: COIN_SPAWN_INTERVAL,
      callback: this.spawnCoin,
      callbackScope: this,
      loop: true,
    });

    // 점프 입력
    this.jumpKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on('pointerdown', () => this.player.jump());

    // UI
    this.createUI();
  }

  private createUI(): void {
    // 좌상단: 토끼 아이콘 텍스트 + 하트
    this.add.text(16, 14, '🐰🐰', { fontSize: '22px' }).setScrollFactor(0).setDepth(10);
    for (let i = 0; i < HEART_COUNT; i++) {
      this.add.text(80 + i * 30, 14, '❤️', { fontSize: '20px' }).setScrollFactor(0).setDepth(10);
    }

    // 우상단: 코인 카운터
    this.add.text(GAME_WIDTH - 110, 14, '🪙 ×', {
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(10);

    this.coinText = this.add.text(GAME_WIDTH - 42, 14, '0', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setScrollFactor(0).setDepth(10);
  }

  private spawnCoin(): void {
    if (this.cleared) return;
    const y = Phaser.Math.Between(COIN_MIN_Y, COIN_MAX_Y);
    const coin = this.coins.create(GAME_WIDTH + 30, y, ASSET.COIN_TEX) as Phaser.Physics.Arcade.Sprite;
    coin.setDepth(5);
    const body = coin.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(-220);
    // 물리 바디를 실제 코인 원 크기에 맞게 축소
    body.setCircle(COIN_RADIUS * 0.55, COIN_RADIUS * 0.45, COIN_RADIUS * 0.45);
  }

  private collectCoin(coin: Phaser.Physics.Arcade.Sprite): void {
    // cleared 이후 overlap 콜백이 중복 호출되는 것 차단
    if (this.cleared || !coin.active) return;
    coin.destroy();
    this.coinSfx.play();
    this.coinCount++;
    this.coinText.setText(String(this.coinCount));

    if (this.coinCount >= COIN_TARGET) {
      this.triggerClear();
    }
  }

  private triggerClear(): void {
    if (this.cleared) return;
    this.cleared = true;

    this.spawnTimer.remove();
    this.player.celebrate();

    // 배경 정지
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        this.bgm.stop();
        this.sound.play(ASSET.CLEAR_SFX);
        this.time.addEvent({
          delay: 1000,
          callback: () => this.scene.start(SCENE.CLEAR, { coins: this.coinCount }),
        });
      },
    });
  }

  update(): void {
    if (this.cleared) return;

    // 배경 스크롤 (두 이미지를 왼쪽으로 이동, 화면 밖 나가면 오른쪽으로 순환)
    this.bg0.x -= SCROLL_SPEED;
    this.bg1.x -= SCROLL_SPEED;
    if (this.bg0.x + this.bgWidth <= 0) this.bg0.x = this.bg1.x + this.bgWidth;
    if (this.bg1.x + this.bgWidth <= 0) this.bg1.x = this.bg0.x + this.bgWidth;

    // 점프 입력
    if (Phaser.Input.Keyboard.JustDown(this.jumpKey)) {
      this.player.jump();
    }

    // 플레이어 업데이트 (착지 감지)
    this.player.update();

    // 화면 밖 코인 제거
    this.coins.getChildren().forEach((child) => {
      const coin = child as Phaser.Physics.Arcade.Sprite;
      if (coin.x < -50) coin.destroy();
    });
  }
}
