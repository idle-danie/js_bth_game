import Phaser from 'phaser';
import { ASSET, PATH, SCENE, GAME_WIDTH, GAME_HEIGHT } from '../constants';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;

const TITLE_TOP_Y = CY - 60;
const TITLE_BOT_Y = CY + 60;

export class IntroScene extends Phaser.Scene {
  private introBgm!: Phaser.Sound.BaseSound;
  private topGroup!: Phaser.GameObjects.Container;
  private botGroup!: Phaser.GameObjects.Container;
  private pressStart!: Phaser.GameObjects.Text;
  private glitchTimer = 0;
  private canStart = false;

  // 글리치용 RGB 레이어들 (컨테이너 내 cyan/magenta 복사본)
  private topRed!: Phaser.GameObjects.Text;
  private topCyan!: Phaser.GameObjects.Text;
  private botRed!: Phaser.GameObjects.Text;
  private botCyan!: Phaser.GameObjects.Text;

  constructor() {
    super(SCENE.INTRO);
  }

  preload(): void {
    this.load.audio(ASSET.INTRO_BGM, PATH.INTRO_BGM);
    this.load.audio(ASSET.BGM, PATH.BGM);
    this.load.audio(ASSET.COIN_SFX, PATH.COIN_SFX);
    this.load.audio(ASSET.CLEAR_SFX, PATH.CLEAR_SFX);
    this.load.image(ASSET.BG, PATH.BG);
    for (let i = 1; i <= 11; i++) this.load.image(ASSET.RUN(i), PATH.RUN(i));
    for (let i = 1; i <= 21; i++) this.load.image(ASSET.JUMP(i), PATH.JUMP(i));
    for (let i = 1; i <= 45; i++) this.load.image(ASSET.SUCCESS(i), PATH.SUCCESS(i));

    this.cameras.main.setBackgroundColor(0x000000);
    const barBg = this.add.rectangle(CX, CY, 300, 12, 0x333333);
    const bar = this.add.rectangle(CX - 150, CY, 0, 12, 0xff44aa);
    bar.setOrigin(0, 0.5);
    this.load.on('progress', (v: number) => { bar.width = 300 * v; });
    this.load.on('complete', () => { barBg.destroy(); bar.destroy(); });
  }

  create(): void {
    this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, 0x000000);
    this.createStars();

    // 타이틀 생성
    const topResult = this.makeNeonTitle('BUNNY', CX, TITLE_TOP_Y);
    const botResult = this.makeNeonTitle('BUNNY', CX, TITLE_BOT_Y);
    this.topGroup = topResult.container;
    this.topRed = topResult.red;
    this.topCyan = topResult.cyan;
    this.botGroup = botResult.container;
    this.botRed = botResult.red;
    this.botCyan = botResult.cyan;

    // 시작 위치: 화면 밖
    this.topGroup.y = -140;
    this.botGroup.y = GAME_HEIGHT + 140;

    // 충돌 플래시
    const flash = this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0).setDepth(20);

    // PRESS START — Y를 더 아래로
    this.pressStart = this.add.text(CX, GAME_HEIGHT - 60, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    // 슬라이드인
    this.tweens.add({
      targets: this.topGroup,
      y: TITLE_TOP_Y,
      duration: 650,
      ease: 'Cubic.easeIn',
      delay: 200,
    });
    this.tweens.add({
      targets: this.botGroup,
      y: TITLE_BOT_Y,
      duration: 650,
      ease: 'Cubic.easeIn',
      delay: 200,
      onComplete: () => this.onCollision(flash),
    });

    // BGM
    this.introBgm = this.sound.add(ASSET.INTRO_BGM, { loop: true, volume: 0.7 });
    const tryPlay = () => { if (!this.introBgm.isPlaying) this.introBgm.play(); };
    tryPlay();
    this.input.once('pointerdown', tryPlay);
    this.input.keyboard!.once('keydown', tryPlay);

    this.input.keyboard!.on('keydown', () => this.tryStart());
    this.input.on('pointerdown', () => this.tryStart());

    this.createScanlines();
  }

  private makeNeonTitle(text: string, x: number, y: number): {
    container: Phaser.GameObjects.Container;
    red: Phaser.GameObjects.Text;
    cyan: Phaser.GameObjects.Text;
  } {
    const fontSize = '78px';
    const fontFamily = '"Press Start 2P", monospace';

    // 깊은 3D 블록 그림자
    const shadow = this.add.text(0, 0, text, {
      fontFamily, fontSize,
      color: '#250010', stroke: '#250010', strokeThickness: 24,
    }).setOrigin(0.5).setPosition(9, 11);

    const mid = this.add.text(0, 0, text, {
      fontFamily, fontSize,
      color: '#770033', stroke: '#440022', strokeThickness: 18,
    }).setOrigin(0.5).setPosition(4, 6);

    const outline = this.add.text(0, 0, text, {
      fontFamily, fontSize,
      color: '#cc1166', stroke: '#990044', strokeThickness: 10,
    }).setOrigin(0.5).setPosition(1, 2);

    // RGB 글리치용 cyan 레이어 (평소엔 숨김)
    const cyan = this.add.text(0, 0, text, {
      fontFamily, fontSize,
      color: '#00ffff',
    }).setOrigin(0.5).setAlpha(0);

    // RGB 글리치용 red 레이어 (평소엔 숨김)
    const red = this.add.text(0, 0, text, {
      fontFamily, fontSize,
      color: '#ff0055',
    }).setOrigin(0.5).setAlpha(0);

    // 최전면 네온 핑크
    const front = this.add.text(0, 0, text, {
      fontFamily, fontSize,
      color: '#ff55bb', stroke: '#ff0077', strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#ff44aa', blur: 22, fill: true },
    }).setOrigin(0.5);

    const container = this.add.container(x, y, [shadow, mid, outline, cyan, red, front]);
    container.setDepth(5);
    return { container, red, cyan };
  }

  private onCollision(flash: Phaser.GameObjects.Rectangle): void {
    this.tweens.add({
      targets: flash,
      alpha: { from: 0.75, to: 0 },
      duration: 280,
      ease: 'Power2',
    });

    this.cameras.main.shake(220, 0.02);

    this.tweens.add({
      targets: this.topGroup,
      y: TITLE_TOP_Y - 20,
      duration: 110,
      ease: 'Power1',
      yoyo: true,
    });
    this.tweens.add({
      targets: this.botGroup,
      y: TITLE_BOT_Y + 20,
      duration: 110,
      ease: 'Power1',
      yoyo: true,
      onComplete: () => {
        this.canStart = true;
        this.startTyping();
        // 충돌 직후 강한 글리치 1회
        this.triggerGlitch(true);
      },
    });
  }

  // 글리치 발동
  private triggerGlitch(strong = false): void {
    const dur = strong ? 180 : 90;
    const oxMax = strong ? 14 : 8;
    const oyMax = strong ? 6 : 3;

    // RGB 분리: cyan 왼쪽, red 오른쪽으로 오프셋
    const cyanOx = -Phaser.Math.Between(4, oxMax);
    const redOx = Phaser.Math.Between(4, oxMax);
    const oyC = Phaser.Math.Between(-oyMax, oyMax);
    const oyR = Phaser.Math.Between(-oyMax, oyMax);

    [this.topCyan, this.botCyan].forEach(t => {
      t.setAlpha(0.55).setPosition(cyanOx, oyC);
    });
    [this.topRed, this.botRed].forEach(t => {
      t.setAlpha(0.55).setPosition(redOx, oyR);
    });

    // 컨테이너 전체 수평 흔들기
    const gx = Phaser.Math.Between(-oxMax / 2, oxMax / 2);
    this.topGroup.x = CX + gx;
    this.botGroup.x = CX - gx;

    // 일부 라인 수직 오프셋 (텍스트 잘린 느낌)
    this.topGroup.y = TITLE_TOP_Y + Phaser.Math.Between(-4, 4);
    this.botGroup.y = TITLE_BOT_Y + Phaser.Math.Between(-4, 4);

    this.time.delayedCall(dur, () => {
      [this.topCyan, this.botCyan, this.topRed, this.botRed].forEach(t => t.setAlpha(0));
      this.topGroup.x = CX;
      this.botGroup.x = CX;
      this.topGroup.y = TITLE_TOP_Y;
      this.botGroup.y = TITLE_BOT_Y;

      // 강한 글리치면 짧게 한 번 더
      if (strong) {
        this.time.delayedCall(60, () => this.triggerGlitch(false));
      }
    });
  }

  private startTyping(): void {
    this.pressStart.setAlpha(1);
    const FULL = 'PRESS START ▶';
    let idx = 0;
    this.time.addEvent({
      delay: 75,
      repeat: FULL.length - 1,
      callback: () => { idx++; this.pressStart.setText(FULL.slice(0, idx)); },
    });
    this.time.delayedCall(75 * FULL.length + 400, () => {
      this.tweens.add({
        targets: this.pressStart,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private createScanlines(): void {
    const g = this.add.graphics().setDepth(30).setAlpha(0.2);
    for (let y = 0; y < GAME_HEIGHT; y += 4) {
      g.fillStyle(0x000000, 1);
      g.fillRect(0, y, GAME_WIDTH, 2);
    }
  }

  private createStars(): void {
    for (let i = 0; i < 42; i++) {
      const x = Phaser.Math.Between(8, GAME_WIDTH - 8);
      const y = Phaser.Math.Between(8, GAME_HEIGHT - 8);
      const alpha = Phaser.Math.FloatBetween(0.15, 0.85);
      const size = Phaser.Math.Between(10, 17);
      const color = i % 5 === 0 ? '#ffffff' : '#4a4a4a';
      const star = this.add.text(x, y, '+', {
        fontFamily: 'monospace', fontSize: `${size}px`, color,
      }).setAlpha(alpha).setDepth(1);

      if (i % 3 === 0) {
        this.tweens.add({
          targets: star,
          alpha: { from: alpha, to: 0.05 },
          duration: Phaser.Math.Between(700, 2200),
          yoyo: true, repeat: -1,
          delay: Phaser.Math.Between(0, 1500),
        });
      }
    }
  }

  update(_time: number, delta: number): void {
    if (!this.canStart) return;
    this.glitchTimer += delta;

    // 불규칙 간격 글리치: 1.5~4초 랜덤
    const interval = Phaser.Math.Between(1500, 4000);
    if (this.glitchTimer > interval) {
      this.glitchTimer = 0;
      this.triggerGlitch(false);
    }
  }

  private tryStart(): void {
    if (!this.canStart) return;
    this.introBgm.stop();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENE.GAME);
    });
  }
}
