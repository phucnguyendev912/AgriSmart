# Weather Risk OR Logic

## Mo ta yeu cau

Doi logic canh bao benh theo thoi tiet trong `disease_weather_condition`:

- Ap dung cho tat ca benh.
- Mot benh duoc canh bao neu match it nhat mot dieu kien thoi tiet trong group.
- Vi du: nhiet do dung hoac do am dung deu canh bao.
- Khong hien trung mot benh neu nhieu group cung match.

## File se sua

- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseWeatherRiskEvaluator.java`
- `agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/entity/DiseaseWeatherCondition.java`
- `agriai_backend/agriai/src/test/java/com/phucnguyen/agriai/service/DiseaseWeatherRiskEvaluatorTest.java`
- `init.sql`

## Thu tu thuc hien

1. Doi evaluator tu AND sang OR trong cung `condition_group`.
2. Chi dua cac dieu kien da match vao `matchedConditions`.
3. Deduplicate ket qua theo `diseaseId`, uu tien group HIGH.
4. Them seed cho Chay bia la vao `init.sql`.
5. Cap nhat unit test va chay test lien quan.
