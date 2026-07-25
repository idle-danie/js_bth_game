# ARCHITECTURE.md

## 게임 아키텍처

### 씬(Scene) 흐름

```
IntroScene ──(시작 버튼)──▶ GameScene ──(코인 20개)──▶ ClearScene
                                                           │
                                                    (재도전 버튼)──▶ GameScene
```

---

### IntroScene

**역할:** 게임 시작 전 타이틀 화면

**구성:**
- 배경 이미지
- 게임 타이틀 텍스트
- "시작하기" 버튼 → GameScene 전환
- BGM 시작

---

### GameScene

**역할:** 메인 게임 루프

**구성 요소:**

| 요소 | 구현 방식 | 설명 |
|------|-----------|------|
| 배경 | `Phaser.GameObjects.TileSprite` | 무한 좌→우 스크롤 |
| 플레이어 | `Player` 클래스 (Phaser.Physics.Arcade.Sprite) | 달리기/점프 애니메이션 전환 |
| 코인 | `Coin` 클래스 (Phaser.Physics.Arcade.Sprite) | 코드로 텍스처 생성, 오른쪽에서 스폰 |
| UI | `Phaser.GameObjects.Text` + 이미지 | 하트 5개(장식), 코인 카운터 |

**게임 루프 (`update`):**
1. 배경 TileSprite `tilePositionX` 증가 → 스크롤 효과
2. 코인 스폰 타이머: 일정 간격 + 랜덤 높이로 오른쪽 끝에 생성
3. 코인이 왼쪽 화면 밖으로 나가면 destroy
4. 플레이어-코인 overlap 감지 → 코인 수집 처리
5. 수집 카운터 20 도달 → success 애니메이션 → ClearScene 전환

**물리 엔진:** `Phaser.Physics.Arcade` (가벼운 2D 물리)

**플레이어 상태 머신:**

```
RUNNING ──(점프 입력)──▶ JUMPING ──(착지)──▶ RUNNING
RUNNING ──(클리어)────▶ SUCCESS
```

---

### ClearScene

**역할:** 클리어 축하 화면

**구성:**
- 클리어 메시지
- 최종 코인 수
- "다시 하기" 버튼 → GameScene 재시작
- clear_sfx 재생

---

### Player 클래스

```
Player extends Phaser.Physics.Arcade.Sprite
├── animations
│   ├── 'run'     : running/1~11.png, 반복
│   ├── 'jump'    : jump/1~21.png, 1회
│   └── 'success' : success/1~45.png, 반복
├── jump()        : 점프 입력 처리 (공중 재점프 불가)
├── land()        : 착지 감지 → run 애니메이션 복귀
└── celebrate()   : success 애니메이션 재생
```

---

### Coin 클래스

```
Coin extends Phaser.Physics.Arcade.Sprite
├── 텍스처: Graphics API로 황금 원형 코인 생성 (런타임)
├── 스폰 위치: x = 게임 너비 + 50, y = 랜덤 (지면~중간)
├── 이동: velocity.x = -SCROLL_SPEED (배경과 동일 속도)
└── collect(): coin_sfx 재생, destroy
```

---

### constants.ts

```typescript
GAME_WIDTH          = 800
GAME_HEIGHT         = 450
SCROLL_SPEED        = 3          // 배경 스크롤 속도 (px/frame)
COIN_SPEED          = 250        // 코인 이동 속도 (px/s)
COIN_SPAWN_INTERVAL = 1200       // 코인 스폰 간격 (ms)
COIN_TARGET         = 20         // 클리어 조건
PLAYER_JUMP_VY      = -600       // 점프 초속도
GRAVITY             = 800        // 중력
GROUND_Y            = 380        // 지면 Y 좌표
RUN_FPS             = 12         // 달리기 애니메이션 fps
JUMP_FPS            = 18         // 점프 애니메이션 fps
SUCCESS_FPS         = 18         // 성공 애니메이션 fps
HEART_COUNT         = 5          // 하트 개수 (장식)
```

---

### 에셋 로딩 전략

- 스프라이트 프레임을 개별 PNG로 `load.image()` 로드 후 `anims.create()`로 묶음
- 오디오는 `load.audio()`, 재생은 `this.sound.add()`
- 배경은 `load.image()` 후 `add.tileSprite()`

---

### 배포

- `pnpm build` → `dist/` 디렉토리 생성
- 정적 파일만으로 구성 → GitHub Pages, Vercel, Netlify 등 어디든 배포 가능
- base URL 설정은 `vite.config.ts`의 `base` 옵션으로 조정
