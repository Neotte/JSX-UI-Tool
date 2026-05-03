# Local JSX Asset Designer

React JSX로 정적 UI 컴포넌트를 작성하고, 로컬 Electron 앱에서 미리 본 뒤 투명 PNG로 내보내는 도구입니다. 게임 UI, 방송 오버레이, 비주얼노벨 UI, 프레젠테이션용 이미지처럼 “코드로 만든 UI 에셋”을 빠르게 PNG로 뽑는 데 맞춰져 있습니다.

## 빠른 시작

Windows에서는 아래 파일 중 하나를 더블클릭합니다.

```bat
run-dev.bat
```

개발 모드로 Vite dev server와 Electron 앱을 함께 실행합니다.

```bat
run-app.bat
```

프로덕션 빌드를 만든 뒤 Electron 앱을 실행합니다.

`.tools\node` 폴더에 portable Node가 있으면 우선 사용하고, 없으면 시스템에 설치된 Node.js LTS를 사용합니다.

## 터미널 실행

```bash
npm install
npm run start
```

빌드 확인:

```bash
npm run build
npm run electron:start
```

QA 스모크 테스트:

```bash
npm run qa:smoke
```

`qa:smoke`는 로드아웃 저장/불러오기, PNG export, 갤러리 목록 조회를 Electron IPC 경로로 확인합니다.

## 화면 구성

앱은 3개 탭으로 구성됩니다.

- 작업 구역: JSX 입력, preview, 해상도 설정, PNG 내보내기
- 로드아웃: 현재 JSX와 해상도 저장/불러오기
- 갤러리: `exports` 폴더의 PNG 목록 확인과 확대 보기

## 튜토리얼

1. 앱을 실행합니다.

`run-dev.bat`을 더블클릭하거나 터미널에서 `npm run start`를 실행합니다.

2. 작업 구역에서 JSX를 수정합니다.

기본 예시는 `function Component() { ... } export default Component;` 형태입니다. JSX를 수정하면 preview가 갱신됩니다.

3. 해상도를 설정합니다.

작업 구역 오른쪽의 `width`, `height` 값을 입력합니다. 기본값은 `1920 x 1080`입니다. 허용 범위는 `1`부터 `8192`까지의 정수입니다.

4. PNG를 내보냅니다.

`내보내기` 버튼을 누르고 파일명을 입력합니다. 정렬 옵션은 두 가지입니다.

- `캔버스 중앙`: 지정한 해상도는 유지하고 컴포넌트를 중앙에 배치합니다.
- `컴포넌트 크롭`: 지정 해상도 안에서 렌더링한 뒤 실제 컴포넌트 영역만 잘라 저장합니다.

생성된 파일은 `exports/{name}.png`에 저장됩니다. PNG는 투명 배경 RGBA 이미지입니다.

5. 작업 상태를 저장합니다.

`로드아웃` 탭에서 이름을 입력하고 `로드아웃 저장`을 누릅니다. 파일은 `saves/{name}.json`에 저장됩니다.

6. 작업 상태를 다시 불러옵니다.

`로드아웃` 탭의 목록에서 저장한 항목을 선택하면 JSX와 해상도가 작업 구역으로 복원됩니다.

7. export 결과를 확인합니다.

`갤러리` 탭에서 `exports` 폴더의 PNG를 이름순으로 확인할 수 있습니다. 카드를 클릭하면 확대 보기로 열립니다.

## JSX 작성 규칙

권장 형태:

```jsx
function Component() {
  return (
    <div style={{
      width: 800,
      height: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 40,
      background: "rgba(20, 20, 28, 0.92)",
      color: "white",
      fontSize: 56,
      fontWeight: 700
    }}>
      Sample UI Asset
    </div>
  );
}

export default Component;
```

현재 정책상 아래 코드는 제한됩니다.

- React Hook: `useState`, `useEffect`, `useMemo`, `useRef` 등
- 네트워크 요청: `fetch`, `XMLHttpRequest`, `WebSocket`
- Node/runtime 접근: `require`, `process`, `globalThis`
- 위험 실행: `eval`, `Function`
- 동적 import와 내부 API 접근

## 파일 저장 위치

- 로드아웃: `saves/*.json`
- PNG export: `exports/*.png`
- 빌드 결과: `dist/`
- 의존성: `node_modules/`
- portable Node: `.tools/node/`

앱 시작 시 `saves`와 `exports` 폴더가 없으면 자동 생성됩니다.

## 보안 주의

이 도구는 로컬 작업용 JSX 렌더링 도구입니다. 신뢰할 수 없는 JSX 코드를 실행하지 마십시오. renderer는 파일 시스템에 직접 접근하지 않고, Electron preload가 공개한 allowlist IPC만 사용합니다.
