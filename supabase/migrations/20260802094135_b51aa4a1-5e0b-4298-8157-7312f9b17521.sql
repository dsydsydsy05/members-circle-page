alter table public.partners add column logo_url text;

insert into public.partners (name, tier, blurb, url, sort_order, logo_url)
values (
  'NYU CEC',
  'ecosystem',
  'NYU Entrepreneurship Center — empowering student founders and innovators.',
  'https://entrepreneur.nyu.edu',
  100,
  '/partners/nyu-entrepreneurship.svg'
);
