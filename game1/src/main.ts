import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT } from "./constants";
import { IntroScene } from "./scenes/IntroScene";
import { GameScene } from "./scenes/GameScene";
import { ClearScene } from "./scenes/ClearScene";

const startGame = () =>
  new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#87ceeb",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: document.body,
    },
    physics: {
      default: "arcade",
      arcade: { debug: false },
    },
    scene: [IntroScene, GameScene, ClearScene],
  });

// 히든 엘리먼트로 폰트를 강제 로드한 뒤 게임 초기화
const fontPreload = document.createElement("div");
fontPreload.style.cssText =
  'position:absolute;visibility:hidden;font-family:"Press Start 2P";font-size:16px';
fontPreload.textContent = "BUNNY PRESS START";
document.body.appendChild(fontPreload);

document.fonts.load('bold 16px "Press Start 2P"').then(() => {
  fontPreload.remove();
  startGame();
});
