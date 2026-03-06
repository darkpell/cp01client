/**
 * 메인 레이아웃의 상단 메뉴 구조 정의.
 *
 * 메뉴를 추가하거나 변경할 때는 이 파일만 수정한다.
 * MainLayout.vue는 이 설정을 읽어 UI를 렌더링한다.
 *
 * 구조:
 *  - 상위 메뉴(MenuConfig): 헤더에 버튼으로 표시
 *  - 하위 메뉴(SubMenuItem): 클릭 시 탭으로 열리는 페이지
 */

export interface SubMenuItem {
  /** 탭 고유 식별자. 동일한 name의 탭은 중복 열리지 않는다. */
  name: string;
  /** 탭 레이블 */
  label: string;
  /** 탭 콘텐츠로 사용할 컴포넌트 이름 (MainLayout의 componentMap 키와 일치) */
  component: string;
  /** 컴포넌트에 전달할 props */
  props?: Record<string, unknown>;
}

export interface MenuConfig {
  /** 상위 메뉴 고유 식별자 */
  id: string;
  /** 헤더 버튼에 표시할 레이블 */
  label: string;
  /** 클릭 시 펼쳐지는 하위 메뉴 목록 */
  children: SubMenuItem[];
}

export const menuConfig: MenuConfig[] = [
  {
    id: 'business',
    label: '업무관리',
    children: [
      {
        name: 'work-status',
        label: '메뉴1',
        component: 'SamplePage',
        props: { pageTitle: '메뉴1' },
      },
      {
        name: 'work-register',
        label: '메뉴2',
        component: 'SamplePage',
        props: { pageTitle: '메뉴2' },
      },
    ],
  },
  {
    id: 'system',
    label: '시스템관리',
    children: [
      {
        name: 'user-mgmt',
        label: '사용자관리',
        component: 'UserManagePage',
      },
      {
        name: 'menu-mgmt',
        label: '메뉴관리',
        component: 'MenuManagePage',
      },
    ],
  },
];
