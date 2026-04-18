import { Link } from 'react-router-dom';
import { Briefcase, Shield, Users, Zap, ArrowRight, Star, MapPin } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

const features = [
  { icon: Shield, title: 'Verified Contractors', desc: 'Every contractor on WorkerLink is reviewed and verified before being listed.' },
  { icon: Zap, title: 'Fast Proposals', desc: 'Post your job and receive competitive proposals from qualified contractors within hours.' },
  { icon: Users, title: 'Transparent Pricing', desc: 'Labor pricing is locked before work begins — no surprises, no disputes.' },
];

const trades = ['Mason', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Tiler', 'Welder', 'Roofer'];

const stats = [
  { value: '2,400+', label: 'Jobs Completed' },
  { value: '380+', label: 'Verified Contractors' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '25', label: 'Districts Covered' },
];

export function Landing(): JSX.Element {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-amber-300 text-xs font-display font-semibold mb-6 border border-white/10">
              <Star size={12} className="fill-amber-300" />
              Sri Lanka's #1 Labour Marketplace
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
              Find the right
              <span className="text-amber-400"> contractor</span>
              <br />for your project
            </h1>
            <p className="text-navy-200 text-lg mb-8 leading-relaxed max-w-xl">
              Connect with verified blue-collar contractors across Sri Lanka.
              Post your job, compare proposals, and lock the price — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-amber text-base px-6 py-3 gap-2">
                Post a job <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20 text-base px-6 py-3">
                I'm a contractor
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display font-extrabold text-2xl text-amber-400">{stat.value}</div>
                  <div className="text-navy-300 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trades */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Trades we cover</h2>
            <p className="text-gray-500 text-sm">Labour-only services across all major trades</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {trades.map((trade) => (
              <span key={trade} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-display font-medium text-gray-700 shadow-card hover:shadow-card-hover hover:border-navy-200 transition-all cursor-pointer">
                {trade}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-3">Why WorkerLink?</h2>
            <p className="text-gray-400 max-w-md mx-auto">Built for Sri Lanka's labour market — transparent, trustworthy, and simple.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 group hover:shadow-card-hover hover:border-navy-100 transition-all">
                <div className="p-3 bg-navy-50 rounded-xl w-fit mb-4 group-hover:bg-navy-100 transition-colors">
                  <f.icon size={22} className="text-navy-900" />
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl mb-3">How it works</h2>
            <p className="text-navy-300 text-sm">Simple. Transparent. Reliable.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: '01', title: 'Post your job', desc: 'Describe your labour needs, location, and timeline.' },
              { n: '02', title: 'Receive proposals', desc: 'Verified contractors submit competitive proposals.' },
              { n: '03', title: 'Lock the price', desc: 'Negotiate and lock the final labour price securely.' },
              { n: '04', title: 'Job done', desc: 'Contractor executes the job. Rate when complete.' },
            ].map((step) => (
              <div key={step.n} className="relative">
                <div className="text-4xl font-display font-extrabold text-white/10 mb-3">{step.n}</div>
                <h3 className="font-display font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-navy-300 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-amber-50">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-500 mb-8">Join thousands of customers and contractors already using WorkerLink.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3">
              Create free account
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-navy-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-navy-800 rounded-lg">
              <Briefcase size={16} className="text-amber-400" />
            </div>
            <span className="font-display font-bold text-white text-sm">
              Worker<span className="text-amber-400">Link</span>
            </span>
          </div>
          <p className="text-xs text-navy-500">© {new Date().getFullYear()} WorkerLink. Cenzios (Pvt) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-navy-500">
            <MapPin size={12} />
            Sri Lanka
          </div>
        </div>
      </footer>
    </div>
  );
}
