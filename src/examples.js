export const starter = {
  name: 'main.py',
  code: `# Chào mừng bạn đến với PyLab!
def chao_ban(ten):
    return f"Xin chào, {ten}!"

print(chao_ban("Python"))

for buoc in range(1, 4):
    print(f"Bước {buoc}: Cùng học Python")`,
  stdin: ''
}

// id và file cần duy nhất. Mỗi ví dụ mở thành một tệp riêng.
export const examples = [
  { id:'hello', file:'xin_chao.py', name:'Xin chào, Python!', topic:'Nhập môn', icon:'hand', color:'orange', description:'Bắt đầu với biến và lệnh print().',
    code:`loi_chao = "Xin chào, Python!"
print(loi_chao)
print("Hôm nay mình bắt đầu viết mã.")` },
  { id:'fibonacci', file:'fibonacci.py', name:'Dãy Fibonacci', topic:'Vòng lặp', icon:'infinity', color:'green', description:'Tạo dãy số từ hai số liền trước.',
    code:`a, b = 0, 1
day_so = []

for i in range(10):
    day_so.append(a)
    a, b = b, a + b

print(*day_so, sep=", ")` },
  { id:'stars', file:'thap_sao.py', name:'Kim tự tháp sao', topic:'Vòng lặp', icon:'pyramid', color:'purple', description:'Vẽ hình bằng chuỗi và vòng lặp.',
    code:`chieu_cao = 5

for tang in range(chieu_cao):
    khoang_trang = " " * (chieu_cao - tang - 1)
    ngoi_sao = "*" * (2 * tang + 1)
    print(khoang_trang + ngoi_sao)` },
  { id:'input', file:'lam_quen.py', name:'Làm quen với input()', topic:'Nhập môn', icon:'keyboard', color:'green', description:'Đọc tên từ thẻ Đầu vào.', stdin:'An',
    code:`ten = input("Tên của bạn: ")
print(f"Rất vui được gặp {ten}!")` },
  { id:'mean', file:'diem_so.py', name:'Điểm trung bình', topic:'Dữ liệu', icon:'chart-column', color:'orange', description:'Tính trung bình của một danh sách.',
    code:`diem = [8, 7.5, 9, 8.5]
trung_binh = sum(diem) / len(diem)

print(f"Trung bình: {trung_binh:.2f}")
print(f"Cao nhất: {max(diem)}")` },
  { id:'prime', file:'so_nguyen_to.py', name:'Kiểm tra số nguyên tố', topic:'Toán học', icon:'calculator', color:'purple', description:'Kết hợp điều kiện với hàm isqrt().', stdin:'29',
    code:`from math import isqrt

n = int(input("Nhập số nguyên: "))
la_nguyen_to = n >= 2 and all(
    n % i != 0 for i in range(2, isqrt(n) + 1)
)
print("Là số nguyên tố" if la_nguyen_to else "Không phải số nguyên tố")` },
  { id:'words', file:'dem_tu.py', name:'Đếm số lần xuất hiện', topic:'Dữ liệu', icon:'list-ordered', color:'green', description:'Thống kê các từ với Counter.',
    code:`from collections import Counter

tu = "mây nắng gió mây gió mây".split()
for ten, so_lan in Counter(tu).most_common():
    print(f"{ten}: {so_lan}")` },
  { id:'equation', file:'phuong_trinh.py', name:'Phương trình bậc nhất', topic:'Toán học', icon:'variable', color:'orange', description:'Xét các trường hợp của ax + b = 0.', stdin:'2\n-6',
    code:`a = float(input("a = "))
b = float(input("b = "))

if a != 0:
    print(f"x = {-b / a:g}")
elif b == 0:
    print("Vô số nghiệm")
else:
    print("Vô nghiệm")` }
]
