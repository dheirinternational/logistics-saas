export type QuoteItemCart = {
  id: number
  name: string
  weight: number
  unit: "kg" | "cbm"
  numberOfItems: number
}

export type QuoteResultLine = {
  itemName: string
  price: string
  clearanceFee: string
  expectedDeliveryWindow: string
  quantity: number
}

export type QuoteResult = {
  goods: QuoteResultLine[]
  totalPrice: string
}

export type MoneyExchangeRate = {
  name: string
  currency_one: number
  currency_two: number
}

export type QuoteChannel = "air" | "sea" | "express"

export type QuoteCurrency = "Naira" | "Dollar"
