# 운동타이머

운동별 시간을 선택해 사용하는 React + Electron 타이머입니다.

- 기본 시간: 5분
- 스트레칭 1분, 런지 3분, 런닝 5분
- 직접 시간 설정, 일시정지·재개, 초기화, 종료 알림 소리
- 최소화 중에도 실제 경과 시간으로 계산

## 웹 실행

```sh
npm install
npm run dev
```

## Windows 앱 실행 및 빌드

```sh
npm run desktop
npm run desktop:dist
```

폴더 형태 앱은 `release/win-unpacked/Onjeonhi Timer.exe`에서 실행합니다. 같은 폴더의 리소스 파일을 함께 유지하세요.
단일 포터블 EXE는 `npm run desktop:portable`로 빌드하며 NSIS 도구가 필요합니다.

## 검증

```sh
npm run desktop:test
```

기본 5분, 운동별 시간 선택, 직접 입력, 완료, 초기화, 일시정지·재개의 시간 정확도를 Electron에서 검사합니다.
PC 절전 중 알림은 지연되며 앱 종료 시 타이머도 종료됩니다.
