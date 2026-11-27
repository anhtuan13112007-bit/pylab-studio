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
| Thanh trên | Bấm mũi tên **⌃** ở góc phải để thu thanh có nút **Hình nền** lên trên. Bấm mũi tên **⌄** ở mép trên để mở lại. Nút dùng được bằng chuột, cảm ứng hoặc phím Tab rồi Enter. Trình duyệt nhớ lựa chọn sau khi tải lại, riêng cho bản local và GitHub Pages. |
| Thanh bên | Mũi tên trên thanh trên cùng thu hoặc mở thanh PyLab. Chuyển giữa trình soạn thảo và thư viện. Dấu `+` tạo tệp. Nút `⋯` đổi tên hoặc xóa tệp sau khi xác nhận. Nhập mã UTF-8 từ tệp `.py` tối đa 1 MB. Tệp nhập trùng tên nhận hậu tố. |
| Trình soạn thảo | Tô màu cú pháp, đánh số dòng, thụt lề 4 dấu cách, đánh dấu cặp ngoặc, gấp khối, tìm trong mã và hoàn tác. Thanh dưới hiển thị vị trí con trỏ. |
| Bàn làm việc | Chạy tệp đang mở, dừng ngay cả khi mã lặp vô hạn, tải tệp hiện tại hoặc mở rộng vùng làm việc. Mỗi lần chạy dùng một môi trường Python mới. |
| Terminal | Xem lệnh chạy, kết quả, lỗi và thời gian thực thi sau khi nạp Python. Traceback hiển thị tên tệp và số dòng. Nút thùng rác xóa phần hiển thị. Đầu ra giới hạn 65.536 ký tự để bảo vệ độ phản hồi. |
| Đầu vào | Tệp mới nhận dữ liệu trực tiếp trong Terminal. Gõ một dòng tại dấu nhắc rồi bấm Enter. Dùng Ctrl+D hoặc nút EOF để báo kết thúc luồng nhập. Thẻ Đầu vào cho phép chuyển sang dữ liệu soạn sẵn để chạy lại một bộ test. Tệp cũ có sẵn dữ liệu vẫn dùng chế độ soạn sẵn. |
| Hình nền | Mở **Hình nền** trên thanh trên cùng. Chọn ảnh hoặc **Video từ máy** (MP4/WebM, hỗ trợ 4K), xem trước rồi bấm **Lưu giao diện**. Hai thanh trượt chỉnh riêng độ trong suốt của trình soạn thảo và Terminal. Có thể tạm dừng video ngay trên thanh trên. |
| Tệp và mô-đun | Mặc định, thư mục Python ảo chỉ có tệp đang chạy. Trong **Gói và tệp**, đánh dấu mô-đun bạn muốn bài này được đọc rồi bấm **Lưu**. Những tệp mới do chính chương trình Python ghi ra chỉ tồn tại trong lần chạy đó. |
| Thư viện mẫu | 8 bài về biến, nhập liệu, vòng lặp, dữ liệu và toán học. Tìm theo tên, chủ đề, tên tệp hoặc mô tả. Mở lại một mẫu sẽ quay về bản bạn đã sửa. |
| Thiết bị và hiển thị | Bài làm và giao diện sáng/tối được lưu trong trình duyệt. Máy tính hiển thị mã và kết quả cạnh nhau. Điện thoại xếp hai khung theo chiều dọc và thu thanh bên vào nút menu. |

Trang mở đầu tự chạy bài chào mẫu khi không gian chỉ còn tệp mẫu nguyên bản. Các tệp bạn tự viết chạy khi bạn bấm **Chạy mã**. Bài làm trên bản local và bản GitHub Pages có vùng lưu riêng. Dùng tải xuống và nhập tệp để chuyển giữa hai nơi. Bài làm có thể mất khi xóa dữ liệu trang hoặc đóng phiên riêng tư.

### Phím tắt

| Phím | Tác dụng |
| --- | --- |
| `Ctrl+B` hoặc `Ctrl+Enter` (⌘ trên Mac) | Chạy hoặc dừng chương trình |
| `Shift+F5` | Dừng chương trình, kể cả khi đang chờ nhập |
| `Enter` trong dòng nhập Terminal | Gửi một dòng, kể cả dòng trống |
| `Ctrl+D` trong dòng nhập Terminal | Báo kết thúc luồng nhập |
| `Ctrl+S` hoặc `⌘+S` | Lưu trên trình duyệt và tải tệp đang mở |
| `Ctrl+F` hoặc `⌘+F` trong vùng mã | Tìm trong tệp |
| `Tab` / `Shift+Tab` | Tăng / giảm thụt lề |
| `Esc`, sau đó `Tab` | Rời trình soạn thảo bằng bàn phím |
| `Esc` | Thoát chế độ mở rộng hoặc đóng hộp thoại |

### Thử nhập trực tiếp trong Terminal

Tạo một tệp trống, dán đoạn mã dưới đây và nhấn **Ctrl+B**. Khi Terminal hỏi từng câu, nhập câu trả lời rồi nhấn Enter. Ví dụ nhập `An` rồi `7` sẽ in ra `An: 49`.

```python
ten = input("Tên: ")
n = int(input("Số: "))
print(f"{ten}: {n ** 2}")
```

Để chuyển một bài mẫu đang dùng dữ liệu có sẵn sang nhập trực tiếp, mở **Đầu vào → Nguồn nhập liệu → Nhập ngay trong Terminal** rồi chạy lại. Nhập trực tiếp sử dụng khả năng tạm dừng WebAssembly của trình duyệt (JSPI). Với trình duyệt chưa hỗ trợ, chọn **Dùng các dòng nhập sẵn**.

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
| `src/appearance.js`, `src/appearance-store.js`, `src/background-photo.js`, `src/background-video.js` | Xem trước và lưu ảnh, video nền cùng độ trong suốt trên thiết bị. |
| `src/terminal.js`, `src/sandbox.js`, `public/sandbox.html` | Dựng khung cách ly, chuyển các tài nguyên công khai và trả dòng nhập qua kênh riêng cho từng lượt chạy. `public/terminal-sw.js` gỡ đăng ký bản cầu nối cũ khi trình duyệt cập nhật. |
| `src/main.js` | Điều hướng, nút bấm, quản lý tệp, lọc mẫu, chủ đề, phím tắt và giao tiếp với Web Worker. |
| `src/editor.js` | Cấu hình CodeMirror, chế độ Python, tô màu và theo dõi vị trí con trỏ. |
| `src/examples.js` | Nội dung mặc định `starter` và các bài trong Thư viện mẫu. |
| `src/storage.js` | Đọc, ghi không gian làm việc phiên bản 1 và kiểm tra tên tệp. |
| `src/icons.js` | Các biểu tượng Lucide được đưa vào bản dựng. |
| `public/workspace-imports.py`, `public/install-packages.py`, `public/package-loader.js` | Quét tệp của bài, nạp gói đã khai báo, phân giải các import và định tuyến các bản dựng Pyodide tới nguồn tương ứng. |
| `src/notebook.js` | Xuất tệp đang mở, các mô-đun đã chọn, đầu vào của bài và danh sách gói sang notebook Jupyter/Colab. |
| `public/runner.js` | Khởi tạo Python, chuẩn bị các mô-đun, đọc stdin, truyền kết quả và lỗi về giao diện. |
| `scripts/runtime.mjs` | Chuẩn bị bộ chạy, các gói toán học và danh sách tên import. Kiểm tra SHA-256 của từng gói theo lockfile của Pyodide. |
| `scripts/serve.mjs`, `Mo-PyLab.cmd` | Máy chủ local và lối tắt Windows. |
| `vite.config.js`, `package.json`, `package-lock.json` | Đường dẫn tài nguyên tương đối, lệnh dự án và phiên bản thư viện. |
| `docs/` | Bản web đã dựng, gồm giao diện và bộ chạy Python. Máy chủ local và GitHub Pages đều phục vụ thư mục này. Sửa các tệp nguồn rồi dựng lại để cập nhật. |

**Đổi giao diện.** Mở `src/style.css`. Sửa biến `--page`, `--surface`, `--ink`, `--green` cho nền, khung, chữ và màu nhấn. Cập nhật cả khối `:root[data-theme=dark]`. Đổi màu nút chạy ở `.primary` và tiêu đề bàn làm việc ở `index.html`. Xem lại trên màn hình hẹp và rộng bằng `npm run dev`.

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

Các màu thẻ có sẵn là `green`, `orange` và `purple`. Chọn tên icon từ `src/icons.js`. Mở **Thư viện mẫu** để xem các ví dụ. Chạy ví dụ trên với đầu vào `10` và kiểm tra kết quả `55`.

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

**Thay đổi bộ chạy.** Giao diện gửi tên tệp, mã, stdin và mã các tệp đã chọn tới `public/runner.js`. Worker phát các thông điệp `packages`, `running`, `text`, `done` hoặc `failure`. Nút Dừng kết thúc worker. Khi mã gọi `plt.show()`, backend Matplotlib trong `src/matplotlib-backend.py` vẽ ảnh PNG trong worker. Thông điệp `plot` chuyển ảnh tới `src/plots.js` để hiển thị ngay trong Terminal. Nhấn vào hình để phóng to hoặc tải ảnh PNG. Bản hiện tại hiển thị đồ thị tĩnh.

### Import thư viện

**Gói đi kèm.** Bản local có Matplotlib 3.8.4, pandas 2.2.3, SciPy 1.14.1, NumPy 2.0.2, SymPy 1.13.3, mpmath 1.3.0, micropip và các phụ thuộc tương ứng. Bạn có thể chạy các bài dùng chúng khi ngắt Internet. Khi truy cập web công khai, trình duyệt tải những tệp cần thiết từ GitHub Pages.

**Tự tìm gói.** Bấm **Chạy mã** sau khi viết `import` hoặc `from … import …`. PyLab đọc các lệnh import trong bài và trong các tệp Python mà bài đó sử dụng. Bộ nạp ưu tiên mô-đun có sẵn và tra danh mục Pyodide. Tên import ngoài danh mục sẽ báo để bạn chọn tệp hoặc khai báo gói. Muốn tải gói ngoài bản đóng sẵn, mở **Gói và tệp**, bật quyền Internet cho bài hiện tại và bấm **Lưu**.

**Tên gói khác tên import.** Trong **Gói và tệp**, điền tên phân phối, mỗi dòng một tên, rồi bấm **Lưu**. Ví dụ khai báo `python-slugify` và viết `from slugify import slugify`. Cũng có thể chọn phiên bản, ví dụ `humanize==4.12.3`. Danh sách gần nhất được lưu để điền lại hộp thoại. Quyền dùng Internet và các tệp được chia sẻ áp dụng riêng cho từng bài trong phiên hiện tại. Tải lại trang sẽ tắt các quyền này. Khai báo rõ tên gói nếu chương trình dùng import động. Với quyền Internet đã bật, cũng có thể dùng `import micropip` và `await micropip.install("tên-gói")`.

**Thử pandas và SciPy.**

```python
import pandas as pd
from scipy.linalg import det

print(pd.Series([2, 4, 6]).mean())  # 4.0
print(det([[1, 2], [3, 4]]))       # xấp xỉ -2
```

**Giới hạn trình duyệt.** PyPI cung cấp nhiều bản dựng cho những hệ điều hành và phiên bản Python khác nhau. PyLab chạy được các gói có wheel Python thuần hoặc phù hợp với môi trường WebAssembly và các phụ thuộc của chúng. Thư viện cần driver GPU, tiến trình hệ điều hành, cửa sổ desktop hoặc extension native có thể cần kernel CPython.

**Chạy bằng Jupyter hoặc Google Colab.** Trong **Gói và tệp → Xuất notebook**, tải tệp `.ipynb` rồi mở bằng Jupyter trên máy hoặc tải vào Colab. Các ô mã khôi phục các tệp đã chọn vào một thư mục tạm, liệt kê thư viện cần thiết rồi chạy bài với đầu vào đã chọn. Mặc định `allow_pip = False`. Chỉ đổi thành `True` sau khi xem danh sách gói. Notebook chạy với quyền của kernel trên máy hoặc Colab. Chọn kernel có phiên bản Python, hệ điều hành và phần cứng phù hợp. Việc xuất notebook diễn ra trên thiết bị của bạn.

**Ví dụ SymPy.**

```python
import sympy as sp

a = sp.Array([1, 2, 3, 4])
print(a)  # [1, 2, 3, 4]
```

Với NumPy, dùng `import numpy as np` rồi gọi `np.array([1, 2, 3, 4])`. Tên hàm, lớp và mô-đun trong Python phân biệt chữ hoa với chữ thường. Dùng `a[0]` để lấy phần tử đầu tiên sau khi tạo mảng.

**Đóng gói thêm thư viện để học ngoại tuyến.** Thêm tên phân phối có trong lockfile vào danh sách ở `scripts/runtime.mjs`, rồi chạy `npm run build`. Script lấy cả phụ thuộc, kiểm tra SHA-256 và tạo danh mục cho bộ nạp. Danh mục vừa mô tả tên import vừa xác định tài nguyên nào cần lấy từ CDN. Sau khi thử, commit cả mã nguồn lẫn `docs/`. Thư viện đồ họa có thể cần thêm giao diện để hiển thị kết quả.

**Dữ liệu đã lưu.** Khóa `pylab.workspace.v1` chứa phiên bản, ID tệp đang mở, danh sách gói `requirements` và danh sách tệp gồm ID, tên, mã, stdin và nguồn bài mẫu. Khóa `pylab.theme` chứa tùy chọn sáng/tối. `pylab.appearance.v1` lưu loại hình nền, màu, độ đậm và ảnh đã thu nhỏ trên thiết bị. Tùy chọn nguồn nhập `inputMode` được lưu theo tệp. Nếu đổi cấu trúc, thêm bước chuyển dữ liệu cũ trong `readWorkspace()` và thử với bài đã lưu.

### Quyền của một lần chạy

Ảnh nền JPG, PNG và WebP được kiểm tra định dạng thực, giới hạn 8 MB và 32 triệu điểm ảnh. PyLab vẽ lại ảnh thành JPEG rồi lưu bản thu nhỏ trong trình duyệt. Việc chọn ảnh, xem trước và lưu diễn ra trên thiết bị. Video được phát trực tiếp từ bản sao trên thiết bị, giữ độ phân giải gốc và tắt tiếng. Ảnh toàn trang đã lưu ở bản cũ vẫn được đọc. Hình nền mới và tùy chỉnh được lưu bằng IndexedDB khi trình duyệt hỗ trợ. Đóng hộp thoại sẽ bỏ thay đổi chưa lưu.

Mỗi lần bấm **Chạy mã**, trang tạo một iframe sandbox chỉ có quyền chạy script. Web Worker của Python có origin riêng dạng opaque. Trang soạn thảo gửi bản sao các tệp được chọn và chỉ chuyển dòng nhập khi Terminal yêu cầu. Lớp trung gian chỉ phục vụ tài nguyên có trong bản phát hành. Các gói Pyodide được kiểm tra SHA-256 theo lockfile.

Mặc định Worker có chính sách `connect-src 'none'`. Khi bạn bật quyền Internet trong **Gói và tệp**, mã trong bài và các thư viện của nó có thể kết nối tới PyPI và kho tệp PyPI. Trang soạn thảo chỉ tải các archive Pyodide có tên và hash đã biết từ jsDelivr. Dùng các gói đóng sẵn nếu bài cần xử lý dữ liệu riêng.

Bài làm và đầu vào được lưu trong bộ nhớ trang của hồ sơ trình duyệt. Trên GitHub Pages, các dự án dưới cùng giao thức và hostname dùng chung origin. Hãy giữ mật khẩu và token GitHub ngoài bài tập và notebook. PyLab không yêu cầu đăng nhập tài khoản GitHub.

Để chạy các kiểm tra quyền với dữ liệu giả, dùng `npm run test:security`. Khi sửa mã khởi động trong `public/sandbox.html`, cập nhật SHA-256 trong thẻ CSP tương ứng và chạy lại bộ kiểm tra.

## 7. Cập nhật web trên GitHub Pages

Chỉnh mã nguồn trong thư mục dự án và thử trên máy. Sau đó:

```sh
npm run build
git status
git add -- docs src public scripts index.html package.json package-lock.json vite.config.js README.md
git diff --cached --name-only
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
