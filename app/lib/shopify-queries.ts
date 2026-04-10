const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  vendor
  tags
  availableForSale
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  images(first: 10) {
    nodes {
      url
      altText
    }
  }
  variants(first: 20) {
    nodes {
      id
      title
      availableForSale
      price {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
        }
      }
    }
  }
` as const;

export const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
      }
      products(first: 50) {
        nodes {
          ${PRODUCT_FIELDS}
        }
      }
    }
  }
` as const;

export const PRODUCT_BY_HANDLE_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
    }
  }
` as const;

export const PRODUCT_RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ${PRODUCT_FIELDS}
    }
  }
` as const;

export const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        ${PRODUCT_FIELDS}
      }
    }
  }
` as const;

export const SEARCH_PRODUCTS_QUERY = `#graphql
  query SearchProducts($query: String!, $first: Int!) {
    search(query: $query, first: $first, types: PRODUCT) {
      nodes {
        ... on Product {
          ${PRODUCT_FIELDS}
        }
      }
    }
  }
` as const;

export const ALL_PRODUCTS_QUERY = `#graphql
  query AllProducts($first: Int!) {
    products(first: $first) {
      nodes {
        ${PRODUCT_FIELDS}
      }
    }
  }
` as const;
