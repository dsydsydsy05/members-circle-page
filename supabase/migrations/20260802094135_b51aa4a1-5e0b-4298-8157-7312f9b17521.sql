alter table public.partners add column logo_url text;

insert into public.partners (name, tier, blurb, url, sort_order, logo_url)
values (
  'NYU CEC',
  'ecosystem',
  'NYU Entrepreneurship Center — empowering student founders and innovators.',
  'https://entrepreneur.nyu.edu',
  100,
  '/__l5e/assets-v1/fa9b9880-5ec5-49c9-8688-aed133b33350/nyu-cec-logo.png'
);