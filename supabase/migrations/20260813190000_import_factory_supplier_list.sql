-- Import the supplier workbook received on 2026-08-13.
-- "Nail" and "千程" are intentionally omitted because their source rows contain no supplier details.

alter table public.factories
  add column if not exists sample_time text not null default '',
  add column if not exists contact text not null default '';

comment on column public.factories.sample_time is 'Typical sample production time supplied by the factory.';
comment on column public.factories.contact is 'Member-only factory contact details.';

-- Remove the original demonstration rows before publishing the real member list.
delete from public.factories
where website = 'https://example.com'
  and name in (
    'Nanhai Knit Works',
    'Porto Cut & Sew',
    'Aegean Ceramics',
    'Kobe Paperworks'
  );

create temporary table factory_supplier_import (
  name text primary key,
  category text not null,
  moq text not null,
  sample_time text not null,
  contact text not null,
  notes text not null,
  website text,
  sort_order integer not null
) on commit drop;

insert into factory_supplier_import
  (name, category, moq, sample_time, contact, notes, website, sort_order)
values
  ('PurPick', 'Writing Instruments/ Pens', '5000', 'Easy Designs 10 Days; Challenging Designs 15 Days', 'Wechat: zzy0930zzy', 'Pen manufacturer specializing in customizable writing instruments and pen components. Offers OEM/ODM production, including custom pen designs, colors, barrels, refills, and other components. Suitable for branded merchandise, promotional products, and custom stationery production.', null, 1),
  ('OEM 美肌化妆品工厂 (MG Cosmetics Factory)', 'Beauty & Personal/ Skin Care', 'Skin Care (50kg) Makeup Depends', '3 - 7 Days', 'Wechat: WDanny427 RedBook:', '', null, 2),
  ('安琪', 'Women''s Footwear & Shoes (Winter Boots and Birkenstock styles)', '50', '3 Days - 1 Week', 'Wechat: y739469387 Redbook: 63083161645', 'Women''s footwear manufacturer producing shearling boots (similar to UGGs), clogs, slippers, and casual shoes (Birkenstocks) in various materials, colors, and styles.', null, 3),
  ('江苏菲诗曼酒店用品有限公司 (Mianyang Yilainiya Hotel Supplies Co., Ltd.)', 'Hospitality & Hotel Supplies & Linens & Guestroom Supplies', '5000', '25-30 Days with Logo (Without logo 3 days)', 'Wechat: wxid_ld0ez6m01qnu22 (Account name is Ding Ye 鼎业）RedBook: 27769631531 (Account name is ELENYA)', 'Hotel supplier offering customizable toiletries, linens, towels, bathrobes, slippers, and other guestroom amenities for hotels and hospitality businesses.', null, 4),
  ('Ens Toys (Huizhou) Co., Ltd', 'Vinyl figures, plush toys, rubber ducks', '500-2,000 pcs (varies by item)', 'Depends on style', 'ensfactory.en.alibaba.com', '', 'https://ensfactory.en.alibaba.com', 5),
  ('Sobling Jewelry', 'Custom silver/fashion jewelry', '10', 'Depends on style', 'sobling.jewelry', 'Explicitly markets to small brands/new businesses; no CAD required, they support with sketches', 'https://sobling.jewelry', 6),
  ('Daily Accessory Limited', 'Sterling silver, brass, stainless steel jewelry', '30-50', 'Depends on style', 'info@daily-accessory.com;', '', null, 7),
  ('Biorun Sock', 'Custom/OEM socks', 'Low', 'Depends on style', 'socks@biorun.cc; Phone: +86-4008-068-021', '19 yrs experience, has a dedicated production base (Ankang), still smaller-order friendly per FAQ', null, 8),
  ('Lion Paper Products', 'Custom notebooks, journals, stationery', 'Depends on style', '', 'WhatsApp: +86 137 5075 6354', 'Positioned as an accessible OEM partner for smaller stationery orders', null, 9),
  ('Casmb) 中科医疗美容仪器有限公司', 'Beauty & Medical Equipment', '1', '3 Days', 'Wechat: gzzkym01 RedBook: 49316443807', 'Manufacturer of professional aesthetic and med-spa equipment, including facial, skincare, body contouring, and other beauty devices. Supports OEM/ODM customization.', null, 10),
  ('泽一鞋业', 'Footwear & Shoes', '300', '7 - 14 Days', 'Wechat: Jack-L668', 'Full-service footwear manufacturer specializing in fashion and leather shoes for men and women. Produces sneakers, loafers, dress shoes, casual shoes, boots, and trend-driven footwear. Offers OEM/ODM services including product development, sampling, manufacturing, and packaging for private-label and established brands including Circle Cage (环洞), Jolly Onn, First Floor, Wanna Lab, 鹿三先生 (LUSAN), OAKMOO, 经典的ABB (The Engineer), Set for Life, Mr. Dandy, Roolrren Homme, Whistlehunter × Oto3, Interris, and Triple Black (3BLK).', null, 11),
  ('Ruoran', 'Jewelry', '1', '12-15 Days', 'Wechat: RR15302752353', '', null, 12),
  ('北地兰家具 / AVAN', 'Furniture & High End Home Furnishings', 'Depends on style', 'Depends on style', 'WeChat: BDL13049120904', 'High-end furniture supplier specializing in Italian minimalist and light-luxury whole-home furniture and coordinated residential furnishing solutions. Typical Products: Sofas, dining tables & chairs, beds, cabinets, coffee tables, side tables, and other whole-home furniture.', null, 13),
  ('Caifede Candles (Qingdao, China)', 'Scented candles', '500', 'Depends on style', 'Phone/WhatsApp: (+86 135 0648 3595) Email: info@caifedecandles.com', '20 years in business, works with fragrance houses like IFF and Symrise & Scented candles, soy candles, reed diffusers, candle holders, tealights', null, 14),
  ('Guangzhou Bearky Bag Co., Ltd.', 'Cosmetic bags, backpacks, tote bags, travel bags', '500', 'Depends on style', 'Phone/WhatsApp: (+86 139 2879 1997) Skype: sallypeng123', '', null, 15),
  ('Sibottle (Arrant Enterprises Ltd.)', 'Stainless steel water bottles, tumblers, mugs', '1,000 pcs', '5-10 days', 'sales@sibottle.com', '14 yrs OEM/ODM drinkware, SEDEX/BSCI/ISO9001 certified, FDA & LFGB tested', null, 16),
  ('Kangde Silicone', 'Silicone kitchenware, baby products, pet supplies', 'Low MOQ (confirm per item)', 'Depends on style', 'sales@kangdesilicone.com', '', null, 17),
  ('Winnerpak', 'Jewelry boxes, gift boxes, packaging displays', '500 pcs (boxes), 100 pcs (displays)', 'Depends on style', 'winnerpak@winnerpak.com WeChat: +86 189 2273 8146', '34 yrs in jewelry/gift packaging, clients include Chow Tai Fook, Agatha, Thomas Sabo', null, 18),
  ('Heappy Eyewear', 'Sunglasses, optical frames, blue light glasses', '600 pcs (custom logo); 12-20 pcs (stock)', '7 days (samples); 45-90 days (bulk, by material)', 'heappy.com/contact-us', '20+ yrs, CE/FDA/BSCI compliant, 300+ workers', 'https://heappy.com/contact-us', 19),
  ('Hucai Sportswear', 'Gym clothing, tracksuits, activewear', 'Low MOQ (confirm per style)', 'Depends on style', 'Email: admin@hcsportswear.com; WhatsApp: +86 136 0233 8395', '25 yrs sportswear OEM/ODM, Dongguan-based', null, 20),
  ('Plushtoysmfg', 'Custom plush toys, pet plush toys', '500 pcs', 'Depends on style', 'info@plushtoysmfg.com; WhatsApp/Phone: +86 157 0768 2483', '10 yrs experience, Dongguan, mainly serves US/EU importers', null, 21),
  ('Hishell (Shenzhen Gobay Electronics)', 'Phone cases, cellphone stands, AirPods/AirTags cases', 'Low MOQ (confirm per style)', 'Depends on style', 'hedy@hishell.com; Phone: +86-755-8366-5688; WhatsApp: +86 135 1099 8166', '18 yrs phone accessory manufacturer, Shenzhen', null, 22),
  ('Galink Ltd', 'Custom towels (bath, hand, golf, beach), blankets', '50', '3-5 days No Logo', 'info@galinkltd.com; Phone: +86 181 2008 1396', '14+ yrs OEM/ODM, GRS & Sedex certified, Suzhou', null, 23),
  ('Speck Yoga Fitness Group', 'Yoga mats, yoga blocks/towels, fitness equipment', 'Low', 'Depends on style', 'phone: +86 21 5920 5922', '25+ yrs, 50-person design team, Shanghai, works with Walmart/IKEA/Target-scale clients', null, 24),
  ('Weijun Toy Co., Ltd.', 'Action figures, vinyl toys, plush, blind boxes', '500 pcs (plush); 3,000 (OEM plastic)', 'Depends on style', 'Phone: (86) 28-2639 8888; Email: info@weijuntoy.com; WhatsApp/WeChat: +86 150 2159', '45 injection molding machines listed, CE/ISO/EN71|', null, 25),
  ('飞鸾鞋业', 'Summer Shoes', '100-300', '7-10 Days', 'Wechat: tts_sang', '时装高跟鞋 单鞋 凉鞋 高跟凉拖', null, 26);

-- Update matching names first so this migration is safe if a factory was already added manually.
update public.factories as factory
set
  category = imported.category,
  location = '',
  moq = imported.moq,
  sample_time = imported.sample_time,
  contact = imported.contact,
  notes = imported.notes,
  website = imported.website,
  sort_order = imported.sort_order
from factory_supplier_import as imported
where lower(trim(factory.name)) = lower(trim(imported.name));

insert into public.factories
  (name, category, location, moq, sample_time, contact, notes, website, sort_order)
select
  imported.name,
  imported.category,
  '',
  imported.moq,
  imported.sample_time,
  imported.contact,
  imported.notes,
  imported.website,
  imported.sort_order
from factory_supplier_import as imported
where not exists (
  select 1
  from public.factories as factory
  where lower(trim(factory.name)) = lower(trim(imported.name))
);

-- The homepage shows only the total; individual supplier details remain protected by RLS.
create or replace function public.get_public_directory_counts()
returns table (
  family_businesses bigint,
  vetted_factories bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.family_businesses),
    (select count(*) from public.factories);
$$;

revoke all on function public.get_public_directory_counts() from public;
grant execute on function public.get_public_directory_counts() to anon, authenticated;
