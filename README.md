# Bunny Runner

픽셀아트 사이드스크롤 러너 웹 게임. 토끼 캐릭터로 달리며 코인 20개를 수집하면 클리어.

## 요구사항

- **Node.js** v20 이상 (fnm으로 설치 권장)
- **pnpm** v8 이상

### Node.js 설치 (fnm 사용)

```bash
# fnm 설치
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc

# Node.js LTS 설치
fnm install --lts
fnm use lts-latest

# 확인
node --version
```

### pnpm 설치

```bash
npm install -g pnpm

# 확인
pnpm --version
```

---

## 시작하기

```bash
# 의존성 설치
cd game1
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 http://localhost:5173 접속.

---

## 개발 명령어

```bash
# 개발 서버 (핫 리로드)
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

빌드 결과물은 `game1/dist/` 디렉토리에 생성됩니다.

---

## 프로젝트 구조

```
js-bth-web/
├── README.md
├── CLAUDE.md          # Claude Code 개발 지침
├── ARCHITECTURE.md    # 게임 아키텍처 설계
├── references/        # 원본 에셋 (수정 금지)
│   └── game1/
└── game1/             # 게임 구현체
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
    │           ├── running/   # 달리기 스프라이트 (1~11.png)
    │           ├── jump/      # 점프 스프라이트 (1~21.png)
    │           └── success/   # 성공 스프라이트 (1~45.png)
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

---

## 게임 조작

| 입력 | 동작 |
|------|------|
| `Space` | 점프 |
| 화면 클릭/탭 | 점프 |

## 게임 규칙

- 코인 **20개** 수집 시 클리어
- 하트 UI는 장식용 (감소하지 않음)
- 씬 흐름: **인트로 → 게임 → 클리어**

---

## 배포

`pnpm build` 후 `game1/dist/` 디렉토리를 정적 호스팅 서비스에 업로드.

- GitHub Pages
- Vercel
- Netlify

> 배포 경로가 루트가 아닐 경우 `game1/vite.config.ts`의 `base` 옵션을 수정하세요.
> 예: `base: '/game1/'`
