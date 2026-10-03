import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, ShieldCheck, Truck, Users } from 'lucide-react';

const STATS = [
  { value: '10k+', label: 'Happy customers' },
  { value: '500+', label: 'Products' },
  { value: '48h', label: 'Average delivery' },
  { value: '4.8★', label: 'Average rating' },
];

const VALUES = [
  { icon: Award, title: 'Quality first', text: 'Every product is picked for quality and value before it reaches our shelves.' },
  { icon: Truck, title: 'Reliable delivery', text: 'Track your order from checkout to your doorstep with real-time updates.' },
  { icon: Heart, title: 'Customer love', text: 'Honest reviews and friendly support so you can shop with confidence.' },
  { icon: ShieldCheck, title: 'Secure & simple', text: 'Razorpay or Cash on Delivery — safe payments and easy cancellation.' },
];

const STEPS = [
  { n: '01', title: 'Browse', text: 'Explore categories and read real reviews.' },
  { n: '02', title: 'Order', text: 'Pay online or choose Cash on Delivery.' },
  { n: '03', title: 'Track', text: 'Get live status updates by email and in-app.' },
  { n: '04', title: 'Enjoy', text: 'Receive it, love it, and leave a review.' },
];

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gray-950 py-16 text-white sm:py-24">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-primary-200">
            <Users className="h-3.5 w-3.5" aria-hidden="true" /> About ShopEase
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-5xl">
            Online shopping that is <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">simple, honest</span> and enjoyable.
          </h1>
          <p className="mt-4 text-white/70">
            We started ShopEase with one idea: you should always know what you are buying, what it costs and when it will arrive.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative z-10 -mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg sm:grid-cols-4 sm:p-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-primary-600 sm:text-3xl">{s.value}</p>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Our story</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">A carefully chosen range, at fair prices.</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              ShopEase brings together products we would happily buy ourselves. We keep things transparent — clear pricing,
              real customer reviews, secure payments and straightforward order tracking — so there are never any surprises.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold text-gray-900">How it works</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="relative rounded-2xl bg-primary-50/60 p-5">
                <span className="text-3xl font-black text-primary-200">{s.n}</span>
                <h3 className="mt-1 font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="my-16 overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-primary-800 p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to find something you'll love?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-primary-50">
              Browse products <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/contact" className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold transition hover:bg-white/10">Contact us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
