# Workflow: Weather-based Disease Risk Forecast (Dự báo Nguy cơ Dịch bệnh dựa trên Thời tiết)

Tài liệu này phân tích chi tiết cách hệ thống **AgriSmart** xây dựng tính năng dự báo và cảnh báo nguy cơ dịch bệnh cây lúa bằng cách phân tích các yếu tố thời tiết thời gian thực (Nhiệt độ, Độ ẩm, Lượng mưa), kiến trúc bộ quy tắc đánh giá động (Dynamic Weather Rule Engine) ở backend và giao diện tích hợp định vị GPS thông minh ở frontend.

---

## 1. Tổng quan chức năng

Dịch bệnh cây trồng (đặc biệt là cây lúa nước) phụ thuộc rất lớn vào điều kiện thời tiết. Độ ẩm không khí cao kết hợp với nhiệt độ ấm là môi trường lý tưởng để bào tử nấm đạo ôn hay vi khuẩn bạc lá bùng phát. Tính năng này tự động đánh giá và đưa ra cảnh báo sớm giúp nông dân chủ động phun phòng ngừa.

### Các mảnh ghép cấu thành tính năng:
1. **Định vị & Ghi nhớ vị trí (GPS & Location Registry):** Lấy vị trí GPS hiện tại của nông dân qua trình duyệt, nếu không có quyền GPS thì cung cấp dropdown chọn Tỉnh thành thủ công và lưu lại trong `localStorage`.
2. **Tích hợp API Thời tiết (Weather API integration):** Backend gọi dịch vụ thời tiết thông qua cổng kết nối `WeatherPort` để lấy thông số Nhiệt độ (°C), Độ ẩm (%), Lượng mưa (mm) hiện tại của tọa độ đó.
3. **Bộ đánh giá quy tắc thời tiết động (Dynamic Weather Rule Engine):** Backend duyệt qua các điều kiện quy tắc lưu trong DB (`DiseaseWeatherCondition`) để chấm điểm và phân loại mức độ rủi ro (Cao hoặc Trung bình) kèm khuyến cáo xử lý.
4. **Hiển thị Cảnh báo Trực quan (Warning Dashboard):** UI React hiển thị các thẻ nguy cơ nổi bật kèm theo chi tiết chỉ số thời tiết hiện tại và cảnh báo của từng loại bệnh hại.

---

## 2. Workflow tổng thể

Dưới đây là sơ đồ luồng hoạt động trực quan dạng Text mô tả luồng Tải cảnh báo thời tiết dịch bệnh:

### 2.4. Luồng Xử lý và hiển thị Dự báo nguy cơ dịch bệnh (Weather Disease Risk Workflow)

```
[ Nông dân mở ứng dụng / Landing Page ]
        │ (1) React (WeatherDiseaseSection.jsx) khởi chạy
        ▼
[ React (WeatherDiseaseSection.jsx) ]
        │
        ├─(2) Đọc vị trí từ localStorage (saved GPS / provinceId).
        ├─(3) Nếu chưa có vị trí lưu:
        │     - Hiển thị LocationPermissionModal yêu cầu quyền GPS.
        │     - Nếu Nông dân ALLOW: Lấy tọa độ GPS thiết bị (coords.latitude, coords.longitude).
        │     - Nếu Nông dân DENY: Sử dụng Tỉnh mặc định (DEFAULT_PROVINCE - An Giang).
        │
        ├─(4) Gọi API backend: GET /api/weather/disease-risks?latitude=X&longitude=Y
        ▼
[ Backend (WeatherDiseaseRiskController.java) ]
        │ (5) Nhận request. Gọi weatherDiseaseRiskService.getDiseaseRisks(lat, lon)
        ▼
[ WeatherDiseaseRiskService.java ]
        │ (6) Gọi weatherPort.getCurrentWeather(lat, lon) lấy dữ liệu thời tiết thực tế
        ▼
[ Open-Meteo API / Weather Service ]
        │ (7) Trả về JSON chứa: Nhiệt độ, Độ ẩm, Lượng mưa hiện tại.
        ▼
[ WeatherDiseaseRiskService.java ]
        │ (8) Chuyển giao dữ liệu thời tiết cho [DiseaseWeatherRiskEvaluator] để đánh giá rủi ro
        ▼
[ DiseaseWeatherRiskEvaluator.java ]
        │
        ├─(9) Lấy danh sách các điều kiện quy tắc đang kích hoạt từ Database:
        │     - Gọi conditionRepository.findByIsActiveTrueAndIsDeleteFalse()
        │
        ├─(10) Nhóm các điều kiện theo (DiseaseId, ConditionGroup).
        │
        ├─(11) So khớp từng nhân tố thời tiết bằng [WeatherFactor] lambda extractor và phép toán so sánh:
        │      - Kiểm tra: TEMPERATURE, HUMIDITY, RAINFALL
        │      - Áp dụng toán tử: GREATER_THAN, LESS_THAN, BETWEEN, EQUALS
        │
        ├─(12) Gom cụm và lọc trùng lặp bệnh hại [deduplicateByDisease]:
        │      - Nếu bệnh khớp nhiều nhóm rủi ro, ưu tiên lấy mức độ cao nhất (HIGH > MEDIUM > LOW).
        │      - Sinh chuỗi mô tả cụ thể về ngưỡng điều kiện (Ví dụ: "Độ ẩm: 88% (nguong >80%)").
        ▼
[ React (WeatherDiseaseSection.jsx) ]
        │ (13) Nhận Response JSON 200 OK.
        │
        ├─(14) Hiển thị các chỉ số thời tiết (Nhiệt độ, Độ ẩm, Lượng mưa) dạng thẻ tròn.
        ├─(15) Phân nhóm bệnh hại:
        │      - Bệnh nguy cơ HIGH: Render thẻ màu đỏ lớn, hiển thị khuyến cáo chi tiết phòng ngừa.
        │      - Bệnh nguy cơ MEDIUM: Render dòng màu vàng nhỏ gọn hơn.
        │
        └─(16) Người dùng click "Chi tiết bệnh" -> Mở Dialog nổi hiển thị định nghĩa bệnh hại.
```

---

## 3. Phân tích source code

### 3.1. Các Class quan trọng phía Backend

#### A. [WeatherDiseaseRiskController.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/WeatherDiseaseRiskController.java)
* **Vai trò:** Cung cấp API duy nhất `/api/weather/disease-risks` nhận tọa độ `latitude` và `longitude` từ query parameters để trả về dữ liệu rủi ro dịch bệnh.

#### B. [WeatherDiseaseRiskService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/WeatherDiseaseRiskService.java)
* **Vai trò:** Phối hợp giữa Adapter gọi API thời tiết ngoài và Engine đánh giá quy tắc thời tiết.
* **Đặc điểm thiết kế:** Đánh dấu `@Transactional(readOnly = true)` để tối ưu hóa hiệu năng đọc cơ sở dữ liệu.

#### C. [DiseaseWeatherRiskEvaluator.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/DiseaseWeatherRiskEvaluator.java)
* **Vai trò:** Trái tim của module dự báo - Bộ đánh giá quy tắc động (Dynamic Weather Rule Engine).
* **Hàm cốt lõi:**
  * `evaluateGroup(conditions, weather)`: Nhận vào danh sách điều kiện và kiểm tra so khớp với thời tiết hiện tại. Nếu khớp, tự động sinh chuỗi mô tả điều kiện khớp.
  * `choosePreferredRisk(current, candidate)`: Giải quyết xung đột ưu tiên (Risk Priority Resolution). Nếu một loại bệnh khớp cả điều kiện rủi ro cao và rủi ro trung bình, ưu tiên giữ lại rủi ro cao nhất (`HIGH` > `MEDIUM` > `LOW`) để cảnh báo kịp thời cho nông dân.

#### D. [WeatherFactor.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/enums/WeatherFactor.java)
* **Vai trò:** Enum đại diện cho các yếu tố thời tiết (Nhiệt độ, Độ ẩm, Lượng mưa).
* **Đặc điểm thiết kế:** Sử dụng functional interface `Function<WeatherDTO, Double> extractor` để đóng gói logic lấy dữ liệu (Method Reference) trực tiếp vào enum hằng số, loại bỏ hoàn toàn các cấu trúc `if-else` hay `switch-case` lặp đi lặp lại.

---

### 3.2. Các Component quan trọng phía Frontend

#### A. [WeatherDiseaseSection.jsx](file:///d:/AgriAI/agriai_frontend/src/features/landing/components/WeatherDiseaseSection.jsx)
* **Vai trò:** Component giao diện hiển thị bảng dự báo thời tiết và nguy cơ dịch bệnh.
* **Logic xử lý:**
  * Quản lý trạng thái định vị (`isLocating`), trạng thái loading (`isLoading`), hiển thị cảnh báo lỗi nếu API thời tiết ngoài gặp sự cố.
  * Tích hợp lưu trữ LocalStorage để tối ưu hóa thời gian tải trang (Lần truy cập thứ hai sẽ đọc tỉnh thành lưu trước đó, không bắt người dùng cấp quyền GPS lại từ đầu).

---

## 4. Giải thích kỹ thuật sử dụng trong code

### 4.1. Thiết kế Hướng chức năng (Functional Programming) trong Enum Java
Trong `WeatherFactor.java`:
```java
public enum WeatherFactor {
    TEMPERATURE("Nhiệt độ", WeatherDTO::getTemperature),
    HUMIDITY("Độ ẩm", WeatherDTO::getHumidity),
    RAINFALL("Lượng mưa", WeatherDTO::getRainfall);

    public final String displayName;
    private final Function<WeatherDTO, Double> extractor;
    ...
    public Double extract(WeatherDTO weather) {
        return weather != null ? extractor.apply(weather) : null;
    }
}
```
* **Giải thích:** Thay vì viết hàm dịch dạng switch-case:
  ```java
  public Double extract(WeatherDTO weather, WeatherFactor factor) {
      switch(factor) {
          case TEMPERATURE: return weather.getTemperature();
          ...
      }
  }
  ```
  Việc lưu trực tiếp một lambda extractor `Function<WeatherDTO, Double>` vào từng hằng số enum giúp code tuân thủ hoàn hảo nguyên lý **Open-Closed Principle (OCP)** trong SOLID. Khi cần thêm yếu tố thời tiết mới (ví dụ: tốc độ gió), ta chỉ cần khai báo thêm một hằng số enum kèm getter tương ứng của DTO, hoàn toàn không cần chỉnh sửa bất kỳ logic so khớp hay xử lý nào khác.

### 4.2. Giải pháp Dynamic Rule Engine (Động cơ Quy tắc Động)
* **Tại sao thiết kế như vậy?** Nếu chúng ta viết cứng điều kiện trong code: `if (weather.getHumidity() > 80 && weather.getTemperature() > 25) { warning("Đạo ôn"); }`, khi các chuyên gia nông nghiệp muốn điều chỉnh lại ngưỡng nhiệt độ (ví dụ nâng lên thành 26°C do giống lúa mới kháng thuốc), chúng ta sẽ phải sửa code Java, chạy lại quy trình kiểm thử và deploy lại toàn bộ ứng dụng Backend.
* **Giải pháp của Senior:** Lưu trữ toàn bộ quy tắc (Toán tử so sánh, Giá trị min, Giá trị max, Lời khuyên) trong bảng Database `disease_weather_condition`. Lớp `DiseaseWeatherRiskEvaluator` chỉ chịu trách nhiệm thông dịch các điều kiện này thời gian thực. Admin hệ thống có thể điều chỉnh các ngưỡng quy tắc ngay lập tức trên cơ sở dữ liệu mà không cần can thiệp vào mã nguồn.

---

## 5. Database & Query Analysis

### 5.1. Phân tích Thực thể Cấu hình Điều kiện Thời tiết (DiseaseWeatherCondition Schema)

Bảng `disease_weather_condition` chứa các quy tắc cấu hình:
* `id`: Khóa chính.
* `disease_id`: Khóa ngoại liên kết bảng `disease` (bệnh lúa).
* `weather_factor`: Lưu dạng String của Enum `WeatherFactor` (TEMPERATURE, HUMIDITY, RAINFALL).
* `operator`: Toán tử so sánh (GREATER_THAN, LESS_THAN, BETWEEN, EQUALS).
* `min_value` / `max_value`: Ngưỡng số trị (BigDecimal để tránh sai số dấu phẩy động).
* `condition_group`: Nhóm mức độ rủi ro (Ví dụ: "HIGH_RISK", "MEDIUM_RISK").
* `recommendation_note`: Lời khuyên nông nghiệp (Ví dụ: "Giảm phân đạm, giữ mực nước ruộng từ 3-5cm").
* `is_active` / `is_delete`: Cờ trạng thái hoạt động/xóa mềm.

---

## 6. Kiến trúc & Design Pattern

### 6.1. Strategy Pattern / Rule Engine Pattern
* Bằng cách tách biệt các điều kiện thời tiết ra các bản ghi Database và sử dụng `WeatherFactor` kết hợp `Operator` để tính toán động, hệ thống đã triển khai một biến thể của **Strategy Pattern** (Mỗi điều kiện thời tiết là một chiến lược kiểm tra logic độc lập). Engine có thể tự động áp dụng hàng trăm quy tắc phức tạp khác nhau cho một tập dữ liệu thời tiết đầu vào một cách tuần tự và thống nhất.

---

## 7. Điểm chưa tối ưu (Technical Debt)

### 7.1. Gọi API Thời tiết Ngoài Đồng bộ (Blocking Weather API Call)
* **Giải thích:** Khi gọi API `/api/weather/disease-risks`, Backend Spring Boot phải gọi API bên thứ ba Open-Meteo qua HTTP đồng bộ (Blocking HTTP request). Nếu Open-Meteo phản hồi chậm hoặc bị đứt cáp quang biển, luồng xử lý của Tomcat sẽ bị giữ lại để chờ đợi (Blocking thread), làm tăng thời gian phản hồi của API hệ thống.
* **Tác hại:** Có khả năng nghẽn hệ thống nếu lượng truy cập cùng lúc quá lớn.

---

## 8. Hướng tối ưu (Refactoring Code)

### 8.1. Tích hợp Caching Redis cho Dữ liệu Thời tiết Tọa độ (Redis Geo-Spatial Caching)
**Giải pháp:** Thời tiết tại một địa điểm thường không thay đổi quá nhanh trong vòng 30 phút. Do đó, chúng ta có thể lưu bộ nhớ đệm (Cache) kết quả thời tiết Open-Meteo vào Redis theo cặp khóa tọa độ làm tròn (ví dụ làm tròn tọa độ đến 2 chữ số thập phân ~ tương đương bán kính 1.1km). Nếu có yêu cầu khác trong cùng khu vực trong vòng 30 phút, hệ thống trả về ngay từ Redis Cache mà không cần gọi API ngoài.

#### [TRƯỚC] Gọi API thời tiết Open-Meteo trực tiếp cho mọi lượt tải trang
```java
WeatherDTO weather = weatherPort.getCurrentWeather(latitude, longitude);
```

#### [SAU] Tích hợp Redis Caching cho tọa độ làm tròn
```java
double roundLat = Math.round(latitude * 100.0) / 100.0;
double roundLon = Math.round(longitude * 100.0) / 100.0;
String cacheKey = String.format("weather:%.2f:%.2f", roundLat, roundLon);

WeatherDTO weather = redisTemplate.opsForValue().get(cacheKey);
if (weather == null) {
    weather = weatherPort.getCurrentWeather(latitude, longitude);
    redisTemplate.opsForValue().set(cacheKey, weather, 30, TimeUnit.MINUTES);
}
```

---

## 9. Mindset của Senior Developer

1. **Thiết kế hướng tới Trải nghiệm người dùng di động (Mobile-First UX):** Nông dân thường sử dụng điện thoại thông minh ngay tại ruộng lúa để chụp ảnh và tra cứu. Việc component React hỗ trợ xin quyền GPS trực tiếp (`my_location`), tự nhận diện Tỉnh thành gần nhất (`findNearestProvince`) và tự động lưu lại vào `localStorage` giúp nông dân tối giản thao tác, không phải nhập chữ hay chọn vùng thủ công phiền phức.
2. **Không báo động giả (Alert Fatigue Mitigation):** Trong thuật toán `choosePreferredRisk`, Senior đã thiết kế việc khử trùng lặp theo loại bệnh (`deduplicateByDisease`). Nếu một loại bệnh thỏa mãn nhiều điều kiện cảnh báo, hệ thống chỉ hiển thị duy nhất 1 cảnh báo nguy cơ cao nhất kèm lời khuyên tổng hợp, tránh dội hàng loạt cảnh báo trùng lặp gây hoang mang và chai lỳ cảm giác cảnh giác của nông dân.

---

## 10. Kết luận cho feature

Cơ chế dự báo nguy cơ bệnh hại dựa trên thời tiết là một tính năng cực kỳ thông minh của hệ thống **AgriSmart**. Nhờ kiến trúc thiết kế quy tắc động linh hoạt ở Backend Spring Boot kết hợp với giao diện định vị địa lý tự động và UX mượt mà ở React Frontend, hệ thống cung cấp một giải pháp cảnh báo sớm dịch hại đáng tin cậy với chi phí tích hợp bằng không.
