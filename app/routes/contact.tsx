import {useState} from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm({...form, [e.target.name]: e.target.value});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Page heading */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-brand-gray">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500">
          Have a question about an order, a product, or just want to say hello?
          We&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact info cards — side by side */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-red/10">
            <svg className="h-5 w-5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-brand-gray">Call Us</h3>
            <p className="mt-0.5 text-sm text-gray-500">Mon-Fri, 9am-5pm CST</p>
            <a href="tel:952-238-9702" className="mt-1 block text-sm font-semibold text-brand-red hover:underline">
              952-238-9702
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-red/10">
            <svg className="h-5 w-5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-brand-gray">Email</h3>
            <p className="mt-0.5 text-sm text-gray-500">We reply within 24 hours</p>
            <a href="mailto:info@globalshowproducts.com" className="mt-1 block text-sm font-semibold text-brand-red hover:underline">
              info@globalshowproducts.com
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-gray-200 p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-red/10">
            <svg className="h-5 w-5 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-brand-gray">Mailing Address</h3>
            <p className="mt-0.5 text-sm text-gray-500">
              6520 Edenvale Blvd., Suite 106A<br />
              Eden Prairie, MN 55346
            </p>
          </div>
        </div>
      </div>

      {/* Contact form — full width */}
      {submitted ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50 px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-brand-gray">Message Sent!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Thank you for reaching out. We&apos;ll get back to you within 24 hours.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({name: '', email: '', subject: '', message: ''});
            }}
            className="mt-6 rounded-lg bg-brand-red px-5 py-2 text-sm font-bold text-white transition hover:bg-brand-red-dark"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 p-6 md:p-8"
        >
          <h2 className="mb-6 text-xl font-bold text-brand-gray">
            Send Us a Message
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-brand-gray">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-gray">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-brand-gray">
              Subject *
            </label>
            <select
              id="subject"
              name="subject"
              required
              value={form.subject}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            >
              <option value="">Select a topic...</option>
              <option value="order">Order Inquiry</option>
              <option value="product">Product Question</option>
              <option value="shipping">Shipping &amp; Returns</option>
              <option value="wholesale">Wholesale / Bulk Orders</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mt-5">
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-brand-gray">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              value={form.message}
              onChange={handleChange}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              placeholder="How can we help you?"
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-brand-red px-8 py-3 font-bold text-white transition hover:bg-brand-red-dark sm:w-auto"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
