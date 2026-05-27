export type BankTransferDetails = {
  bankName: string
  accountNumber: string
  accountName: string
}

export function getBankTransferDetails(): BankTransferDetails {
  const bankName = process.env.BANK_TRANSFER_BANK_NAME?.trim()
  const accountNumber = process.env.BANK_TRANSFER_ACCOUNT_NUMBER?.trim()
  const accountName = process.env.BANK_TRANSFER_ACCOUNT_NAME?.trim()

  if (!bankName || !accountNumber || !accountName) {
    throw new Error("Bank transfer details are not configured")
  }

  return { bankName, accountNumber, accountName }
}

export function isBankTransferEnabled() {
  try {
    getBankTransferDetails()
    return true
  } catch {
    return false
  }
}

export function isMonnifyCheckoutEnabled() {
  return process.env.MONNIFY_CHECKOUT_ENABLED !== "false"
}
