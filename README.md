## 📌 프로젝트 개요
- **서비스명:** 모노몬 (Monomon)
- **슬로건:** Find your Pokémon twin with Monomon
- **한 줄 소개:** 사진 업로드 또는 촬영으로 얼굴을 분석해, 가장 닮은 포켓몬을 찾아주는 서비스
- **기획 의도:**  
  - 포켓몬이라는 글로벌 인기 IP와 AI 기반 얼굴 분석의 결합  
  - 기존 닮은꼴 서비스의 낮은 정확도와 단조로운 UI/UX 개선  
  - "정확도 + 재미 + 소유감"을 동시에 제공

---

## 📄 프로젝트 문서
프로젝트의 기획서, 브랜드 가이드, 트러블슈팅, 와이어프레임 등  
상세 내용은 [여기에서 확인](https://literate-blinker-02e.notion.site/221315b8e9748079b0eec66048603c34?source=copy_link)하실 수 있습니다.

---

## 🛠 기술 스택

| 분야 | 기술 | 설명 |
| --- | --- | --- |
| 웹 프레임워크 | **Next.js** + Vercel | SSR/CSR 모두 활용, 반응형 웹 제작에 적합 |
| AI 얼굴 분석 | **[Hugging Face Spaces](https://huggingface.co/spaces/wynter24/pokemon-face-match)** (Python + DeepFace) | 이미지 벡터화 후 얼굴 유사도 분석 |
| 이미지 저장 | **Cloudinary** | 이미지 최적화·저장 및 URL 생성 |
| 데이터 저장 | **Supabase** | 서버리스 DB/스토리지/인증 통합 제공 |
| 포켓몬 데이터 | **PokeAPI** | 공식 포켓몬 이미지·이름·타입 정보 제공 |
| 배포 | **Vercel + GitHub Actions** | CI/CD 자동화 및 빠른 배포 |

---

## 🧪 Demo & API

- **Hugging Face Spaces 데모:** [monomon-face-match](https://huggingface.co/spaces/wynter24/pokemon-face-match)  
- **API 문서:** [Swagger UI](https://wynter24-pokemon-face-match.hf.space/docs)  
- **엔드포인트:** `POST /match`  
- **예시 요청:**
  ```bash
  curl -X POST "https://wynter24-pokemon-face-match.hf.space/match" \
       -H "Content-Type: application/json" \
       -d '{"image_url": "https://res.cloudinary.com/demo/image/upload/sample.jpg"}'

---

## 🔍 분석 방식

1. **이미지 벡터화 및 비교**
   - [Hugging Face Spaces](https://huggingface.co/spaces/wynter24/pokemon-face-match) + DeepFace를 이용해 업로드된 이미지를 벡터화
   - 사전 준비된 포켓몬 캐릭터 이미지 데이터와 비교
2. **유사도 계산**
   - 가장 높은 유사도를 가진 포켓몬을 결과로 선정
3. **결과 처리**
   - 매칭된 포켓몬 정보(PokeAPI 기반)와 유사도 점수를 표시
   - 결과 이미지를 Cloudinary에 저장
   - 공유 링크(Cloudinary URL)를 포함한 결과 데이터(포켓몬 이름, 유사도, 분석 일시 등)를 Supabase에 저장

---

## 📂 주요 기능

- **사진 업로드** (PC/모바일 대응)
- **실시간 촬영** (`getUserMedia` 활용, 웹/모바일 모두 지원)
- **AI 얼굴 분석** (DeepFace)
- **닮은 포켓몬 결과 제공 및 공유**
- **분석 히스토리 조회** (이전 매칭 결과 저장/조회)  

---

## 🚀 향후 확장 계획

- **촬영한 이미지 편집** (crop, 회전, 좌우반전) 
- **실시간 얼굴 필터 적용** (인스타그램 스타일)
- **3D 포켓몬 노출** (랜딩 페이지, 히스토리 페이지)
- **PWA 설치 지원** — 별도 앱 설치 없이 홈 화면에 추가 가능

---

## 📱 서비스 사용 방법

1. **사진 업로드** 또는 **실시간 촬영**  
2. **AI 분석**을 통해 닮은 포켓몬 매칭  
3. **결과 확인** (유사도 점수 + 포켓몬 정보)  
4. **이미지 저장 및 SNS 공유**

---

## 📖 라이선스
본 프로젝트는 포켓몬 공식 라이선스와 무관하며,  
개인 학습 및 포트폴리오 목적으로 제작된 비상업적 팬메이드 서비스입니다.  
포켓몬의 모든 이미지, 이름, 캐릭터 및 관련 자료의 저작권과 상표권은  
ⓒ Nintendo, Creatures Inc., GAME FREAK inc.에 귀속됩니다.

