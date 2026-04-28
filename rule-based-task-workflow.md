# Rule-Based Task Workflow

## 1. Muc tieu

Tai lieu nay dinh nghia task workflow theo rule de su dung khi nhan yeu cau moi trong project.

- Phan loai request truoc khi thuc hien
- Xac dinh khi nao can hoi lam ro theo Socratic Gate
- Xac dinh khi nao can tao task file `.md`
- Giu cho quy trinh lam viec nhat quan giua phan tich, lap plan va implementation

## 2. Phan loai request

### Cau hoi

- Chi doc context lien quan
- Tra loi bang text
- Khong tao file
- Khong sua code

### Khao sat / Intel

- Quet file, doc code, tong hop thong tin
- Tao bao cao phan tich
- Khong tao code neu chua duoc yeu cau

### Code don gian

- Ap dung khi pham vi nho, thuong mot file hoac mot diem sua ro rang
- Sua truc tiep file lien quan
- Khong can task file neu khong mo rong scope

### Code phuc tap

- Ap dung khi lien quan nhieu file, nhieu layer hoac thay doi hanh vi chinh
- Bat buoc hoi lam ro neu scope chua ro
- Bat buoc tao task file truoc khi viet code

### Thiet ke / UI

- Ap dung cho page, layout, dashboard, luong giao dien moi
- Bat buoc hoi ro ve responsive, role va rang buoc giao dien
- Bat buoc tao task file truoc khi implement

## 3. Socratic Gate

Can hoi it nhat mot cau lam ro khi:

- Yeu cau rong hoac mo ho
- Chua ro frontend, backend hay ca hai
- Chua ro co duoc doi API contract hoac schema DB hay khong
- Chua ro role, actor hoac edge case nghiep vu

Mau cau hoi uu tien:

- Muc tieu chinh la feature moi, refactor hay bug fix?
- Pham vi nam o frontend, backend hay ca hai?
- Co constraint nao phai giu nguyen ve API, database hoac UI khong?

## 4. Cau truc task file

Khi request thuoc `CODE PHUC TAP` hoac `THIET KE / UI`, tao mot file `{task-slug}.md` gom:

### Mo ta yeu cau

- Muc tieu nghiep vu
- Pham vi thay doi
- Constraint can ton trong

### Danh sach file du kien tao / sua

- Liet ke file frontend
- Liet ke file backend
- Ghi ro file moi va file sua

### Thu tu thuc hien

1. Doc context lien quan
2. Xac nhan pham vi va edge cases
3. Sua backend neu co thay doi contract hoac business logic
4. Sua frontend neu co thay doi giao dien hoac integration
5. Chay kiem tra phu hop
6. Tong hop ket qua va rui ro con lai

## 5. Quy tac thuc thi

- Ton trong cau truc folder cua project
- Backend phai validate dung tang: `@Valid` o controller, business validation o service
- Khong nuot exception im lang
- Uu tien `GlobalExceptionHandler` cho xu ly loi backend
- Khong de component frontend goi HTTP truc tiep neu da co `services/`
- Ton trong SOLID khi tao moi hoac refactor
- Khong de xuat lenh Git hoac Docker nam trong danh sach bi cam

## 6. Dau ra ky vong

Sau moi task, can co:

- Plan ro rang neu la task phuc tap
- Danh sach file da thay doi
- Tom tat thay doi da thuc hien
- Ket qua verify hoac ly do chua verify duoc
