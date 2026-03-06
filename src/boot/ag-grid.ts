// ────────────────────────────────────────────────────────────────────────────
// AG Grid 모듈 등록
//
// Community 버전 (현재 — 무료/MIT)
// ────────────────────────────────────────────────────────────────────────────
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

// ────────────────────────────────────────────────────────────────────────────
// Enterprise 전환 시 위 3줄을 아래 코드로 교체:
//
// import { ModuleRegistry, AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
// if (import.meta.env.VITE_AG_GRID_LICENSE_KEY) {
//   LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY);
// }
// ModuleRegistry.registerModules([AllEnterpriseModule]);
//
// package.json: "ag-grid-community" → "ag-grid-enterprise" 로 교체
// ────────────────────────────────────────────────────────────────────────────

export default {};
