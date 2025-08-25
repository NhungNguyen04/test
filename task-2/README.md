
## Cách chạy
Đầu tiên, cài đặt các thư viện cần thiết

```bash
npm i
```
Tiếp theo, chạy dự án

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Và mở [http://localhost:3000](http://localhost:3000) trong browser để thấy giao diện

## Giải thích

Bài tập này sử dụng Next.js cho lập trình giao diện và thư viện zod để validate input của user. Các yêu cầu validate input:
- Tất cả các input đều phải có giá trị
- Các giá trị số lượng, đơn giá phải lớn hơn không
- Giá trị doanh thu không được âm
Nếu một trong các yêu cầu trên bị vi phạm, khi người dùng click cập nhật sẽ không thể tiếp tục và phải chỉnh sửa lại input.

## Cấu trúc dự án
- Thư mục app chứa trang chính được hiển thị ở browser
- Thư mục components chứa transaction-form là form để hiển thị cho người dùng và thực thi các thao tác validate