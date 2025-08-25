## Mô tả bài toán
Chương trình xử lý một mảng số nguyên và một tập hợp các truy vấn (queries) với hai loại yêu cầu:

- **Query type 1:** Tính tổng các phần tử từ `l` đến `r`.
- **Query type 2:** Tính hiệu giữa tổng các phần tử ở vị trí **chẵn** và tổng các phần tử ở vị trí **lẻ** trong khoảng từ `l` đến `r`.

Yêu cầu đạt độ phức tạp **O(n + q)**, trong đó:
- `n` = số phần tử trong mảng
- `q` = số lượng truy vấn

## Ý tưởng giải pháp
1. **Tiền xử lý mảng đầu vào**:
   - Tạo mảng `prefixAll[i]`: tổng từ phần tử đầu đến `i`.
   - Tạo mảng `prefixDiff[i]`: `(tổng vị trí chẵn) - (tổng vị trí lẻ)` từ đầu đến `i`.
2. **Trả lời query trong O(1)**:
   - **Type 1:** `sum(l, r) = prefixAll[r] - prefixAll[l-1]`.
   - **Type 2:** `diff(l, r) = prefixDiff[r] - prefixDiff[l-1]`.
3. **Đọc dữ liệu từ API**, xử lý queries, sau đó **gửi kết quả lên API** với Bearer token từ input.

Tổng độ phức tạp: **O(n + q)**.

## Cách chạy chương trình
1. **Cài đặt môi trường**:
   - Cài node.js.
   - Cài node-fetch.
   ```bash
   npm install node-fetch@2
2. **Chạy chương trình**:
   ```bash
    node main.js
  ```
