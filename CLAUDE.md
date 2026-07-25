# CLAUDE.md

## 프로젝트 개요

웹 배포용 픽셀아트 사이드스크롤 러너 게임. 토끼 캐릭터가 달리며 코인을 수집하는 미니게임.

## 기술 스택

- **언어**: TypeScript
- **게임 프레임워크**: Phaser 3
- **빌드 도구**: Vite
- **패키지 매니저**: pnpm

## 프로젝트 구조

```
js-bth-web/
├── CLAUDE.md
├── ARCHITECTURE.md
├── references/         # 원본 에셋 (수정 금지)
│   └── game1/
└── game1/              # 게임 구현체
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── public/
    │   └── assets/
    │       ├── background.jpeg
    │       ├── bgm.aac
    │       ├── coin_sfx.aac
    │       ├── clear_sfx.aac
    │       └── sprites/
    │           ├── running/    # 1~11.png
    │           ├── jump/       # 1~21.png
    │           └── success/    # 1~45.png
    └── src/
        ├── main.ts
        ├── constants.ts
        ├── scenes/
        │   ├── IntroScene.ts
        │   ├── GameScene.ts
        │   └── ClearScene.ts
        └── objects/
            ├── Player.ts
            └── Coin.ts
```

## 개발 명령어

```bash
cd game1
pnpm install
pnpm dev      # 개발 서버
pnpm build    # 프로덕션 빌드
pnpm preview  # 빌드 결과 미리보기
```

## 코딩 규칙

- 모든 게임 상수는 `src/constants.ts`에 집중 관리
- Phaser Scene 클래스는 `preload → create → update` 순서로 메서드 작성
- 에셋 경로는 상수로 관리 (하드코딩 금지)
- `references/` 디렉토리는 절대 수정하지 않음

## 에셋 규칙

- 스프라이트 원본: `references/game1/character_sprite_sheet/`
- 게임 사용 에셋: `game1/public/assets/` (references에서 복사)
- 코인 스프라이트 없음 → Phaser Graphics API로 코드 생성

## 게임 스펙 요약

- 목표: 코인 20개 수집
- 조작: 스페이스 또는 화면 탭으로 점프
- 장애물: 없음
- 하트 UI: 장식용 (5개 고정)
- 씬 흐름: IntroScene → GameScene → ClearScene
