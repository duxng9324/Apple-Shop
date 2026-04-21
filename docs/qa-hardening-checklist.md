# QA Quick Checklist - Hardening Flows

## 1. Global Error Contract
1. Call an invalid endpoint and verify response JSON has: `code`, `message`, `timestamp`, `path`.
2. Trigger bad request (missing required field) and verify HTTP `400` with `code=BAD_REQUEST`.
3. Trigger not found resource and verify HTTP `404` with `code=NOT_FOUND`.
4. Trigger unauthorized by removing token and verify HTTP `401` with `code=UNAUTHORIZED`.
5. Trigger forbidden with non-admin role for admin API and verify HTTP `403` with `code=FORBIDDEN`.

## 2. User Management Flow
1. Login with wrong password and verify HTTP `401` + friendly FE error message.
2. Open user detail as another non-admin user and verify `403`.
3. Batch update roles as admin and verify success/fail count message.
4. Batch update roles with empty list and verify `400 BAD_REQUEST`.

## 3. Inventory Concurrency Flow
1. Open 2 browser tabs as warehouse/admin user.
2. Submit stock issue/adjust on same product-memory concurrently from both tabs.
3. Verify one request succeeds and the conflict request returns HTTP `409`.
4. Verify FE shows conflict warning and retries once automatically.

## 4. Warehouse / Stock Receipt / Stock Issue
1. Create receipt with missing `warehouseId` and verify `400`.
2. Create receipt with unknown `categoryCode`/`color` and verify `404`.
3. Create issue with insufficient inventory and verify `409 CONFLICT`.
4. Create issue/receipt with valid data and verify success + inventory quantity updated correctly.

## 5. Frontend Interceptor Behavior
1. Force `401` from API and verify redirect to login.
2. Force `403` and verify Ant Design error toast appears.
3. Force `404` and verify not-found toast appears.
4. Force `409` and verify warning toast appears.
5. Force network disconnect and verify network error toast appears.

## 6. Regression Smoke
1. Backend build: `mvn -DskipTests compile` should pass.
2. Frontend build: `npm run build` should pass.
3. Login -> admin routes -> warehouse operations -> accounting page should remain functional.
