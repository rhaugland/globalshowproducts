import type {ProductVariant} from '~/lib/mock-storefront';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (variantId: string) => void;
}

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: VariantSelectorProps) {
  // Hide if only one variant titled "Default"
  if (variants.length === 1 && variants[0].title === 'Default') {
    return null;
  }

  // Group options by name
  const optionGroups = new Map<string, {value: string; variantId: string}[]>();

  for (const variant of variants) {
    for (const option of variant.selectedOptions) {
      if (!optionGroups.has(option.name)) {
        optionGroups.set(option.name, []);
      }
      const group = optionGroups.get(option.name)!;
      // Avoid duplicates
      if (!group.some((g) => g.value === option.value)) {
        group.push({value: option.value, variantId: variant.id});
      }
    }
  }

  const selectedVariant = variants.find((v) => v.id === selectedId);

  return (
    <div className="space-y-4">
      {Array.from(optionGroups.entries()).map(([name, options]) => (
        <div key={name}>
          <label className="text-sm font-medium text-gray-700">{name}</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {options.map((option) => {
              const isSelected = selectedVariant?.selectedOptions.some(
                (o) => o.name === name && o.value === option.value,
              );
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSelect(option.variantId)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                    isSelected
                      ? 'border-brand-gray bg-brand-gray text-white'
                      : 'border-gray-300 bg-white text-brand-gray hover:border-brand-gray'
                  }`}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
