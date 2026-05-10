# Integrate RuleEngine History Recommendations

## Mo ta yeu cau

Cap nhat luong diagnose de tiep tuc dung `RuleEngineService` lam service tong hop treatment/risk, va doi co che luu history tu JSON `treatmentData` sang bang trung gian `diagnose_treatment_recommendation`.

## Pham vi

- Giu `DiagnoseService` goi `RuleEngineService.process(...)`.
- Cap nhat `DiagnoseHistoryPersistenceService` de luu treatment recommendation theo tung `DiagnoseHistoryDetail`.
- Tao/sua repository can thiet cho `DiagnoseTreatmentRecommendation`.
- Neu can, dong bo mapping entity voi ten bang DB `diagnose_treatment_recommendation`.
- Khong luu `weatherRisks`, `interactionSummary`, `sprayPrograms` vao DB; compute realtime khi can.
- Khong tiep tuc ghi snapshot moi vao `DiagnoseHistoryDetail.treatmentData`.
- Quyet dinh moi: khong them `rank_position` va `recommended` vao `init.sql`.

## File du kien sua / tao

- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryPersistenceService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiagnoseHistoryService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/TreatmentRankingService.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/dto/TreatmentDTO.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiagnoseTreatmentRecommendation.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiagnoseTreatmentRecommendationRepository.java`
- `init.sql`
- Test lien quan neu bi lech constructor/contract.

## Van de hien tai can xu ly

1. `DiagnoseHistoryService` van doc `DiagnoseHistoryDetail.treatmentData` de rebuild history detail.
   - Vi diagnosis moi khong ghi `treatmentData`, API xem lai detail se khong tra duoc treatments tu bang moi.
   - Can doc treatment recommendations qua `DiagnoseTreatmentRecommendationRepository`.
2. `DiagnoseTreatmentRecommendation` entity hien co `rank` va `recommended`, nhung `init.sql` khong co `rank_position` va `recommended`.
   - Quyet dinh: khong update `init.sql` them 2 cot nay.
   - Can dong bo nguoc lai entity/persistence/DTO: bo dung 2 field nay hoac mark khong map DB neu van can tinh runtime.
3. `rank_score` dang lay tu `TreatmentDTO.rank`, sai y nghia.
   - `rank_score` nen la diem cham score cua ranking.
   - Hien `TreatmentDTO` chua giu score that, can bo sung score runtime hoac doi `TreatmentRankingService` tra object co score.
4. `DiagnoseTreatmentRecommendationRepository` moi chi extends `JpaRepository`.
   - Can them query lay recommendation theo `detail_id` hoac list `detail_id`.
   - Nen fetch/join `TreatmentPlan`, `Disease`, `Drug` de tranh N+1 khi rebuild response.
5. `weatherRisks`, `interactionSummary`, `sprayPrograms` khong luu DB theo Option A.
   - Luong get detail history can compute realtime khi can, hien chua goi lai `RuleEngineService`.
6. Backend test hien fail o compile.
   - `DiagnoseServiceTest` va `RuleEngineServiceTest` dang theo constructor/contract cu cua `RuleEngineResult`.
   - Can cap nhat test sau khi chot contract moi.

## Thu tu thuc hien

1. Doc luong hien tai cua `DiagnoseService`, `RuleEngineService`, `DiagnoseHistoryPersistenceService`.
2. Dong bo schema/entity theo quyet dinh khong dung `rank_position` va `recommended` trong DB.
3. Cap nhat `TreatmentRankingService`/DTO de expose score that cho `rankScore`.
4. Tao repository query cho `DiagnoseTreatmentRecommendation` neu chua co.
5. Sau khi save `DiagnoseHistoryDetail`, map treatments theo `diseaseId` cua detail.
6. Insert recommendation rows voi:
   - `diagnoseHistoryDetail`
   - `treatmentPlan` tham chieu bang `treatmentPlanId`
   - `rankScore` lay tu score that cua ranking, khong lay tu rank/order
7. Cap nhat `DiagnoseHistoryService.getDetail` de doc treatments tu bang moi thay vi `treatmentData`.
8. Neu can tra `weatherRisks`, `interactionSummary`, `sprayPrograms` khi xem lai, compute realtime bang `RuleEngineService`.
9. Khong ghi treatment snapshot moi vao deprecated `treatmentData`; chi giu cac field khac can thiet.
10. Cap nhat test bi lech constructor/contract va chay compile/test muc service.

## Cau hoi xac nhan

Voi luong moi, `DiagnoseHistoryDetail.treatmentData` se de `null` cho diagnosis moi, va treatment list duoc doc qua bang `diagnose_treatment_recommendation`.

Can xac nhan them: DB chi luu `rank_score` hay van can luu thu tu hien thi/recommended o dau khac? Neu khong luu, `rank` va `recommended` se duoc tinh lai realtime khi doc history.
