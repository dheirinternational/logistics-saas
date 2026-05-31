"use client"

import { PortalAccountPageHeader } from "@/components/portal/account/PortalAccountPageHeader"
import { PortalPolicyInfoButton } from "@/components/portal/PortalPolicyInfoButton"
import { ShopDeliveryFeeDisplay } from "@/components/portal/shop/ShopDeliveryFeeDisplay"
import { fetchShopDeliveryQuote } from "@/lib/shop/fetchShopDeliveryQuote"
import type { ShopDeliveryFeeQuote } from "@/lib/shop/deliveryFee"
import { SHOP_DELIVERY_POLICY } from "@/lib/portal/customerPolicies"
import { useCartStore } from "@/store/cartStore"
import type { Address, Product, ProductCategory, ProductImage } from "@/types/entityTypeDef"
import {
  IconMinus,
  IconPlus,
  IconShoppingCart,
} from "@tabler/icons-react"
import { ProductStorageImage } from "@/components/shop/ProductStorageImage"
import {
  SHOP_BUY_NOW_CHECKOUT_PATH,
  startShopBuyNowCheckout,
} from "@/lib/shop/buyNowCheckout"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { toast } from "@/lib/ui/toast"
import { extractTrailingNumericId } from "@/lib/portal/slug"
import {
  getTierPricingLabel,
  getUnitPriceForQuantity,
  isTierDiscountApplied,
} from "@/lib/shop/pricing"
import {
  pickPreferredProductImage,
  sortProductImagesForGallery,
} from "@/lib/shop/productMedia"

export function PortalProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = extractTrailingNumericId(String(params.id ?? ""))

  const addProduct = useCartStore((s) => s.addProduct)
  const cart = useCartStore((s) => s.cart)

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string
    type: "image" | "video"
  } | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [deliveryQuote, setDeliveryQuote] = useState<ShopDeliveryFeeQuote>({
    zoneFee: 0,
    chargedFee: 0,
    freeDelivery: false,
  })
  const [quantity, setQuantity] = useState(1)

  const [loadingProduct, setLoadingProduct] = useState(true)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [buyNowLoading, setBuyNowLoading] = useState(false)

  const categoryLabel = useMemo(() => {
    if (!product) return "Shop"
    const cat = categories.find((c) => c.id === product.category_id)
    if (!cat) return "Shop"
    return cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
  }, [product, categories])

  const displayPrice = product
    ? getUnitPriceForQuantity({
        price: Number(product.price),
        discount_price: Number(product.discount_price ?? 0),
        discount_min_qty: Number(product.discount_min_qty ?? 0),
        quantity,
      })
    : 0
  const tierPricingLabel = product ? getTierPricingLabel(product) : null
  const discountActive = product
    ? isTierDiscountApplied({
        price: Number(product.price),
        discount_price: Number(product.discount_price ?? 0),
        discount_min_qty: Number(product.discount_min_qty ?? 0),
        quantity,
      })
    : false

  const inCart = product ? cart.some((item) => item.id === product.id) : false
  const inStock = (product?.stock_quantity ?? 0) > 0

  useEffect(() => {
    if (!productId) return

    let cancelled = false
    setLoadingProduct(true)

    Promise.all([
      fetch(`/api/products/${productId}`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
      fetch("/api/products/categories", { credentials: "include" }).then((r) =>
        r.json(),
      ),
    ])
      .then(([prodRes, catRes]) => {
        if (cancelled) return
        if (!prodRes?.data) {
          setProduct(null)
          return
        }
        const payload = prodRes.data as Product & { images?: ProductImage[] }
        const { images: rawImages = [], ...prod } = payload
        const imgs = sortProductImagesForGallery(rawImages)
        const preferred = pickPreferredProductImage(imgs)
        setProduct(prod)
        setImages(imgs)
        setCategories(catRes.data ?? [])
        setSelectedMedia(
          preferred?.image_url
            ? {
                url: preferred.image_url,
                type: preferred.media_type === "video" ? "video" : "image",
              }
            : null
        )
        setQuantity(1)
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load product")
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false)
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  useEffect(() => {
    let cancelled = false
    setLoadingAddress(true)

    fetch("/api/addresses/user", { credentials: "include" })
      .then((r) => r.json())
      .then(async (result) => {
        if (cancelled) return
        const addr = result?.data?.[0] as Address | undefined
        if (!addr) {
          setAddress(null)
          setDeliveryQuote({ zoneFee: 0, chargedFee: 0, freeDelivery: false })
          return
        }
        setAddress(addr)
        const quote = await fetchShopDeliveryQuote(addr.state)
        if (!cancelled) setDeliveryQuote(quote)
      })
      .catch(() => {
        if (!cancelled) setAddress(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingAddress(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleAddToCart = () => {
    if (!product || !selectedMedia) return

    if (inCart) {
      toast.info("Already in your cart")
      return
    }

    if (!address) {
      toast.error("Add your delivery address before adding to cart")
      return
    }

    if (!inStock) {
      toast.error("This product is out of stock")
      return
    }

    if (quantity > product.stock_quantity) {
      toast.error("Not enough stock available")
      return
    }

    addProduct({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      discount_price: Number(product.discount_price ?? 0),
      discount_min_qty: product.discount_min_qty ?? null,
      quantity: product.stock_quantity,
      image: selectedMedia.type === "image" ? selectedMedia.url : "/logo-colored.png",
      amount_to_be_ordered: quantity,
    })
    toast.success("Added to cart")
  }

  const handleBuyNow = async () => {
    if (!product || !selectedMedia) return

    if (!inStock) {
      toast.error("This product is out of stock")
      return
    }

    if (quantity > product.stock_quantity) {
      toast.error("Not enough stock available")
      return
    }

    setBuyNowLoading(true)
    try {
      const ok = await startShopBuyNowCheckout({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        discount_price: Number(product.discount_price ?? 0),
        discount_min_qty: product.discount_min_qty ?? null,
        quantity: product.stock_quantity,
        image:
          selectedMedia.type === "image"
            ? selectedMedia.url
            : "/logo-colored.png",
        amount_to_be_ordered: quantity,
      })
      if (ok) router.push(SHOP_BUY_NOW_CHECKOUT_PATH)
    } finally {
      setBuyNowLoading(false)
    }
  }

  if (loadingProduct) {
    return (
      <div className="portal-account portal-account--centered">
        <DheirLoader color="var(--color-dheir-blue)" size={12} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="portal-account">
        <PortalAccountPageHeader
          title="Product"
          description="This product could not be found."
          backHref="/customer/shop"
          backLabel="Shop"
        />
        <p className="portal-pdp__empty">
          <Link className="portal-cart__link" href="/customer/shop">
            Return to shop
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="portal-account portal-pdp">
      <PortalAccountPageHeader backHref="/customer/shop" backLabel="Shop" />

      <div className="portal-pdp__layout">
        <section className="portal-pdp__gallery portal-account__card">
          <figure className="portal-pdp__hero">
            {selectedMedia ? (
              selectedMedia.type === "video" ? (
                <video
                  src={selectedMedia.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="portal-pdp__hero-media"
                />
              ) : (
                <ProductStorageImage
                  src={selectedMedia.url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="portal-pdp__hero-media"
                />
              )
            ) : (
              <span className="portal-pdp__no-image">No image</span>
            )}
          </figure>

          {images.length > 1 ? (
            <div className="portal-pdp__thumbs" role="list">
              {images.map((image) => {
                const type = image.media_type === "video" ? "video" : "image"
                const active = image.image_url === selectedMedia?.url
                return (
                  <button
                    key={image.id}
                    type="button"
                    role="listitem"
                    className={`portal-pdp__thumb${active ? " is-active" : ""}`}
                    onClick={() => setSelectedMedia({ url: image.image_url, type })}
                    aria-label="View product image"
                    aria-current={active ? "true" : undefined}
                  >
                    {type === "video" ? (
                      <span className="portal-pdp__thumb-video" aria-hidden>
                        Video
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.image_url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="portal-pdp__thumb-img"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          ) : null}
        </section>

        <aside className="portal-pdp__buy portal-account__card">
          <div className="portal-pdp__heading">
            <p className="portal-pdp__category">{categoryLabel}</p>
            <h1 className="portal-pdp__title">{product.name}</h1>
          </div>

          <div className="portal-pdp__price-block">
            <p className="portal-pdp__price tabular-nums">
              ₦{displayPrice.toLocaleString()}
            </p>
            {discountActive ? (
              <p className="portal-pdp__price-was tabular-nums">
                ₦{Number(product.price).toLocaleString()}
              </p>
            ) : null}
            {tierPricingLabel ? (
              <p className="portal-cart__muted">{tierPricingLabel}</p>
            ) : null}
          </div>

          <p className="portal-pdp__stock">
            {inStock
              ? `${product.stock_quantity} in stock`
              : "Out of stock"}
          </p>

          {loadingAddress ? (
            <p className="portal-cart__muted">Loading delivery estimate…</p>
          ) : address ? (
            <div className="portal-pdp__shipping">
              <span className="portal-pdp__shipping-row">
                Delivery to {address.state}:{" "}
                <ShopDeliveryFeeDisplay
                  zoneFee={deliveryQuote.zoneFee}
                  chargedFee={deliveryQuote.chargedFee}
                  freeDelivery={deliveryQuote.freeDelivery}
                />
                <PortalPolicyInfoButton
                  policy={SHOP_DELIVERY_POLICY}
                  label="Shop delivery policy"
                />
              </span>
            </div>
          ) : (
            <p className="portal-pdp__shipping portal-pdp__shipping--warn">
              Add a{" "}
              <Link className="portal-cart__link" href="/customer/my_address">
                delivery address
              </Link>{" "}
              to see shipping and checkout.
            </p>
          )}

          <div className="portal-pdp__qty">
            <span className="portal-pdp__qty-label">Quantity</span>
            <div className="portal-cart-item__controls portal-pdp__qty-controls">
              <button
                type="button"
                className="portal-cart-item__qty-btn"
                disabled={quantity < 2}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <IconMinus size={18} stroke={1.5} aria-hidden />
              </button>
              <input
                type="number"
                min={1}
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  if (!Number.isFinite(next) || next < 1) return
                  setQuantity(Math.min(product.stock_quantity, next))
                }}
                className="portal-cart-item__qty-input"
                aria-label="Quantity"
              />
              <button
                type="button"
                className="portal-cart-item__qty-btn portal-cart-item__qty-btn--primary"
                disabled={quantity >= product.stock_quantity}
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock_quantity, q + 1))
                }
                aria-label="Increase quantity"
              >
                <IconPlus size={18} stroke={1.5} aria-hidden />
              </button>
            </div>
          </div>

          <div className="portal-pdp__actions">
            <button
              type="button"
              className="portal-packages__btn-primary portal-packages__btn-primary--block"
              disabled={!inStock || !selectedMedia || buyNowLoading}
              aria-busy={buyNowLoading}
              onClick={handleBuyNow}
            >
              {buyNowLoading ? "Starting checkout…" : "Buy now"}
            </button>

            <button
              type="button"
              className="portal-account__btn-secondary portal-pdp__cart-link"
              disabled={!inStock || !selectedMedia || inCart}
              onClick={handleAddToCart}
            >
              <IconShoppingCart size={20} stroke={1.5} aria-hidden />
              {inCart ? "In cart" : inStock ? "Add to cart" : "Out of stock"}
            </button>

            <Link
              href="/customer/marketplace/cart"
              className="portal-pdp__view-cart-link"
            >
              View cart
              {cart.length > 0 ? ` (${cart.length})` : ""}
            </Link>
          </div>

          {product.description ? (
            <div className="portal-pdp__details">
              <h2 className="portal-account__card-title">About this product</h2>
              <p className="portal-pdp__description">{product.description}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
