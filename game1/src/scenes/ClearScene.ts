import Phaser from 'phaser';
import { ASSET, SCENE, GAME_WIDTH, GAME_HEIGHT } from '../constants';

const CX = GAME_WIDTH / 2;
const CY = GAME_HEIGHT / 2;

export class ClearScene extends Phaser.Scene {
  private videoEl: HTMLVideoElement | null = null;
  private overlayEl: HTMLDivElement | null = null;

  constructor() {
    super(SCENE.CLEAR);
  }

  create(data: { coins: number }): void {
    // 배경
    this.add.image(CX, CY, ASSET.BG).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(CX, CY, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5);

    // 클리어 텍스트
    this.add.text(CX, CY - 100, '🎉 CLEAR! 🎉', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '34px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(CX, CY - 30, `코인 ${data.coins ?? 20}개 수집 완료!`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // 버튼
    const btn = this.add.rectangle(CX, CY + 65, 300, 58, 0xffcc00)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(CX, CY + 65, 'find bunny? catch bunny?', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#000000',
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0xffe566));
    btn.on('pointerout', () => btn.setFillStyle(0xffcc00));
    btn.on('pointerdown', () => this.playEndingVideo());

    // 씬 종료 시 비디오 정리
    this.events.on('shutdown', () => this.removeVideo());
    this.events.on('destroy', () => this.removeVideo());
  }

  private playEndingVideo(): void {
    // 이미 재생 중이면 무시
    if (this.videoEl) return;

    // 캔버스 위에 검정 오버레이 + video 엘리먼트를 DOM으로 올림
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();

    // 오버레이 div (배경 클릭 차단)
    this.overlayEl = document.createElement('div');
    Object.assign(this.overlayEl.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      background: '#000',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',  // 클릭 이벤트가 Phaser로 통과되지 않도록 차단
    });

    // video 엘리먼트
    this.videoEl = document.createElement('video');
    this.videoEl.src = 'assets/ending_video.mp4';
    this.videoEl.playsInline = true;
    this.videoEl.autoplay = true;
    Object.assign(this.videoEl.style, {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    });

    // 영상 끝나면 제거
    this.videoEl.addEventListener('ended', () => this.removeVideo());

    this.overlayEl.appendChild(this.videoEl);
    document.body.appendChild(this.overlayEl);

    this.videoEl.play().catch(() => {
      // 자동재생 차단 시 탭 안내 텍스트 표시
      if (!this.overlayEl) return;
      const hint = document.createElement('p');
      Object.assign(hint.style, {
        color: '#fff', fontFamily: 'monospace', fontSize: '16px',
        position: 'absolute', bottom: '20px', width: '100%',
        textAlign: 'center',
      });
      hint.textContent = '탭하면 재생됩니다';
      this.overlayEl.appendChild(hint);
      this.overlayEl.addEventListener('click', () => this.videoEl?.play(), { once: true });
    });
  }

  private removeVideo(): void {
    this.videoEl?.pause();
    this.overlayEl?.remove();
    this.videoEl = null;
    this.overlayEl = null;
  }
}
