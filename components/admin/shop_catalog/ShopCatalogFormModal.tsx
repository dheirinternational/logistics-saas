"use client"

import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal"
import { MediaUploadModal } from "@/components/admin/media/MediaUploadModal"
import { DheirLoader } from "@/components/ui/DheirLoader"
import { DheirSelect } from "@/components/ui/DheirSelect"
import type { AdminMediaItem } from "@/lib/media/adminMedia"
import type { ShopCatalogItem } from "@/lib/shop/shopCatalog"
import { toast } from "@/lib/ui/toast"
import type { ProductCategory } from "@/types/entityTypeDef"
import { IconPhoto, IconX } from "@tabler/icons-react"
import Image from "next/image"
import { FormEvent, useEffect, useState } from "react"

type ShopCatalogFormModalProps = {
  item?: ShopCatalogItem | null
  categories: ProductCategory[]
  onClose: () => void
  onSaved: () => void
}

type FormValues = {
  title: string
  description: string
  image_alt: string
  category_id: number | ""
  sort_order: number | ""
  is_active: boolean
}

export function ShopCatalogFormModal({
  item,
  categories,
  onClose,
  onSaved,
}: ShopCatalogFormModalProps) {
  const isEditing = Boolean(item?.id)

  const [values, setValues] = useState<FormValues>({
    title: item?.title ?? "",
    description: item?.description ?? "",
    image_alt: item?.image_alt ?? "",
    category_id: item?.category_id ?? "",
    sort_order: item?.sort_order ?? "",
    is_active: item?.is_active ?? true,
  })
  const [selectedMedia, setSelectedMedia] = useState<AdminMediaItem[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!item?.media_asset_id || !item.image_url) return
    setSelectedMedia([
      {
        id: item.media_asset_id,
        name: item.image_alt || item.title,
        path: "",
        publicUrl: item.image_url,
        mediaType: "photo",
        sizeBytes: 0,
        updatedAt: null,
      },
    ])
  }, [item])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!values.title.trim()) {
      toast.error("Title is required")
      return
    }

    const hasExistingImage = Boolean(item?.image_url)
    if (selectedMedia.length === 0 && !hasExistingImage) {
      toast.error("Choose an image from the media library")
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        image_alt: values.image_alt.trim() || values.title.trim(),
        category_id: values.category_id === "" ? null : values.category_id,
        sort_order: values.sort_order === "" ? undefined : Number(values.sort_order),
        is_active: values.is_active,
        ...(selectedMedia[0]
          ? { media_asset_id: selectedMedia[0].id }
          : isEditing
            ? {}
            : {}),
      }

      const res = await fetch(
        isEditing
          ? `/api/admin/shop-catalog/${item!.id}`
          : "/api/admin/shop-catalog",
        {
          method: isEditing ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const result = await res.json()
      if (!res.ok) {
        toast.error(result.message || "Could not save catalog item")
        return
      }

      toast.success(result.message || "Catalog item saved")
      onSaved()
      onClose()
    } catch {
      toast.error("Could not save catalog item")
    } finally {
      setSaving(false)
    }
  }

  const previewUrl = selectedMedia[0]?.publicUrl ?? item?.image_url ?? null

  return (
    <>
      <div
        className="shop-catalog-modal__backdrop"
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget && !saving) onClose()
        }}
      >
        <div
          className="shop-catalog-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shop-catalog-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="shop-catalog-modal__head">
            <div>
              <p className="shop-catalog-modal__eyebrow">Shop catalog</p>
              <h2 id="shop-catalog-modal-title" className="shop-catalog-modal__title">
                {isEditing ? "Edit catalog item" : "Add catalog item"}
              </h2>
              <p className="shop-catalog-modal__sub">
                Shown on the landing page and customer shop.
              </p>
            </div>
            <button
              type="button"
              className="shop-catalog-modal__close"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
            >
              <IconX size={20} stroke={1.5} aria-hidden />
            </button>
          </header>

          <form className="shop-catalog-modal__form" onSubmit={handleSubmit}>
            <div className="shop-catalog-modal__fields">
              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Title</span>
                <input
                  className="dheir-input"
                  value={values.title}
                  onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                  placeholder="e.g. Fashion"
                  required
                  disabled={saving}
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Description</span>
                <textarea
                  className="portal-packages__textarea shop-catalog-modal__textarea"
                  rows={4}
                  value={values.description}
                  onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                  placeholder="Short copy shown on the catalog card"
                  disabled={saving}
                />
              </label>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">
                  Link to product category (optional)
                </span>
                <DheirSelect
                  value={values.category_id === "" ? "" : String(values.category_id)}
                  disabled={saving}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      category_id: e.target.value ? Number(e.target.value) : "",
                    }))
                  }
                >
                  <option value="">None — card won&apos;t filter products</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                    </option>
                  ))}
                </DheirSelect>
              </label>

              <div className="portal-packages__field">
                <span className="portal-packages__field-label">Cover image</span>
                {previewUrl ? (
                  <div className="shop-catalog-modal__image-preview">
                    <div className="shop-catalog-modal__image-frame">
                      <Image
                        src={previewUrl}
                        alt={values.image_alt || values.title || "Catalog cover"}
                        fill
                        sizes="480px"
                        className="shop-catalog-modal__image"
                      />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="portal-home__btn portal-home__btn--secondary shop-catalog-modal__image-btn"
                        onClick={() => setPickerOpen(true)}
                        disabled={saving}
                      >
                        Change image
                      </button>
                      <button
                        type="button"
                        className="portal-home__btn portal-home__btn--primary shop-catalog-modal__image-btn"
                        onClick={() => setUploadOpen(true)}
                        disabled={saving}
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      className="shop-catalog-modal__picker"
                      onClick={() => setPickerOpen(true)}
                      disabled={saving}
                      style={{ flex: 1 }}
                    >
                      <IconPhoto size={20} stroke={1.5} aria-hidden />
                      <span>Choose cover image</span>
                    </button>
                    <button
                      type="button"
                      className="portal-home__btn portal-home__btn--primary"
                      onClick={() => setUploadOpen(true)}
                      disabled={saving}
                      style={{ height: "48px" }}
                    >
                      Upload
                    </button>
                  </div>
                )}
              </div>

              <label className="portal-packages__field">
                <span className="portal-packages__field-label">Image alt text</span>
                <input
                  className="dheir-input"
                  value={values.image_alt}
                  onChange={(e) => setValues((v) => ({ ...v, image_alt: e.target.value }))}
                  placeholder="Describe the image for accessibility"
                  disabled={saving}
                />
              </label>

              <div className="shop-catalog-modal__meta-row">
                <label className="portal-packages__field shop-catalog-modal__sort-field">
                  <span className="portal-packages__field-label">Sort order</span>
                  <input
                    type="number"
                    min={0}
                    className="dheir-input"
                    value={values.sort_order}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        sort_order: e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    placeholder="Auto"
                    disabled={saving}
                  />
                </label>

                <div className="portal-packages__field shop-catalog-modal__visibility">
                  <span className="portal-packages__field-label">Visibility</span>
                  <label className="admin-shop-toggle shop-catalog-modal__toggle">
                    <input
                      type="checkbox"
                      className="admin-shop-toggle__input"
                      checked={values.is_active}
                      disabled={saving}
                      onChange={(e) =>
                        setValues((v) => ({ ...v, is_active: e.target.checked }))
                      }
                    />
                    <span className="admin-shop-toggle__track" aria-hidden />
                    <span className="admin-shop-toggle__label">
                      {values.is_active ? "Visible on shop" : "Hidden"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <footer className="shop-catalog-modal__foot">
              <button
                type="button"
                className="portal-home__btn portal-home__btn--secondary shop-catalog-modal__foot-btn"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="portal-home__btn portal-home__btn--primary shop-catalog-modal__foot-btn"
                disabled={saving}
              >
                {saving ? (
                  <DheirLoader color="#fff" size={10} />
                ) : isEditing ? (
                  "Save changes"
                ) : (
                  "Add item"
                )}
              </button>
            </footer>
          </form>
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        title="Choose catalog cover image"
        maxCount={1}
        minCount={1}
        initialSelected={selectedMedia}
        onClose={() => setPickerOpen(false)}
        onConfirm={(items) => {
          const photo = items.find((entry) => entry.mediaType === "photo")
          if (!photo) {
            toast.error("Catalog cards must use an image")
            return
          }
          setSelectedMedia([photo])
          setPickerOpen(false)
        }}
      />

      <MediaUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onFinished={(assets) => {
          const photo = assets.find((entry) => entry.mediaType === "photo")
          if (photo) {
            setSelectedMedia([photo])
          }
          setUploadOpen(false)
        }}
      />
    </>
  )
}
