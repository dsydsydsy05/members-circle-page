-- Remove the original partner fixtures. Real partners remain managed through the partners table.
delete from public.partners
where
  (
    url = 'https://example.com'
    and name in (
      'NOVAWORKS',
      'ATLAS CAPITAL',
      'HELIOS LABS',
      'MERIDIAN',
      'FORMFACTOR',
      'KILN&CO',
      'PIXELGRAM',
      'NORTHBOUND',
      'OPENSTACK',
      'CIRCLE HOUSE'
    )
  )
  or (
    name = 'NYU CEC'
    and logo_url = '/partners/nyu-entrepreneurship.svg'
  );
