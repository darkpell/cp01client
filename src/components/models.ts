/**
 * ExampleComponent에서 사용하는 할 일(Todo) 항목의 데이터 구조.
 *
 * @property id      - 각 할 일 항목을 고유하게 식별하는 숫자 ID.
 *                     {@code v-for}의 {@code :key}로 사용되어 Vue가 DOM을 효율적으로 재사용한다.
 * @property content - 할 일의 내용 문자열.
 */
export interface Todo {
  id: number;
  content: string;
}

/**
 * 목록 조회 시 함께 전달되는 페이지네이션/집계 메타데이터.
 *
 * @property totalCount - 전체 데이터 건수. 페이지네이션 UI(총 페이지 수 계산 등)에 활용된다.
 */
export interface Meta {
  totalCount: number;
}
