// Contact channels render only when filled in — never ship an empty link.
export const site = {
  name: 'Hojiakbar Sharofiddinov',
  short: 'HSH',
  role: 'UI/UX Designer & Full-Stack Developer',
  location: 'Tashkent, Uzbekistan',
  timeZone: 'Asia/Tashkent',
  github: 'https://github.com/hojiakbar14092009-tech',
  email: '',
  phone: { display: '+998 77 210 53 88', href: 'tel:+998772105388' },
  socials: [
    { label: 'Telegram', handle: '@h009hss', href: 'https://t.me/h009hss' },
    { label: 'Instagram', handle: '@h009hs', href: 'https://instagram.com/h009hs' },
    { label: 'GitHub', handle: 'hojiakbar14092009-tech', href: 'https://github.com/hojiakbar14092009-tech' },
    { label: 'LinkedIn', handle: '', href: '' },
  ].filter((s) => s.href),
};
