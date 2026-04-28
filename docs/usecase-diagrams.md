# Biểu đồ Use Case AgriAI

## Phạm vi hệ thống

Tài liệu này được rút ra từ code hiện có trong:

- Backend Spring Boot: `agriai_backend/agriai`
- Frontend React: `agriai_frontend`
- Tài liệu phân tích nghiệp vụ trong `codebase-analysis`

Ghi chú:

- Hệ thống hiện không thấy luồng quản trị viên riêng biệt trong code.
- Chatbot đã có backend thật, không còn chỉ là mock.
- Notification bền vững trong DB chưa hoàn chỉnh; luồng đang chạy thực tế là thông báo realtime xác nhận vị trí.

## 1. Biểu đồ use case tổng quát

```mermaid
flowchart LR
    guest["Actor: Khách vãng lai"]
    farmer["Actor: Người dùng/Nông dân"]
    vision["Actor: Vision AI / YOLO"]
    weather["Actor: Weather API"]
    geo["Actor: Nominatim Geocoding"]
    llm["Actor: LLM / DeepSeek / Gemini"]

    subgraph agriai["Hệ thống AgriAI"]
        uc1(("Đăng ký"))
        uc2(("Đăng nhập"))
        uc3(("Đăng xuất"))
        uc4(("Làm mới phiên đăng nhập"))
        uc5(("Xem trang giới thiệu / trang chủ"))
        uc6(("Xem bản đồ dịch bệnh"))
        uc7(("Xem danh mục cây trồng"))
        uc8(("Chẩn đoán bệnh cây bằng ảnh"))
        uc9(("Nhận hướng dẫn điều trị và canh tác"))
        uc10(("Xem lịch sử chẩn đoán"))
        uc11(("Xem chi tiết một lần chẩn đoán"))
        uc12(("Đánh giá kết quả chẩn đoán"))
        uc13(("Quản lý khu vực canh tác"))
        uc14(("Xác nhận vị trí GPS được gợi ý"))
        uc15(("Nhận thông báo realtime"))
        uc16(("Cập nhật hồ sơ cá nhân"))
        uc17(("Chat với trợ lý nông nghiệp"))
        uc18(("Quản lý phiên chat"))
    end

    guest --> uc5
    guest --> uc1
    guest --> uc2
    guest --> uc6
    guest --> uc7
    guest --> uc8
    guest --> uc9
    guest --> uc17

    farmer --> uc3
    farmer --> uc4
    farmer --> uc6
    farmer --> uc7
    farmer --> uc8
    farmer --> uc9
    farmer --> uc10
    farmer --> uc11
    farmer --> uc12
    farmer --> uc13
    farmer --> uc14
    farmer --> uc15
    farmer --> uc16
    farmer --> uc17
    farmer --> uc18

    uc8 --> vision
    uc8 --> weather
    uc8 --> geo
    uc9 --> llm
    uc17 --> llm
    uc14 -.mở rộng từ kết quả chẩn đoán.-> uc8
    uc15 -.bao gồm khi có GPS mới.-> uc8
    uc11 -.phụ thuộc dữ liệu từ.-> uc10
    uc12 -.đánh giá cho.-> uc11
```

## 2. Biểu đồ use case theo từng actor

### 2.1. Actor: Khách vãng lai

```mermaid
flowchart LR
    guest["Khách vãng lai"]

    subgraph agriai["AgriAI"]
        g1(("Xem landing page / home"))
        g2(("Đăng ký tài khoản"))
        g3(("Đăng nhập"))
        g4(("Xem danh mục cây trồng"))
        g5(("Chẩn đoán bệnh cây bằng ảnh"))
        g6(("Nhận kết quả chẩn đoán"))
        g7(("Nhận hướng dẫn điều trị/canh tác"))
        g8(("Xem bản đồ dịch bệnh"))
        g9(("Chat với trợ lý nông nghiệp ở chế độ guest"))
    end

    guest --> g1
    guest --> g2
    guest --> g3
    guest --> g4
    guest --> g5
    guest --> g6
    guest --> g7
    guest --> g8
    guest --> g9

    g6 -.bao gồm.-> g5
    g7 -.mở rộng từ.-> g5
```

### 2.2. Actor: Người dùng/Nông dân đã đăng nhập

```mermaid
flowchart LR
    farmer["Người dùng / Nông dân"]

    subgraph agriai["AgriAI"]
        f1(("Đăng xuất"))
        f2(("Làm mới phiên đăng nhập"))
        f3(("Cập nhật hồ sơ cá nhân"))
        f4(("Xem danh mục cây trồng"))
        f5(("Chẩn đoán bệnh cây bằng ảnh"))
        f6(("Nhận khuyến nghị điều trị"))
        f7(("Nhận hướng dẫn AI"))
        f8(("Xem lịch sử chẩn đoán"))
        f9(("Xem chi tiết một ca chẩn đoán"))
        f10(("Đánh giá kết quả chẩn đoán"))
        f11(("Tạo khu vực canh tác thủ công"))
        f12(("Xem danh sách khu vực canh tác"))
        f13(("Xác nhận khu vực từ GPS"))
        f14(("Nhận thông báo realtime xác nhận vị trí"))
        f15(("Xem bản đồ dịch bệnh"))
        f16(("Tạo phiên chat"))
        f17(("Xem danh sách phiên chat"))
        f18(("Xem lịch sử tin nhắn"))
        f19(("Gửi tin nhắn cho chatbot"))
        f20(("Xóa mềm phiên chat"))
    end

    farmer --> f1
    farmer --> f2
    farmer --> f3
    farmer --> f4
    farmer --> f5
    farmer --> f6
    farmer --> f7
    farmer --> f8
    farmer --> f9
    farmer --> f10
    farmer --> f11
    farmer --> f12
    farmer --> f13
    farmer --> f14
    farmer --> f15
    farmer --> f16
    farmer --> f17
    farmer --> f18
    farmer --> f19
    farmer --> f20

    f6 -.mở rộng từ.-> f5
    f7 -.mở rộng từ.-> f5
    f9 -.bao gồm dữ liệu từ.-> f8
    f10 -.đánh giá cho.-> f9
    f13 -.phát sinh sau.-> f5
    f14 -.phát sinh sau.-> f5
    f18 -.thuộc về.-> f17
    f19 -.thực hiện trong.-> f16
    f20 -.tác động lên.-> f17
```

### 2.3. Actor: Vision AI / YOLO

```mermaid
flowchart LR
    vision["Vision AI / YOLO"]

    subgraph agriai["AgriAI"]
        v1(("Gửi ảnh sang AI nhận diện"))
        v2(("Nhận danh sách bệnh nghi ngờ"))
        v3(("Phân tích confidence và severity"))
        v4(("Ánh xạ nhãn AI sang bệnh trong DB"))
    end

    v1 --> vision
    vision --> v2
    v2 --> v3
    v3 --> v4
```

### 2.4. Actor: Weather API

```mermaid
flowchart LR
    weather["Weather API"]

    subgraph agriai["AgriAI"]
        w1(("Gửi tọa độ thời tiết"))
        w2(("Nhận dữ liệu thời tiết hiện tại"))
        w3(("Đánh giá cảnh báo thời tiết"))
        w4(("Sinh lịch/phương án phun thuốc"))
    end

    w1 --> weather
    weather --> w2
    w2 --> w3
    w3 --> w4
```

### 2.5. Actor: Nominatim Geocoding

```mermaid
flowchart LR
    geo["Nominatim Geocoding"]

    subgraph agriai["AgriAI"]
        n1(("Gửi tọa độ GPS để reverse geocode"))
        n2(("Nhận địa chỉ suy diễn"))
        n3(("Tạo khu vực canh tác chờ xác nhận"))
        n4(("Gửi thông báo xác nhận vị trí cho người dùng"))
    end

    n1 --> geo
    geo --> n2
    n2 --> n3
    n3 --> n4
```

### 2.6. Actor: LLM / DeepSeek / Gemini

```mermaid
flowchart LR
    llm["LLM / DeepSeek / Gemini"]

    subgraph agriai["AgriAI"]
        l1(("Tạo hướng dẫn canh tác từ kết quả chẩn đoán"))
        l2(("Trả lời câu hỏi chatbot"))
        l3(("Ghép ngữ cảnh từ DB vào prompt"))
        l4(("Trả lời ngôn ngữ tự nhiên"))
    end

    l3 --> l1
    l3 --> l2
    l1 --> llm
    l2 --> llm
    llm --> l4
```

## 3. Danh sách actor được xác định từ code

- Khách vãng lai
- Người dùng/Nông dân đã đăng nhập
- Vision AI / YOLO service
- Weather API
- Nominatim Geocoding service
- LLM service cho guidance và chatbot

## 4. Các use case chính rút ra từ dự án

- Xác thực người dùng: đăng ký, đăng nhập, làm mới token, đăng xuất
- Chẩn đoán bệnh cây bằng ảnh
- Lấy danh mục cây trồng
- Xem lịch sử và chi tiết chẩn đoán
- Đánh giá kết quả chẩn đoán
- Quản lý khu vực canh tác
- Nhận và xác nhận gợi ý vị trí GPS
- Xem bản đồ dịch bệnh
- Chatbot nông nghiệp
- Cập nhật hồ sơ người dùng
