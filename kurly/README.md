# 컬리 자체 랜딩·직접폼

상태: QA 잠금. 컬리 전용 수신 웹앱과 하류 귀속을 검증하기 전에는 실제 제출을 받지 않는다.

## 미리보기

- A안: `/kurly/?variant=a` — 지급 사례를 업무 조건 다음에 배치
- B안: `/kurly/?variant=b` — 같은 지급 사례를 히어로 바로 다음에 배치
- 쿼리가 없으면 브라우저별로 A/B를 한 번 배정하고 `localStorage`에 고정한다.

## 기본 추적값

| 필드 | 기본값 |
|---|---|
| `content_id` | `AD-20260916-002-801` |
| `source_code` | `kurly-k3-2609-801-a` |
| `utm_campaign` | `kurly_directform_202609` |
| `lp_variant` | `a` |
| `funnel_type` | `LP` |

Meta의 `campaign_id`, `adset_id`, `ad_id`, `campaign_name`, `adset_name`, `ad_name`, UTM 값은 URL 쿼리에서 hidden field로 보존한다. 수신 원장의 `final_content_id`는 `content_id`와 동일하게 기록한다.

## 잠금 해제 조건

1. 컬리 전용 Apps Script 수신기를 별도 웹앱으로 배포한다.
2. `컬리_자체폼` 원장과 `F컬리`/통합DB 귀속을 연결한다.
3. Make 후속 흐름은 생수 시나리오를 추측으로 재사용하지 않고 자동화 담당이 컬리 분기를 확인한다.
4. QA 번호 1건으로 A/B → 원장 → F컬리 → 통합DB를 종단 대조한다.
5. `index.html`의 `body[data-submit-endpoint]`에 검증된 웹앱 URL을 넣고 테스트를 다시 통과한다.

## 공개 전 확인

- 광고 표면 금지어와 과장·보장 표현 0건
- 냉동탑차 기준 유지
- 지급 사례는 `2026년 5월 사례 6건`으로만 설명하고 평균·실수령 보장으로 확대하지 않음
- 모바일 390px, 중복 제출, 미동의, 재동의, 완료 이벤트 검수
