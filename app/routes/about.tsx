export default function AboutPage() {
  const brands = [
    {
      name: 'Roma E Mobile',
      description:
        'Premium European-style electric scooters built for comfort, safety, and everyday mobility.',
    },
    {
      name: 'Funny Gears / Funny Bricks',
      description:
        'Creative building and gear toys that spark imagination and develop STEM skills in children.',
    },
    {
      name: 'Deluxe Ribbon Magic',
      description:
        'Professional-quality ribbon and bow-making kits for crafters, florists, and DIY enthusiasts.',
    },
    {
      name: 'Global Show Products',
      description:
        'Our house brand delivering curated specialty items and accessories for every occasion.',
    },
    {
      name: 'CraftPro Essentials',
      description:
        'Reliable crafting supplies and tools designed for hobbyists and professional artisans alike.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-navy">About Us</h1>

      <div className="mt-8 space-y-5 text-gray-700 leading-relaxed">
        <p>
          Global Show Products was founded by Betty Kriedberg with a simple mission: bring
          unique, high-quality products to customers who value craftsmanship and innovation.
          What started as a small family business has grown into a trusted source for
          specialty items spanning mobility, crafts, toys, and more.
        </p>
        <p>
          From professional-grade ribbon and bow-making supplies to innovative European
          electric scooters, our product line reflects Betty&apos;s passion for discovering
          items that genuinely improve people&apos;s lives. Every product in our catalog is
          hand-selected and tested to meet our standards for quality, durability, and value.
        </p>
        <p>
          Our commitment to exceptional customer service is at the heart of everything we do.
          We believe that shopping should be a personal experience, and our team is always
          ready to help you find exactly what you need. Whether you&apos;re a crafter looking
          for the perfect bow maker, a family searching for engaging toys, or someone
          exploring electric scooter options, we&apos;re here to help.
        </p>
      </div>

      {/* Our Brands */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-navy">Our Brands</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="rounded-lg border border-gray-200 p-5 hover:border-orange/50 hover:shadow-sm transition"
            >
              <h3 className="font-bold text-navy">{brand.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{brand.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
