// Contact channels render only when filled in — never ship an empty link.
export const site = {
  name: 'Hojiakbar Sharofiddinov',
  short: 'HSH',
  role: 'UI/UX Designer & Full-Stack Developer',
  location: 'Tashkent, Uzbekistan',
  timeZone: 'Asia/Tashkent',
  github: 'https://github.com/hojiakbar14092009-tech',
  email: '',
  socials: [
    { label: 'GitHub', href: 'https://github.com/hojiakbar14092009-tech' },
    { label: 'Telegram', href: '' },
    { label: 'Instagram', href: '' },
    { label: 'LinkedIn', href: '' },
  ].filter((s) => s.href),
};
