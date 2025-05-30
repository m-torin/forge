export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array] // Tạo bản sao mảng
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // Chọn chỉ số ngẫu nhiên
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]] // Hoán đổi phần tử
  }
  return newArray
}
