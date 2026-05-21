# Workflow: Interactive Disease Mapping & Geocoding (Bản đồ Dịch bệnh Tương tác & Định vị Địa lý)

Tài liệu này phân tích chi tiết cách hệ thống **AgriSmart** xây dựng tính năng Bản đồ dịch bệnh tương tác thời gian thực, cơ chế định vị địa lý ngược bất đồng bộ (Asynchronous Reverse Geocoding) thông qua OpenStreetMap Nominatim, giải pháp đẩy thông báo WebSocket để gợi ý vùng canh tác và kỹ thuật tối ưu hóa render hàng ngàn điểm dịch bằng thuật toán Supercluster.

---

## 1. Tổng quan chức năng

Bản đồ dịch bệnh nông nghiệp giúp cơ quan quản lý và nông dân theo dõi trực quan sự phân bố địa lý các ca bệnh thực tế được chẩn đoán bởi AI trên toàn quốc theo thời gian thực.

### Các mảnh ghép cấu thành tính năng:
1. **Bản đồ tương tác (Leaflet Map):** Hiển thị bản đồ nền OpenStreetMap để định vị trực quan các ổ dịch bệnh.
2. **Kỹ thuật gom cụm (Supercluster Algorithm):** Gom nhóm hàng trăm ổ dịch gần nhau trên màn hình thành các bong bóng hiển thị số lượng ca bệnh, tránh rối mắt và quá tải trình duyệt.
3. **Định vị địa lý ngược bất đồng bộ (Asynchronous Geocoding):** Khi nông dân chẩn đoán ảnh chụp có tọa độ GPS, hệ thống chạy luồng nền gọi dịch vụ OpenStreetMap Nominatim để dịch Lat/Lng thành địa chỉ xã/huyện/tỉnh thực tế.
4. **Gợi ý vùng canh tác qua WebSocket (WebSocket Farming Area Suggestion):** Nếu phát hiện tọa độ chụp ảnh là một địa điểm mới chưa có trong danh mục vùng vườn của nông dân, hệ thống tạo bản ghi vùng canh tác ở trạng thái "Chờ xác nhận" và lập tức bắn thông báo đẩy WebSocket về trình duyệt để nông dân lưu lại.

---

## 2. Workflow tổng thể

Dưới đây là sơ đồ luồng hoạt động trực quan dạng Text mô tả luồng Định vị ngược ở luồng nền và luồng Tải bản đồ dịch bệnh gom cụm:

### 2.2. Luồng Định vị địa lý ngược & Gợi ý vùng canh tác bất đồng bộ (Geocoding & WebSocket Push)

```
[ Nông dân chụp ảnh & Gửi chẩn đoán ]
        │ (1) Ảnh chụp chứa metadata GPS (latitude, longitude)
        ▼
[ Backend (DiagnoseService.java) ]
        │ (2) Chạy luồng nền bất đồng bộ (runGeocodingInBackground)
        ▼
[ GeocodingService.java ]
        │ (3) Gọi NominatimAdapter.reverseGeocode(lat, lon)
        ▼
[ Nominatim API (OpenStreetMap) ]
        │ (4) Trả về JSON địa chỉ chi tiết (Tỉnh, Huyện, Xã, Quốc gia)
        ▼
[ GeocodingService.java ]
        │
        ├─(5) Loại bỏ các trường thừa (country, postcode,...) để tạo địa chỉ rút gọn (shortAddress).
        │
        ├─(6) Kiểm tra xem user đã có vùng canh tác trùng địa chỉ rút gọn này chưa.
        │     - Nếu ĐÃ CÓ: Kết thúc luồng (De-duplication).
        │     - Nếu CHƯA CÓ: Lưu AreaInfor mới ở trạng thái gợi ý (confirmed = false).
        │
        ├─(7) Sử dụng [SimpMessagingTemplate] đẩy message về hàng đợi WebSocket của user:
        │     Đường dẫn: /queue/location-confirm
        │     Nội dung: "Địa chỉ khu vực canh tác của bạn ở: X. Hãy vào xác nhận!"
        ▼
[ React Client (ChatBotWidget hoặc Layout) ]
        │ (8) Nhận message WebSocket -> Hiển thị Pop-up thông báo nổi (Notification Toast)
        ▼
[ Nông dân click vào thông báo -> Chuyển hướng đến trang FarmingArea để đặt tên và xác nhận ]
```

### 2.3. Luồng Truy vấn Bản đồ dịch bệnh gom cụm (Supercluster Leaflet Map Workflow)

```
[ Nông dân mở trang Bản đồ dịch bệnh ]
        │ (1) Khởi chạy React (DiseaseMapPage.jsx)
        ▼
[ React (DiseaseMapPage.jsx) ]
        │ (2) Gọi API GET /api/map/markers?days=30
        ▼
[ Backend (DiseaseMapController.java) ]
        │ (3) Nhận request. Gọi diseaseMapService.getMarkers(days, diseaseId)
        ▼
[ DiseaseMapRepository.java ]
        │ (4) Chạy JPQL query sử dụng Constructor Projection:
        │     SELECT new MapMarkerResponse(det.id, h.id, h.latitude, h.longitude, d.id, d.diseaseName, h.createdAt, ai.province)
        │     JOIN h.areaInfor ai để lấy thông tin tỉnh thành phát hiện dịch.
        ▼
[ React (DiseaseMapPage.jsx) ]
        │ (5) Nhận danh sách markers dạng mảng phẳng (Flat Array).
        │     - Sử dụng [useMapClusters] để chuyển đổi dữ liệu thô sang GeoJSON chuẩn [lng, lat].
        │     - Gọi thư viện [useSupercluster] kết hợp [MapEventHandler] lắng nghe zoom/bounds
        │       để tính toán các cụm điểm động trên màn hình (Radius = 75px).
        ▼
[ Render bản đồ Leaflet ]
        ├─ Nếu là điểm đơn: Vẽ CircleMarker màu đỏ (#EF4444)
        └─ Nếu là cụm điểm: Vẽ ClusterMarker dạng hình tròn động:
           - Màu sắc động: >= 50 ca (Đỏ), >= 10 ca (Vàng), < 10 ca (Xanh).
           - Kích thước động: Dùng logarit Math.min(36 + Math.log2(count+1) * 6, 64)
           - Click vào: map.flyTo bay mượt mà 0.6s mở rộng cụm thành điểm đơn.
```

---

## 3. Phân tích source code

### 3.1. Các Class quan trọng phía Backend

#### A. [DiseaseMapController.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/controller/DiseaseMapController.java)
* **Vai trò:** Cung cấp API tải danh sách marker dịch bệnh (`/api/map/markers`) và danh sách loại bệnh hại để lọc (`/api/map/diseases`).

#### B. [DiseaseMapRepository.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/repository/DiseaseMapRepository.java)
* **Vai trò:** Truy vấn trực tiếp cơ sở dữ liệu để lấy các điểm chẩn đoán dịch bệnh.
* **Đặc điểm thiết kế:**
  * Sử dụng **Constructor Projection** (`SELECT new com.phucnguyen.agriai.dto.MapMarkerResponse(...)`) giúp tăng tốc độ truy vấn đáng kể vì Hibernate không cần nạp toàn bộ thực thể (Entities) vào Persistence Context mà ánh xạ trực tiếp thành các DTO mỏng để trả về JSON.
  * Chỉ lọc các bản ghi có tọa độ `latitude` và `longitude` khác NULL, chưa bị xóa mềm (`isDelete = false`).

#### C. [GeocodingService.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/service/GeocodingService.java)
* **Vai trò:** Điều phối tác vụ định vị địa lý ngược bất đồng bộ.
* **Logic xử lý:** Gọi cổng kết nối Nominatim, chạy thuật toán lọc trùng lặp dữ liệu (De-duplication) theo địa chỉ rút gọn để tránh rác DB, lưu vào `AreaInfor` và đẩy thông báo đẩy thời gian thực qua WebSocket.

#### D. [NominatimAdapter.java](file:///d:/AgriAI/agriai_backend/agriai/src/main/java/com/phucnguyen/agriai/adapter/NominatimAdapter.java)
* **Vai trò:** Thực hiện kết nối HTTP sang dịch vụ OpenStreetMap Nominatim.
* **Đặc điểm thiết kế:**
  * Lọc sạch dữ liệu địa lý thừa (mã bưu chính, quốc gia, vùng hành chính phụ) để ghép thành `shortAddress` thôn/xã/huyện sạch sẽ.
  * Đặt User-Agent liên hệ rõ ràng tránh bị API chặn request.

---

### 3.2. Các Component quan trọng phía Frontend

#### A. [DiseaseMapPage.jsx](file:///d:/AgriAI/agriai_frontend/src/pages/DiseaseMapPage.jsx)
* **Vai trò:** Trang hiển thị bản đồ dịch bệnh tương tác Leaflet.
* **Tính năng phụ trợ:** Bộ lọc nhanh thời gian phát hiện dịch (7 ngày, 30 ngày, 90 ngày) và bộ lọc theo loại bệnh cụ thể.

#### B. [useMapClusters.js](file:///d:/AgriAI/agriai_frontend/src/features/map/hooks/useMapClusters.js)
* **Vai trò:** Custom hook chịu trách nhiệm giao tiếp với thư viện Supercluster để tính toán gom cụm điểm.

#### C. [ClusterMarker.jsx](file:///d:/AgriAI/agriai_frontend/src/features/map/components/ClusterMarker.jsx)
* **Vai trò:** Vẽ bong bóng gom cụm hiển thị số lượng ca bệnh.
* **Đặc điểm thiết kế:** Tính toán màu sắc, kích thước động theo số ca bệnh và hiệu ứng bay mượt mà (`map.flyTo`) khi nhấp chuột.

---

## 4. Giải thích kỹ thuật sử dụng trong code

### 4.1. Kỹ thuật Gom cụm Bản đồ (Supercluster) tối ưu hóa DOM
* **Tại sao cần thiết?** Nếu nông trại có 10.000 ca chẩn đoán bệnh trên toàn quốc, việc render 10.000 phần tử HTML marker lên bản đồ Leaflet sẽ làm sập hoàn toàn hiệu năng của trình duyệt do DOM bị phình to (DOM bloat). Trình duyệt sẽ cực kỳ giật lag khi kéo (drag) hoặc phóng to thu nhỏ bản đồ.
* **Giải pháp:** Supercluster là thư viện tính toán phân cụm điểm trên hệ tọa độ 2D cực nhanh. Nó gom hàng ngàn điểm gần nhau trong bán kính 75 pixels thành một bong bóng cụm duy nhất. Số lượng phần tử DOM cần render trên bản đồ giảm từ 10.000 xuống còn vài chục bong bóng cụm, giúp trải nghiệm kéo thả bản đồ cực kỳ mượt mà.

### 4.2. Kỹ thuật Geocoding bất đồng bộ ở luồng nền (Asynchronous Background Thread)
Trong `DiagnoseService.java` (dòng 91 & 134):
```java
// Gọi song song AI & Weather
CompletableFuture.allOf(aiFuture, weatherFuture).join();
...
// Chạy Geocoding bất đồng bộ ở background, không chặn phản hồi chẩn đoán của User
runGeocodingInBackground(context, request);
```
* **Ý nghĩa:** Việc phân tích tọa độ địa lý qua API bên ngoài (OpenStreetMap) có độ trễ lớn (200-500ms). Người nông dân chẩn đoán bệnh chỉ cần nhận kết quả phân tích bệnh ngay lập tức, họ không cần chờ đợi việc hệ thống dịch địa chỉ để lưu trữ. Do đó, tác vụ Geocoding được đẩy sang luồng nền độc lập (`runGeocodingInBackground`), giúp phản hồi nhanh kết quả chẩn đoán về UI cho nông dân.

---

## 5. Database & Query Analysis

### 5.1. Phân tích Lược đồ thực thể AreaInfor (Database Schema)

Bảng `area_infor` lưu trữ thông tin địa điểm canh tác của người dùng:
* `id`: Khóa chính.
* `user_id`: Khóa ngoại liên kết bảng `users`.
* `area_name`: Tên vùng canh tác do nông dân đặt (mặc định gợi ý là "Khu vực canh tác mới").
* `latitude` / `longitude`: Tọa độ GPS.
* `address`: Địa chỉ rút gọn từ Nominatim (ví dụ: "Xã Hòa Khương, Huyện Hòa Vang").
* `province`: Tên tỉnh để lọc dịch tễ bản đồ (ví dụ: "Đà Nẵng").
* `confirmed`: Cờ xác thực (boolean). Mặc định là `false` khi hệ thống gợi ý tự động. Khi nông dân vào trang và xác nhận, cờ chuyển thành `true`.

---

## 6. Kiến trúc & Design Pattern

### 6.1. Observer Pattern (WebSocket Notification Push)
* Sau khi `GeocodingService` lưu trữ một khu vực canh tác gợi ý mới vào cơ sở dữ liệu, nó hoạt động như một nhà xuất bản (Publisher) sử dụng `SimpMessagingTemplate` để đẩy sự kiện đến hàng đợi WebSocket cá nhân của người dùng. Trình duyệt của nông dân hoạt động như một người đăng ký (Subscriber) lắng nghe và hiển thị hộp thoại gợi ý. Đây là mô hình truyền thông điệp bất đồng bộ (Event-driven Notification) kinh điển.

---

## 7. Điểm chưa tối ưu (Technical Debt)

### 7.1. Thiếu cơ chế Cache cho Geocoding API (External API Rate Limiting)
* **Giải thích:** Nominatim OpenStreetMap là dịch vụ bản đồ địa lý công cộng miễn phí nhưng giới hạn tần suất gọi cực kỳ nghiêm ngặt (tối đa 1 request/giây). Nếu nhiều nông dân ở cùng một làng chụp ảnh chẩn đoán bệnh cùng lúc, hệ thống sẽ liên tục gọi Nominatim cho cùng một cặp tọa độ Lat/Lng xấp xỉ nhau, gây quá tải và bị chặn API (HTTP status 429 Too Many Requests).
* **Tác hại:** Bị mất vết thông tin vùng dịch tễ do API từ chối phản hồi.

---

## 8. Hướng tối ưu (Refactoring Code)

### 8.1. Tích hợp Redis Spatial Cache hoặc Geohash Cache
**Giải pháp:** Sử dụng thư viện **Geohash** (chia bản đồ thế giới thành các ô lưới mã hóa bằng chuỗi ký tự) kết hợp cache Redis. Khi nhận tọa độ Lat/Lng từ ảnh chụp, hệ thống mã hóa tọa độ này thành Geohash có độ dài 6 ký tự (đại diện cho một khu vực bán kính khoảng 1.2km). Nếu Geohash này đã có địa chỉ trong Redis Cache, trả về ngay lập tức mà không cần gọi sang Nominatim API.

#### [TRƯỚC] Gọi API bên ngoài trực tiếp cho mọi ca bệnh
```java
NominatimResult result = nominatimPort.reverseGeocode(lat, lon);
```

#### [SAU] Tích hợp Geohash Cache
```java
String geohash = Geohash.encode(lat, lon, 6); // bán kính ~1.2km
NominatimResult cachedResult = redisCache.get(geohash);
if (cachedResult != null) {
    return cachedResult; // lấy từ cache trong 0ms!
}
NominatimResult result = nominatimPort.reverseGeocode(lat, lon);
redisCache.put(geohash, result, 7, TimeUnit.DAYS);
```

---

## 9. Mindset của Senior Developer

1. **Hiểu rõ Giới hạn và Điều khoản dịch vụ thứ ba (Third-party API Compliance):** Việc thêm `User-Agent` tùy chỉnh và tham số `accept-language=vi` trong `NominatimAdapter` thể hiện sự cẩn trọng khi tích hợp hệ thống, tuân thủ đúng chính sách sử dụng dịch vụ công cộng của OpenStreetMap để tránh bị khóa IP dịch vụ.
2. **Không làm phiền người dùng (De-duplication by short address):** Trước khi lưu gợi ý vùng canh tác mới, hệ thống luôn kiểm tra trùng lặp địa chỉ rút gọn. Nếu nông dân chẩn đoán 5 lần tại cùng một vườn, hệ thống chỉ tạo duy nhất 1 gợi ý, tránh gửi liên tục thông báo đẩy WebSocket gây phiền nhiễu cho trải nghiệm người dùng (UX fatigue).

---

## 10. Kết luận cho feature

Bản đồ dịch bệnh nông nghiệp và định vị địa lý là một module được thiết kế rất hoàn chỉnh, kết hợp nhuần nhuyễn giữa xử lý I/O luồng nền, đẩy thông báo thời gian thực qua kênh WebSocket, và tối ưu hóa hiển thị đồ họa Leaflet qua giải thuật Supercluster ở client React.
