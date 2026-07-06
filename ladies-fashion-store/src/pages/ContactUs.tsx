import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';

export const ContactUs: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! Your message has been received. Our concierge will get back to you shortly.");
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16 text-center">
        <span className="text-[10px] font-bold tracking-widest text-brand-blush-dark uppercase">Get In Touch</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-2 text-brand-charcoal dark:text-white">Concierge & Contact</h1>
        <div className="h-0.5 w-16 bg-brand-blush-dark mx-auto mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Info Grid */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15 space-y-6">
            <h3 className="font-serif text-lg font-bold">Contact Details</h3>

            <div className="flex gap-4">
              <FiPhone className="text-brand-blush-dark h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Phone</h4>
                <p className="text-xs text-brand-charcoal/70 dark:text-brand-cream/70 mt-1">+91 9381040369</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiMail className="text-brand-blush-dark h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Email Inquiry</h4>
                <p className="text-xs text-brand-charcoal/70 dark:text-brand-cream/70 mt-1">pavankode697@gmail.com</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiMapPin className="text-brand-blush-dark h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Flagship Boutique</h4>
                <p className="text-xs text-brand-charcoal/70 dark:text-brand-cream/70 mt-1">Madurai,TamilNadu</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiClock className="text-brand-blush-dark h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Studio Hours</h4>
                <p className="text-xs text-brand-charcoal/70 dark:text-brand-cream/70 mt-1">Monday - Saturday: 10:00 AM - 7:00 PM</p>
                <p className="text-[10px] text-brand-charcoal/40 dark:text-brand-cream/40">Sunday: Closed for weaving rest</p>
              </div>
            </div>

          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white dark:bg-brand-charcoal/20 p-8 rounded-2xl border border-brand-beige-dark/15">
          <h3 className="font-serif text-lg font-bold border-b border-brand-beige-dark/10 pb-4 mb-6">Send A Message</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-brand-charcoal/50 dark:text-brand-cream/50 mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-brand-cream-light dark:bg-brand-charcoal/40 text-xs px-3.5 py-2.5 rounded-lg border border-brand-beige-dark/40 focus:outline-none focus:border-brand-blush-dark dark:text-brand-cream"
                placeholder="Write your suggestions, collection inquiries or feedback..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-brand-charcoal text-white text-xs font-bold py-3.5 px-8 rounded-lg hover:bg-brand-blush-dark transition uppercase tracking-widest"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
