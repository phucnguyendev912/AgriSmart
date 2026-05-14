# Biểu đồ tuần tự — AgriAI 3 Chức năng chính

> Đọc từ codebase thực tế · 4 lane: **Người dùng | Giao diện (trang React) | Server (Spring Boot) | CSDL (MySQL)**

---

## 1. Chức năng Chẩn đoán Bệnh

**Trang:** `DiagnosisPage.jsx` → **API:** `POST /api/diagnosis` → **Service:** `DiagnoseService`

```mermaid
sequenceDiagram
    actor User as 👤 Người dùng
    participant UI as 📱 DiagnosisPage
    participant Server as 🖥️ Server (Spring Boot)
    participant DB as 🗄️ CSDL (MySQL)

    Note over UI: Trang /diagnosis

    User->>UI: Mở trang chẩn đoán
    UI->>Server: GET /api/crop-types
    Server->>DB: findAll() CropType (is_active=true)
    DB-->>Server: Danh sách loại cây trồng
    Server-->>UI: [ {id, cropName}, ... ]
    UI-->>User: Hiển thị dropdown chọn loại cây

    User->>UI: Cấp quyền GPS (navigator.geolocation)
    UI-->>User: GPS granted → hiển thị badge "GPS bật"

    User->>UI: Chọn loại cây + upload ảnh lá
    UI-->>User: Preview ảnh hiển thị

    User->>UI: Nhấn "Chẩn đoán ngay"
    UI->>UI: Validate: ảnh & cropTypeId required

    UI->>Server: POST /api/diagnosis (multipart/form-data)<br/>{image, cropTypeId, latitude?, longitude?}

    Note over Server: DiagnoseController → DiagnoseService

    Server->>DB: findById(cropTypeId) → CropType
    DB-->>Server: CropType entity
    Server->>DB: findByEmail(principal) → User (nếu đã login)
    DB-->>Server: User entity (hoặc null nếu guest)

    alt Người dùng đã đăng nhập
        Server->>DB: INSERT diagnose_history (status=PENDING)
        DB-->>Server: history.id
    end

    Note over Server: Parallel Async (CompletableFuture)

    par Upload ảnh song song với fetch thời tiết
        Server->>Server: imageStoragePort.upload(image) → Cloudinary
        Server-->>Server: imageUrl
    and
        alt GPS có tọa độ
            Server->>Server: weatherPort.getCurrentWeather(lat, lng) → OpenWeatherMap API
            Server-->>Server: WeatherDTO {temp, humidity, windSpeed, ...}
        else Không có GPS
            Server-->>Server: weather = null
        end
    end

    Server->>Server: VisionDetectionPort.detect(imageUrl) → AI Model (Python/YOLO)
    Server-->>Server: [ {label, confidence, severity}, ... ]

    Note over Server: analyzeVisionResults()

    alt confidence >= 0.4 và không phải "healthy"
        Server->>DB: findByLabel(label) → Disease
        DB-->>Server: Disease entity
        Note over Server: DetectedDiseaseMatch list
    end

    alt Phát hiện bệnh
        Server->>DB: findByDiseaseIds() → TreatmentPlan list
        DB-->>Server: Danh sách phác đồ điều trị

        Server->>Server: TreatmentRankingService.rankPlans() → Sắp xếp theo điểm
        Server->>DB: findInteractions() → DrugInteraction
        DB-->>Server: Cảnh báo tương tác thuốc

        Server->>DB: findWeatherConditions(diseaseIds) → DiseaseWeatherCondition
        DB-->>Server: Điều kiện thời tiết → evaluate risk
    end

    Server->>Server: GuidancePort.generateGuidance() → AI sinh hướng dẫn canh tác

    alt Người dùng đã đăng nhập
        Server->>DB: UPDATE diagnose_history (imageUrl, weatherData, status=COMPLETED)
        Server->>DB: INSERT diagnose_history_detail (disease, confidence, severity, treatmentData)
        Server->>DB: INSERT diagnose_treatment_recommendation (treatmentPlan, rankScore)

        Note over Server: Async background
        Server->>Server: GeocodingService.processGeocoding(lat, lng) → Nominatim API
        Server->>DB: UPDATE area_infor (province, district)
    end

    Server-->>UI: DiagnoseResponse {<br/>  diagnosisType, weather,<br/>  treatments[], sprayPrograms[],<br/>  interactionWarnings[], diseaseWeatherRisks[],<br/>  userGuidance, warnings[]<br/>}

    UI-->>User: Hiển thị kết quả:<br/>- Loại bệnh + độ tin cậy<br/>- Thẻ thời tiết<br/>- Phác đồ điều trị<br/>- Cảnh báo tương tác thuốc<br/>- Hướng dẫn AI

    alt Guest user
        UI-->>User: Toast "Đăng nhập để xem lại kết quả"
    end

    opt Đánh giá kết quả
        User->>UI: Nhấn "Đánh giá kết quả chẩn đoán"
        UI-->>User: Mở DiagnosisRatingModal
        User->>UI: Chọn sao + gửi đánh giá
        UI->>Server: POST /api/diagnosis-reviews/{historyId}
        Server->>DB: INSERT diagnose_review
        DB-->>Server: OK
        Server-->>UI: 200 OK
        UI-->>User: Toast "Cảm ơn bạn đã đánh giá!"
    end
```

---

## 2. Chức năng Cảnh báo Bệnh theo Thời tiết

**Trang:** `HomePage.jsx` (widget thời tiết) → **API:** `GET /api/weather/disease-risks` → **Service:** `WeatherDiseaseRiskService`

> **Lưu ý:** `NotificationsPage.jsx` hiện dùng dummy data (mock). Flow này mô tả API thực tế đang hoạt động.

```mermaid
sequenceDiagram
    actor User as 👤 Người dùng
    participant UI as 📱 HomePage
    participant Server as 🖥️ Server (Spring Boot)
    participant DB as 🗄️ CSDL (MySQL)

    Note over UI: Trang /home — Widget cảnh báo thời tiết

    User->>UI: Mở trang Home
    UI->>UI: navigator.geolocation.getCurrentPosition()

    alt GPS được cấp phép
        UI-->>User: Lấy được tọa độ (lat, lng)
        UI->>Server: GET /api/weather/disease-risks?latitude=...&longitude=...

        Note over Server: WeatherDiseaseRiskController → WeatherDiseaseRiskService

        Server->>Server: weatherPort.getCurrentWeather(lat, lng)<br/>→ Gọi OpenWeatherMap API
        Server-->>Server: WeatherDTO {temperature, humidity, windSpeed, description}

        alt Không lấy được thời tiết
            Server-->>UI: 503 Service Unavailable
            UI-->>User: Hiển thị thông báo lỗi
        end

        Note over Server: DiseaseWeatherRiskEvaluator.evaluateAll(weather)

        Server->>DB: findByIsActiveTrueAndIsDeleteFalse()<br/>→ ALL DiseaseWeatherCondition
        DB-->>Server: Tất cả điều kiện thời tiết-bệnh đang active

        Note over Server: Nhóm theo (diseaseId, conditionGroup)<br/>Duyệt từng nhóm — evaluateGroup()

        loop Mỗi nhóm điều kiện
            Server->>Server: condition.weatherFactor.extract(weather)<br/>→ Lấy giá trị thực (temp/humidity/wind)
            Server->>Server: isConditionMatch() so sánh với operator<br/>(BETWEEN / GREATER_THAN / LESS_THAN / EQUALS)

            alt Điều kiện khớp
                Server->>Server: Tạo DiseaseWeatherRiskDTO {diseaseId, diseaseName, matchedConditions[], recommendationNotes}
            end
        end

        Server->>Server: deduplicateByDisease()<br/>Giữ risk ưu tiên cao nhất (HIGH > MEDIUM > LOW)

        Server-->>UI: WeatherDiseaseRiskResponse {weather, diseaseWeatherRisks[]}

        UI-->>User: Hiển thị:<br/>- Card thời tiết (nhiệt độ, độ ẩm, gió)<br/>- Danh sách bệnh nguy cơ cao<br/>- Ghi chú khuyến nghị phòng ngừa

    else GPS bị từ chối
        UI-->>User: Ẩn widget cảnh báo thời tiết
    end
```

---

## 3. Chức năng Bản đồ Dịch bệnh

**Trang:** `DiseaseMapPage.jsx` → **API:** `GET /api/map/markers` + `GET /api/map/diseases` → **Service:** `DiseaseMapService`

```mermaid
sequenceDiagram
    actor User as 👤 Người dùng
    participant UI as 📱 DiseaseMapPage
    participant Server as 🖥️ Server (Spring Boot)
    participant DB as 🗄️ CSDL (MySQL)

    Note over UI: Trang /warning-map

    User->>UI: Mở trang Bản đồ dịch bệnh

    par Tải dữ liệu song song khi mount
        UI->>Server: GET /api/map/diseases
        Server->>DB: findAll() → Disease[]
        DB-->>Server: [ {id, diseaseName}, ... ]
        Server-->>UI: Danh sách bệnh
        UI-->>User: Populate dropdown lọc bệnh
    and
        UI->>Server: GET /api/map/markers?days=30
        Note over Server: DiseaseMapController → DiseaseMapService

        Server->>Server: since = now().minusDays(30)
        Server->>DB: findMarkers(since, diseaseId=null)<br/>JOIN diagnose_history + diagnose_history_detail<br/>+ disease + area_infor<br/>WHERE latitude IS NOT NULL<br/>AND createdAt >= since<br/>AND isDelete = false<br/>ORDER BY createdAt DESC
        DB-->>Server: [ MapMarkerResponse {detailId, historyId, latitude, longitude, diseaseId, diseaseName, diagnosedAt, province} ]
        Server-->>UI: List of MapMarkerResponse
    end

    UI->>UI: useMapClusters(markers, bounds, zoom)<br/>→ Supercluster tính cluster

    UI-->>User: Render bản đồ Leaflet.js<br/>- Cluster xanh < 10 ca<br/>- Cluster vàng 10–49 ca<br/>- Cluster đỏ >= 50 ca<br/>- Điểm đơn: CircleMarker đỏ

    User->>UI: Đổi bộ lọc thời gian (7 / 30 / 90 ngày)
    UI->>Server: GET /api/map/markers?days=7
    Server->>DB: findMarkers(since=now-7days, diseaseId=null)
    DB-->>Server: Markers trong 7 ngày
    Server-->>UI: Filtered markers
    UI-->>User: Bản đồ cập nhật

    User->>UI: Chọn lọc bệnh cụ thể
    UI->>Server: GET /api/map/markers?days=30&diseaseId=5
    Server->>DB: findMarkers(since, diseaseId=5)
    DB-->>Server: Markers theo bệnh đã chọn
    Server-->>UI: Filtered markers
    UI-->>User: Bản đồ chỉ hiện bệnh đã chọn

    User->>UI: Zoom vào / kéo bản đồ
    UI->>UI: MapEventHandler.onBoundsChange()<br/>→ setMapState({bounds, zoom})<br/>→ useMapClusters re-cluster
    UI-->>User: Cluster tách thành điểm đơn khi zoom sâu

    User->>UI: Click vào điểm dịch bệnh
    UI-->>User: Popup: Tên bệnh + Ngày phát hiện + Khu vực
```

---

## Tóm tắt luồng dữ liệu

| Chức năng | Endpoint | DB Tables chính | External API |
|-----------|----------|-----------------|--------------|
| **Chẩn đoán bệnh** | `POST /api/diagnosis` | `diagnose_history`, `diagnose_history_detail`, `diagnose_treatment_recommendation`, `disease`, `treatment_plan`, `drug_interaction` | Cloudinary, AI Model (YOLO), OpenWeatherMap, Nominatim |
| **Cảnh báo thời tiết** | `GET /api/weather/disease-risks` | `disease_weather_condition`, `disease` | OpenWeatherMap |
| **Bản đồ dịch bệnh** | `GET /api/map/markers` | `diagnose_history`, `diagnose_history_detail`, `disease`, `area_infor` | OpenStreetMap (Leaflet tiles) |

> **Ghi chú:** Dữ liệu bản đồ được sinh tự động từ lịch sử chẩn đoán có GPS — mỗi lần nông dân chẩn đoán thành công với tọa độ, điểm đó xuất hiện trên bản đồ dịch bệnh cộng đồng.
