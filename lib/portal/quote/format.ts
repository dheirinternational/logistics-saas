export function formatGoodLabel(name: string): string {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function formatMoney(
  amount: string | number,
  currency: "Naira" | "Dollar",
  exchangeRate?: number,
  convertToNaira = false,
): string {
  const num = Number(amount) || 0
  const value =
    convertToNaira && exchangeRate ? num * exchangeRate : num
  const symbol = currency === "Dollar" ? "$" : "₦"
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}
