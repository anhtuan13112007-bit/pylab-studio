# PyLab · Phòng thực hành Python

Viết mã Python bằng tiếng Việt, chạy ngay trong trình duyệt và giữ bài làm trên thiết bị. Bản phát hành dùng CPython 3.12.7 qua Pyodide 0.27.7. Cả trình soạn thảo, biểu tượng và bộ chạy Python đều nằm trong bản web.

**[Mở PyLab](https://anhtuan13112007-bit.github.io/pylab-studio/)** · **[Mã nguồn](https://github.com/anhtuan13112007-bit/pylab-studio)**

## 1. Mở bản local

Trên máy Windows đã có bản dựng, nhấp đúp **`Mo-PyLab.cmd`** ở thư mục gốc của dự án. Tệp này dùng Node.js để phục vụ thư mục `docs` và mở trình duyệt. Giữ cửa sổ máy chủ trong lúc học, nhấn `Ctrl+C` khi muốn đóng. Bạn có thể ngắt Internet sau khi đã có bản dựng trên máy.

Kho GitHub đã bao gồm bản dựng trong `docs`. Sau khi tải về và giải nén, bạn có thể mở ngay bằng `Mo-PyLab.cmd` trên máy có Node.js. Để dựng lại từ mã nguồn, cài **Node.js 22.12 trở lên** rồi mở Terminal trong thư mục có `package.json`. Chạy lần lượt:

```sh
npm ci
npm run build
npm start
```

Mở địa chỉ máy chủ in ra, mặc định là `http://127.0.0.1:4173`. Máy chủ chỉ nghe trên thiết bị của bạn. Nếu cổng này đang bận, chương trình in một địa chỉ có cổng khác. Trình duyệt lưu bài riêng cho từng địa chỉ và cổng. Hãy quay lại đúng địa chỉ cũ để tiếp tục bài.

**Khi chỉnh sửa web**, chạy `npm run dev` sau `npm ci`, rồi mở địa chỉ Vite in ra. Thay đổi giao diện sẽ hiện khi bạn lưu tệp. Sau khi chỉnh xong, chạy `npm run build` để cập nhật bản mở bằng `Mo-PyLab.cmd`. Trang cần được mở qua HTTP hoặc HTTPS để tải JavaScript module, Web Worker và WebAssembly.

## 2. Bài thực hành đầu tiên

1. Mở **Thư viện mẫu**, tìm `phuong trinh` và chọn **Phương trình bậc nhất**. Bạn có thể tìm bằng tiếng Việt có dấu hoặc không dấu.
2. Mở thẻ **Đầu vào**, nhập `4` ở dòng đầu và `-20` ở dòng thứ hai.
3. Bấm **Chạy mã**. Terminal hiển thị nghiệm `x = 5`. Đổi hai số thành `0` và `0` để thử trường hợp vô số nghiệm.
4. Sửa đoạn mã rồi tải lại trang. Tệp đang mở và dữ liệu đầu vào được khôi phục. Bấm biểu tượng **Tải tệp .py** để có bản sao riêng.

## 3. Giao diện và tính năng

| Khu vực | Bạn có thể làm gì |
| --- | --- |
| Thanh bên | Chuyển giữa trình soạn thảo và thư viện. Dấu `+` tạo tệp. Nút `⋯` đổi tên hoặc xóa tệp sau khi xác nhận. Nhập mã UTF-8 từ tệp `.py` tối đa 1 MB. Tệp nhập trùng tên nhận hậu tố. |
| Trình soạn thảo | Tô màu cú pháp, đánh số dòng, thụt lề 4 dấu cách, đánh dấu cặp ngoặc, gấp khối, tìm trong mã và hoàn tác. Thanh dưới hiển thị vị trí con trỏ. |
| Bàn làm việc | Chạy tệp đang mở, dừng ngay cả khi mã lặp vô hạn, tải tệp hiện tại hoặc mở rộng vùng làm việc. Mỗi lần chạy dùng một môi trường Python mới. |
| Terminal | Xem lệnh chạy, kết quả, lỗi và thời gian thực thi sau khi nạp Python. Traceback hiển thị tên tệp và số dòng. Nút thùng rác xóa phần hiển thị. Đầu ra giới hạn 65.536 ký tự để bảo vệ độ phản hồi. |
| Đầu vào | Điền trước dữ liệu cho `input()`, mỗi giá trị một dòng. Khi thiếu dòng, Terminal hiển thị lỗi EOF và gợi ý bổ sung. Mỗi tệp giữ riêng dữ liệu nhập. |
| Tệp và mô-đun | Tất cả tệp trong thanh bên được đưa vào thư mục Python ảo của lần chạy. Có thể dùng `import` giữa các tệp. Những tệp mới do chính chương trình Python ghi ra chỉ tồn tại trong lần chạy đó. |
| Thư viện mẫu | 8 bài về biến, nhập liệu, vòng lặp, dữ liệu và toán học. Tìm theo tên, chủ đề, tên tệp hoặc mô tả. Mở lại một mẫu sẽ quay về bản bạn đã sửa. |
| Thiết bị và hiển thị | Bài làm và giao diện sáng/tối được lưu trong trình duyệt. Máy tính hiển thị mã và kết quả cạnh nhau. Điện thoại xếp hai khung theo chiều dọc và thu thanh bên vào nút menu. |

Trang mở đầu tự chạy bài chào mẫu khi không gian chỉ còn tệp mẫu nguyên bản. Các tệp bạn tự viết chạy khi bạn bấm **Chạy mã**. Bài làm trên bản local và bản GitHub Pages có vùng lưu riêng. Dùng tải xuống và nhập tệp để chuyển giữa hai nơi. Bài làm có thể mất khi xóa dữ liệu trang hoặc đóng phiên riêng tư.

### Phím tắt

| Phím | Tác dụng |
| --- | --- |
| `Ctrl+Enter` hoặc `⌘+Enter` | Chạy hoặc dừng chương trình |
| `Ctrl+S` hoặc `⌘+S` | Lưu trên trình duyệt và tải tệp đang mở |
| `Ctrl+F` hoặc `⌘+F` trong vùng mã | Tìm trong tệp |
| `Tab` / `Shift+Tab` | Tăng / giảm thụt lề |
| `Esc`, sau đó `Tab` | Rời trình soạn thảo bằng bàn phím |
| `Esc` | Thoát chế độ mở rộng hoặc đóng hộp thoại |

### Thử import giữa hai tệp

Tạo tệp `cong_cu.py` và nhập:

```python
def binh_phuong(x):
    return x ** 2
```

Tạo tệp `bai_tap.py`, nhập hai dòng dưới đây và chạy tệp đó. Terminal sẽ in `49`.

```python
from cong_cu import binh_phuong
print(binh_phuong(7))
```

## 4. Tìm đúng tệp để sửa

| Tệp hoặc thư mục | Vai trò |
| --- | --- |
| `index.html` | Nội dung tiếng Việt, bố cục thanh bên, hai bảng làm việc, thư viện và hộp thoại. |
| `src/style.css` | Bố cục, màu sáng/tối, nút, thẻ bài, các điểm chuyển giao diện theo chiều rộng màn hình. |
| `src/editor-colors.css` | Màu cú pháp Python và kiểu hiển thị hàng tệp. |
| `src/terrain.js` và `public/favicon.svg` | Minh họa địa hình được vẽ trên canvas và biểu trưng PyLab. |
| `src/main.js` | Điều hướng, nút bấm, quản lý tệp, lọc mẫu, chủ đề, phím tắt và giao tiếp với Web Worker. |
| `src/editor.js` | Cấu hình CodeMirror, chế độ Python, tô màu và theo dõi vị trí con trỏ. |
| `src/examples.js` | Nội dung mặc định `starter`, dữ liệu ví dụ và danh sách 3 mẫu đầu xuất hiện ở bàn làm việc. |
| `src/storage.js` | Đọc, ghi không gian làm việc phiên bản 1 và kiểm tra tên tệp. |
| `src/icons.js` | Các biểu tượng Lucide được đưa vào bản dựng. |
| `public/runner.js` | Khởi tạo Python, chuẩn bị các mô-đun, đọc stdin, truyền kết quả và lỗi về giao diện. |
| `scripts/runtime.mjs` | Chép các tệp Pyodide đã khóa phiên bản từ npm vào `public/runtime` trước khi chạy dev hoặc build. |
| `scripts/serve.mjs`, `Mo-PyLab.cmd` | Máy chủ local và lối tắt Windows. |
| `vite.config.js`, `package.json`, `package-lock.json` | Đường dẫn tài nguyên tương đối, lệnh dự án và phiên bản thư viện. |
| `docs/` | Bản web đã dựng, gồm giao diện và bộ chạy Python. Máy chủ local và GitHub Pages đều phục vụ thư mục này. Sửa các tệp nguồn rồi dựng lại để cập nhật. |

**Đổi giao diện.** Mở `src/style.css`. Sửa biến `--page`, `--surface`, `--ink`, `--green` cho nền, khung, chữ và màu nhấn. Cập nhật cả khối `:root[data-theme=dark]`. Đổi màu banner ở `.hero`, màu nút chạy ở `.primary`. Đổi tựa và dòng mô tả trên banner ở `index.html`. Xem lại trên màn hình hẹp và rộng bằng `npm run dev`.

**Đổi bài chào mặc định.** Sửa `starter.code` và `starter.stdin` trong `src/examples.js`. Để xem như người mới, thử bằng một hồ sơ trình duyệt khác. Các tệp người học đã lưu vẫn giữ nội dung của họ.

## 5. Thêm bài mẫu

Thêm phần tử sau vào mảng `examples` trong `src/examples.js`. Mỗi `id` và `file` cần duy nhất. Danh sách chủ đề và bộ lọc tự lấy giá trị từ mảng.

```js
{
  id: 'tong-tu-1-den-n',
  file: 'tong.py',
  name: 'Tổng từ 1 đến n',
  topic: 'Toán học',
  icon: 'calculator',
  color: 'green',
  description: 'Tính tổng các số nguyên từ 1 đến n.',
  stdin: '10',
  code: `n = int(input("n = "))
print(sum(range(1, n + 1)))`
}
```

Các màu thẻ có sẵn là `green`, `orange` và `purple`. Chọn tên icon từ `src/icons.js`. Đưa mẫu vào ba vị trí đầu để hiển thị ở mục **Thử một ví dụ**. Chạy ví dụ trên với đầu vào `10` và kiểm tra kết quả `55`.

## 6. Thêm chức năng mới

Ví dụ thêm một nút **Sao chép mã** vào thanh công cụ của trình soạn thảo:

1. Trong `index.html`, thêm `<button id="copy-code" class="secondary" type="button">Sao chép mã</button>` bên cạnh nút tải xuống.
2. Trong `src/main.js`, thêm đoạn sau gần hàm `download()`. Hàm `current()` trả về tệp đang mở, còn `notify()` hiển thị thông báo ngắn.
3. Chạy bản dev, chọn hai tệp khác nhau và thử dán kết quả vào một tệp trống. Kiểm tra ở cả giao diện sáng và tối.

```js
$('copy-code').onclick = async () => {
  try {
    await navigator.clipboard.writeText(current().code)
    notify('Đã sao chép mã.')
  } catch {
    notify('Hãy chọn mã và dùng Ctrl+C hoặc ⌘+C.')
  }
}
```

**Thay đổi bộ chạy.** Giao diện gửi tên tệp, mã, stdin và bản chụp các tệp tới `public/runner.js`. Worker phát các thông điệp `running`, `text`, `done` hoặc `failure`. Nút Dừng kết thúc worker. Nếu thêm loại kết quả mới, ví dụ một hình vẽ, cần bổ sung cả bên phát trong worker lẫn bên hiển thị trong `src/main.js`.

**Phạm vi Python.** Bản phát hành phục vụ Python cơ bản và các mô-đun chuẩn được đóng gói, chẳng hạn `math`, `collections`, `json` và `random`. Thư viện ngoài như NumPy cần được đóng gói thêm bằng bản dành cho Pyodide tương thích. Để hỗ trợ ngoại tuyến, chép các gói và phụ thuộc vào `public/runtime` bằng `scripts/runtime.mjs`, rồi gọi `runtime.loadPackage(...)` trong worker trước khi thực thi. Với thư viện giao diện hoặc đồ họa, cần thêm cách hiển thị đầu ra phù hợp trong trang.

**Dữ liệu đã lưu.** Khóa `pylab.workspace.v1` chứa phiên bản, ID tệp đang mở và danh sách tệp gồm ID, tên, mã, stdin và nguồn bài mẫu. Khóa `pylab.theme` chứa tùy chọn sáng/tối. Nếu đổi cấu trúc, thêm bước chuyển dữ liệu cũ trong `readWorkspace()` và thử với bài đã lưu.

## 7. Cập nhật web trên GitHub Pages

Chỉnh mã nguồn trong thư mục dự án và thử trên máy. Sau đó:

```sh
npm run build
git status
git add -A
git commit -m "Cap nhat bai mau Python"
git push origin main
```

Lệnh build cập nhật thư mục `docs/`. Commit cả mã nguồn lẫn các thay đổi trong `docs/`, sau đó đẩy lên `main`. GitHub Pages tự triển khai nội dung đã dựng. Trong **Settings → Pages**, nguồn là **Deploy from a branch → main → /docs**. Vào **Actions → pages build and deployment** để xem trạng thái. Nếu chỉ chỉnh README, bạn có thể commit và push ngay.

Trước khi xuất bản, thử chạy một bài mẫu, một bài có `input()`, một lỗi cú pháp, hai tệp có `import` và một vòng lặp cần dừng. Tải lại trang để kiểm tra bài còn nguyên. Nếu web hiện giao diện nhưng không chạy Python, kiểm tra các tệp `runner.js` và `runtime/pyodide.asm.wasm` được phục vụ cùng đường dẫn với `index.html`. Giữ `base: './'` trong cấu hình Vite để web chạy dưới đường dẫn tên kho.

## 8. Những trang đã tham khảo

- Cách vào thẳng môi trường thực hành từ trình duyệt. [Google Colab](https://developers.google.com/colab)
- Bài mẫu có thể mở và chạy từ cùng một không gian học. [Online Python](https://www.online-python.com/)
- Thao tác chạy, xem đầu ra, đổi chủ đề và tải tệp. [Programiz](https://www.programiz.com/python-programming/online-compiler/)
- Cách chia nội dung học bằng tiêu đề ngắn và lời dẫn tiếng Việt. [Dũng Lại Lập Trình](https://www.dunglailaptrinh.com/)
- Tài liệu kỹ thuật cho bộ chạy Python, trình soạn thảo và triển khai. [Pyodide](https://pyodide.org/en/0.27.7/), [CodeMirror](https://codemirror.net/docs/), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
