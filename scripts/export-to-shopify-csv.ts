import {readFileSync, writeFileSync} from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read products
const productsPath = join(__dirname, '..', 'app', 'data', 'products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

// Shopify CSV headers
const headers = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags',
  'Published', 'Option1 Name', 'Option1 Value', 'Variant Price',
  'Variant Compare At Price', 'Variant Requires Shipping', 'Variant Taxable',
  'Image Src', 'Image Alt Text', 'Status',
];

const rows: string[][] = [];

for (const product of products) {
  for (let i = 0; i < product.variants.length; i++) {
    const variant = product.variants[i];
    const isFirst = i === 0;
    const optionName = variant.selectedOptions?.[0]?.name ?? '';
    const optionValue = variant.selectedOptions?.[0]?.value ?? variant.title ?? 'Default';

    rows.push([
      product.handle,
      isFirst ? product.title : '',
      isFirst ? `<p>${product.description}</p>` : '',
      isFirst ? product.brand : '',
      isFirst ? product.collectionIds[0]?.replace('col-', '') ?? '' : '',
      isFirst ? product.tags.join(', ') : '',
      'TRUE',
      optionName || 'Title',
      optionValue,
      variant.price.toFixed(2),
      product.compareAtPrice ? product.compareAtPrice.toFixed(2) : '',
      'TRUE',
      'TRUE',
      isFirst && product.images[0] ? product.images[0] : '',
      isFirst ? product.title : '',
      product.available ? 'active' : 'draft',
    ]);
  }
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const csv = [
  headers.join(','),
  ...rows.map((row) => row.map(escapeCsv).join(',')),
].join('\n');

const outPath = join(__dirname, '..', 'shopify-products.csv');
writeFileSync(outPath, csv);
console.log(`Exported ${products.length} products to ${outPath}`);
