export function getRandomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined // Xử lý mảng rỗng
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}
