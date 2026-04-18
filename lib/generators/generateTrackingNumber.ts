export const generateTrackingNumber = (prefix="DHI") => {
    const date = new Date().toISOString().slice(0,10).replace(/-/g, "")
    const random = Math.random().toString(36).slice(2,8).toUpperCase()

    return `${prefix}-${date}-${random}`
}


export const generateOrderTrackingNumber = (prefix="DHI-ODR") => {
    const date = new Date().toISOString().slice(0,10).replace(/-/g, "")
    const random = Math.random().toString(36).slice(2,8).toUpperCase()

    return `${prefix}-${date}-${random}`
}
