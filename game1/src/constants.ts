export const GAME_WIDTH = 540;
export const GAME_HEIGHT = 540;

// 배경
export const SCROLL_SPEED = 3;

// 코인
export const COIN_SPEED = 220;
export const COIN_SPAWN_INTERVAL = 1200;
export const COIN_TARGET = 20;
export const COIN_MIN_Y = 220;
export const COIN_MAX_Y = 430;
export const COIN_RADIUS = 22;

// 플레이어
export const PLAYER_X = 120;
export const GROUND_Y = 440;
export const PLAYER_JUMP_VELOCITY = -700;
export const GRAVITY = 1000;

// 애니메이션 fps
export const RUN_FPS = 12;
export const JUMP_FPS = 20;
export const SUCCESS_FPS = 18;

// UI
export const HEART_COUNT = 5;

// 에셋 키
export const ASSET = {
  BG: 'background',
  BGM: 'bgm',
  INTRO_BGM: 'intro_bgm',
  COIN_SFX: 'coin_sfx',
  CLEAR_SFX: 'clear_sfx',
  COIN_TEX: 'coin_tex',
  RUN: (i: number) => `run_${i}`,
  JUMP: (i: number) => `jump_${i}`,
  SUCCESS: (i: number) => `success_${i}`,
} as const;

// 에셋 경로
export const PATH = {
  BG: 'assets/background.jpeg',
  BGM: 'assets/bgm.aac',
  INTRO_BGM: 'assets/intro_bgm.aac',
  COIN_SFX: 'assets/coin_sfx.aac',
  CLEAR_SFX: 'assets/clear_sfx.aac',
  RUN: (i: number) => `assets/sprites/running/${i}.png`,
  JUMP: (i: number) => `assets/sprites/jump/${i}.png`,
  SUCCESS: (i: number) => `assets/sprites/success/${i}.png`,
} as const;

// 씬 키
export const SCENE = {
  INTRO: 'IntroScene',
  GAME: 'GameScene',
  CLEAR: 'ClearScene',
} as const;
