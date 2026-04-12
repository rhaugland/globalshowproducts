import {useState, useEffect, useCallback} from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminVariant {
  id?: number;
  title: string;
  price: string;
  compare_at_price: string;
  sku: string;
  inventory_quantity: number;
  weight: string;
  weight_unit: string;
  option1?: string;
  option2?: string;
}

export interface AdminProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  tags: string;
  status: 'active' | 'draft' | 'archived';
  handle: string;
  images: {id?: number; src: string; alt?: string}[];
  variants: AdminVariant[];
  options: {id?: number; name: string; values: string[]}[];
  collectionIds?: number[];
}

export interface AdminCollection {
  id: number;
  title: string;
  handle: string;
}

type ViewMode = 'list' | 'create' | 'edit';

// ─── API Helpers ─────────────────────────────────────────────────────────────

const AUTH_HEADERS = {'X-Admin-Auth': 'globalshowproducts'} as const;

async function fetchProducts(): Promise<AdminProduct[]> {
  const res = await fetch('/admin/api/products', {
    headers: {...AUTH_HEADERS},
  });
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
  const data = await res.json() as {products: AdminProduct[]};
  return data.products;
}

async function fetchProduct(
  id: number,
): Promise<{product: AdminProduct; collectionIds: number[]}> {
  const res = await fetch(`/admin/api/products?id=${id}`, {
    headers: {...AUTH_HEADERS},
  });
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.statusText}`);
  const data = await res.json() as {product: AdminProduct; collectionIds: number[]};
  return data;
}

async function fetchCollections(): Promise<AdminCollection[]> {
  const res = await fetch('/admin/api/products?collections=1', {
    headers: {...AUTH_HEADERS},
  });
  if (!res.ok) throw new Error(`Failed to fetch collections: ${res.statusText}`);
  const data = await res.json() as {collections: AdminCollection[]};
  return data.collections;
}

async function saveProduct(
  intent: 'create' | 'update',
  formData: Record<string, unknown>,
  collectionIds: number[],
  id?: number,
): Promise<AdminProduct> {
  const res = await fetch('/admin/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...AUTH_HEADERS,
    },
    body: JSON.stringify({intent, id, formData, collectionIds}),
  });
  const data = await res.json() as {product?: AdminProduct; error?: string};
  if (!res.ok || data.error) throw new Error(data.error ?? 'Save failed');
  return data.product!;
}

async function archiveProductApi(id: number): Promise<void> {
  const res = await fetch('/admin/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...AUTH_HEADERS,
    },
    body: JSON.stringify({intent: 'archive', id}),
  });
  const data = await res.json() as {error?: string};
  if (!res.ok || data.error) throw new Error(data.error ?? 'Archive failed');
}

// ─── ProductForm ──────────────────────────────────────────────────────────────

interface OptionType {
  name: string;
  values: string; // comma-separated
}

interface ProductFormProps {
  editId?: number;
  collections: AdminCollection[];
  onLoadCollections: () => Promise<void>;
  onDone: (product: AdminProduct) => void;
  onCancel: () => void;
}

function ProductForm({
  editId,
  collections,
  onLoadCollections,
  onDone,
  onCancel,
}: ProductFormProps) {
  // Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [tags, setTags] = useState('');

  // Options & variants
  const [options, setOptions] = useState<OptionType[]>([{name: '', values: ''}]);
  const [variants, setVariants] = useState<AdminVariant[]>([
    {
      title: 'Default Title',
      price: '',
      compare_at_price: '',
      sku: '',
      inventory_quantity: 0,
      weight: '',
      weight_unit: 'lb',
    },
  ]);

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');

  // Organization
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [formError, setFormError] = useState('');

  // Load collections on mount if not loaded
  useEffect(() => {
    if (collections.length === 0) {
      onLoadCollections();
    }
  }, [collections.length, onLoadCollections]);

  // Load existing product when editing
  useEffect(() => {
    if (!editId) return;
    setLoadingProduct(true);
    fetchProduct(editId)
      .then(({product, collectionIds}) => {
        setTitle(product.title);
        setDescription(product.body_html ?? '');
        setVendor(product.vendor ?? '');
        setTags(product.tags ?? '');
        setStatus(product.status === 'archived' ? 'active' : product.status);
        setSelectedCollections(collectionIds ?? []);

        // Options
        if (product.options && product.options.length > 0) {
          const loadedOptions = product.options
            .slice(0, 2)
            .map((o) => ({name: o.name, values: o.values.join(', ')}));
          setOptions(loadedOptions);
        }

        // Variants
        if (product.variants && product.variants.length > 0) {
          setVariants(
            product.variants.map((v) => ({
              id: v.id,
              title: v.title,
              price: v.price ?? '',
              compare_at_price: v.compare_at_price ?? '',
              sku: v.sku ?? '',
              inventory_quantity: v.inventory_quantity ?? 0,
              weight: v.weight ?? '',
              weight_unit: v.weight_unit ?? 'lb',
              option1: v.option1,
              option2: v.option2,
            })),
          );
        }

        // Images
        if (product.images && product.images.length > 0) {
          setImages(product.images.map((img) => img.src));
        }
      })
      .catch((err) => setFormError(err.message))
      .finally(() => setLoadingProduct(false));
  }, [editId]);

  // Auto-generate variants from option values
  useEffect(() => {
    const activeOptions = options.filter((o) => o.name.trim() && o.values.trim());
    if (activeOptions.length === 0) {
      setVariants([
        {
          title: 'Default Title',
          price: '',
          compare_at_price: '',
          sku: '',
          inventory_quantity: 0,
          weight: '',
          weight_unit: 'lb',
        },
      ]);
      return;
    }

    const opt1Values = activeOptions[0]?.values
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean) ?? [];
    const opt2Values =
      activeOptions[1]?.values
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean) ?? [];

    let combos: {option1: string; option2?: string; title: string}[];
    if (opt2Values.length > 0) {
      combos = opt1Values.flatMap((v1) =>
        opt2Values.map((v2) => ({option1: v1, option2: v2, title: `${v1} / ${v2}`})),
      );
    } else {
      combos = opt1Values.map((v1) => ({option1: v1, title: v1}));
    }

    setVariants((prev) =>
      combos.map((combo) => {
        // Preserve existing variant data if title matches
        const existing = prev.find((v) => v.title === combo.title);
        return existing
          ? {...existing, option1: combo.option1, option2: combo.option2}
          : {
              title: combo.title,
              price: prev[0]?.price ?? '',
              compare_at_price: prev[0]?.compare_at_price ?? '',
              sku: '',
              inventory_quantity: 0,
              weight: prev[0]?.weight ?? '',
              weight_unit: prev[0]?.weight_unit ?? 'lb',
              option1: combo.option1,
              option2: combo.option2,
            };
      }),
    );
  }, [options]);

  function updateVariant(index: number, field: keyof AdminVariant, value: string | number) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? {...v, [field]: value} : v)),
    );
  }

  function addImage() {
    const url = imageInput.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setImageInput('');
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: 'left' | 'right') {
    setImages((prev) => {
      const next = [...prev];
      const target = direction === 'left' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleCollection(id: number) {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    setFormError('');
    setSaving(true);

    try {
      const activeOptions = options.filter((o) => o.name.trim() && o.values.trim());
      const formData: Record<string, unknown> = {
        title: title.trim(),
        body_html: description,
        vendor: vendor.trim(),
        tags: tags.trim(),
        status,
        images: images.map((src) => ({src})),
        variants: variants.map((v) => ({
          id: v.id,
          price: v.price,
          compare_at_price: v.compare_at_price || null,
          sku: v.sku,
          inventory_quantity: Number(v.inventory_quantity),
          weight: v.weight ? Number(v.weight) : undefined,
          weight_unit: v.weight_unit,
          option1: v.option1,
          option2: v.option2,
        })),
        options:
          activeOptions.length > 0
            ? activeOptions.map((o) => ({
                name: o.name,
                values: o.values
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean),
              }))
            : undefined,
        metafields_global_title_tag: seoTitle || undefined,
        metafields_global_description_tag: seoDescription || undefined,
      };

      const product = await saveProduct(
        editId ? 'update' : 'create',
        formData,
        selectedCollections,
        editId,
      );
      onDone(product);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading product...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-gray">
          {editId ? 'Edit Product' : 'New Product'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-gray-500 hover:text-brand-red"
        >
          Cancel
        </button>
      </div>

      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* 1. Basic Info */}
      <section className="rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-brand-gray">Basic Info</h3>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Title <span className="text-brand-red">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product title"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description (HTML allowed)"
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Vendor</label>
            <input
              type="text"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="Brand or manufacturer"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
        </div>
      </section>

      {/* 2. Variants */}
      <section className="rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-brand-gray">Variants</h3>

        {/* Option types (up to 2) */}
        <div className="space-y-3">
          {options.slice(0, 2).map((opt, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Option {i + 1} Name
                </label>
                <input
                  type="text"
                  value={opt.name}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, idx) => (idx === i ? {...o, name: e.target.value} : o)),
                    )
                  }
                  placeholder={i === 0 ? 'e.g. Size' : 'e.g. Color'}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Values (comma-separated)
                </label>
                <input
                  type="text"
                  value={opt.values}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, idx) => (idx === i ? {...o, values: e.target.value} : o)),
                    )
                  }
                  placeholder={i === 0 ? 'S, M, L, XL' : 'Red, Blue, Green'}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
            </div>
          ))}
          {options.length < 2 && (
            <button
              type="button"
              onClick={() => setOptions((prev) => [...prev, {name: '', values: ''}])}
              className="text-xs font-semibold text-brand-red hover:text-brand-red-dark"
            >
              + Add another option
            </button>
          )}
        </div>

        {/* Variant table */}
        {variants.length > 0 && (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase text-gray-400">
                  <th className="pb-2 pr-3">Variant</th>
                  <th className="pb-2 pr-3">Price</th>
                  <th className="pb-2 pr-3">Compare At</th>
                  <th className="pb-2 pr-3">SKU</th>
                  <th className="pb-2 pr-3">Qty</th>
                  <th className="pb-2 pr-3">Weight</th>
                  <th className="pb-2">Unit</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-3 font-medium text-brand-gray">{v.title}</td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.price}
                        onChange={(e) => updateVariant(i, 'price', e.target.value)}
                        placeholder="0.00"
                        className="w-24 rounded border border-gray-200 px-2 py-1 text-sm focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.compare_at_price}
                        onChange={(e) => updateVariant(i, 'compare_at_price', e.target.value)}
                        placeholder="0.00"
                        className="w-24 rounded border border-gray-200 px-2 py-1 text-sm focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                        placeholder="SKU"
                        className="w-24 rounded border border-gray-200 px-2 py-1 text-sm focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        value={v.inventory_quantity}
                        onChange={(e) =>
                          updateVariant(i, 'inventory_quantity', Number(e.target.value))
                        }
                        className="w-16 rounded border border-gray-200 px-2 py-1 text-sm focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={v.weight}
                        onChange={(e) => updateVariant(i, 'weight', e.target.value)}
                        placeholder="0"
                        className="w-16 rounded border border-gray-200 px-2 py-1 text-sm focus:border-brand-red focus:outline-none"
                      />
                    </td>
                    <td className="py-2">
                      <select
                        value={v.weight_unit}
                        onChange={(e) => updateVariant(i, 'weight_unit', e.target.value)}
                        className="rounded border border-gray-200 bg-white px-2 py-1 text-sm focus:border-brand-red focus:outline-none"
                      >
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Images */}
      <section className="rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-brand-gray">Images</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImage();
              }
            }}
            placeholder="https://cdn.shopify.com/..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <button
            type="button"
            onClick={addImage}
            className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
          >
            Add
          </button>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={i} className="relative flex flex-col items-center gap-1">
                {i === 0 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold text-white">
                    Main
                  </span>
                )}
                <img
                  src={src}
                  alt={`Product image ${i + 1}`}
                  className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(i, 'left')}
                    disabled={i === 0}
                    className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-red-500 hover:bg-red-50"
                    title="Remove"
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 'right')}
                    disabled={i === images.length - 1}
                    className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                    title="Move right"
                  >
                    →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Organization */}
      <section className="rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-brand-gray">Organization</h3>

        {/* Collections */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500">Collections</label>
          {collections.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Loading collections...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {collections.map((col) => {
                const checked = selectedCollections.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      checked
                        ? 'border-brand-red bg-red-50 text-brand-red'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCollection(col.id)}
                      className="sr-only"
                    />
                    {col.title}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-500">Status</label>
          <div className="flex gap-4">
            {(['active', 'draft'] as const).map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="product-status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-brand-red"
                />
                <span className="capitalize text-brand-gray">{s}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SEO */}
      <section className="rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-brand-gray">SEO</h3>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">SEO Title</label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="Defaults to product title"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">SEO Description</label>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="Defaults to product description"
            rows={2}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3 pb-8">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-red px-6 py-2.5 font-bold text-white transition hover:bg-brand-red-dark disabled:opacity-60"
        >
          {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── ProductsManager ──────────────────────────────────────────────────────────

export function ProductsManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('list');
  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const loadCollections = useCallback(async () => {
    if (collections.length > 0) return;
    try {
      const cols = await fetchCollections();
      setCollections(cols);
    } catch {
      // Non-fatal — collections section will show "Loading..." indefinitely
    }
  }, [collections.length]);

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.vendor?.toLowerCase().includes(q);
  });

  function handleEdit(id: number) {
    setEditingId(id);
    setView('edit');
    if (collections.length === 0) {
      loadCollections();
    }
  }

  async function handleArchive(id: number) {
    if (!confirm('Archive this product? It will no longer be visible in the store.')) return;
    try {
      await archiveProductApi(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? {...p, status: 'archived' as const} : p)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Archive failed');
    }
  }

  function handleDone(product: AdminProduct) {
    setProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
    setView('list');
    setEditingId(undefined);
  }

  function handleCancel() {
    setView('list');
    setEditingId(undefined);
  }

  function getFirstPrice(product: AdminProduct): string {
    const v = product.variants?.[0];
    if (!v?.price) return '—';
    return `$${parseFloat(v.price).toFixed(2)}`;
  }

  function getTotalInventory(product: AdminProduct): number {
    return (product.variants ?? []).reduce(
      (sum, v) => sum + (v.inventory_quantity ?? 0),
      0,
    );
  }

  // ── Form views ──
  if (view === 'create' || view === 'edit') {
    return (
      <ProductForm
        editId={view === 'edit' ? editingId : undefined}
        collections={collections}
        onLoadCollections={loadCollections}
        onDone={handleDone}
        onCancel={handleCancel}
      />
    );
  }

  // ── List view ──
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-gray">Products</h2>
        <button
          onClick={() => {
            setEditingId(undefined);
            setView('create');
            if (collections.length === 0) loadCollections();
          }}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
        >
          + Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or vendor..."
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="mt-8 text-center text-sm text-gray-400">Loading products...</div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Product list */}
      {!loading && !error && (
        <>
          {filteredProducts.length === 0 ? (
            <p className="mt-8 text-center text-sm italic text-gray-400">
              {search ? 'No products match your search.' : 'No products found.'}
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {filteredProducts.map((product) => {
                const thumb = product.images?.[0]?.src;
                const price = getFirstPrice(product);
                const inventory = getTotalInventory(product);
                const statusColor =
                  product.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : product.status === 'draft'
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-gray-100 text-gray-500';

                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3"
                  >
                    {/* Thumbnail */}
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-brand-gray">
                          {product.title}
                        </p>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${statusColor}`}
                        >
                          {product.status}
                        </span>
                      </div>
                      {product.vendor && (
                        <p className="text-xs text-gray-400">{product.vendor}</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="hidden text-right sm:block">
                      <p className="text-sm font-semibold text-brand-gray">{price}</p>
                      <p className="text-xs text-gray-400">{inventory} in stock</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 gap-3">
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="text-xs font-semibold text-brand-red hover:underline"
                      >
                        Edit
                      </button>
                      {product.status !== 'archived' && (
                        <button
                          onClick={() => handleArchive(product.id)}
                          className="text-xs font-semibold text-gray-400 hover:text-gray-600 hover:underline"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-right text-xs text-gray-400">
            {filteredProducts.length} of {products.length} product
            {products.length !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}
