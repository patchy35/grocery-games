import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { items, postal_code = '21220' } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Please provide an array of grocery items' }, { status: 400 });
    }

    // Step 1: Fetch flyer list to build flyer_id -> merchant map
    const flyersResp = await fetch(
      `https://backflipp.wishabi.com/flipp/flyers?locale=en-us&postal_code=${postal_code}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const flyersData = await flyersResp.json();
    const flyerMap: Record<number, { merchant: string; valid_from: string; valid_to: string }> = {};
    for (const f of (flyersData.flyers || [])) {
      flyerMap[f.id] = {
        merchant: (f.merchant || '').trim(),
        valid_from: f.valid_from,
        valid_to: f.valid_to,
      };
    }

    // Step 2: For each item, search Flipp and collect deals
    const results: Record<string, any[]> = {};

    for (const item of items) {
      const encoded = encodeURIComponent(item);
      const searchResp = await fetch(
        `https://backflipp.wishabi.com/flipp/items/search?locale=en-us&postal_code=${postal_code}&q=${encoded}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      const searchData = await searchResp.json();
      const flyerItems = (searchData.items || []).filter((i: any) => i.current_price != null && i.name);

      const deals: any[] = [];

      for (const fi of flyerItems) {
        const flyerInfo = flyerMap[fi.flyer_id] || {};
        deals.push({
          item_name: fi.name,
          price: fi.current_price,
          original_price: fi.original_price || null,
          sale_story: fi.sale_story || null,
          store: flyerInfo.merchant || 'Unknown Store',
          valid_from: flyerInfo.valid_from || fi.valid_from,
          valid_to: flyerInfo.valid_to || fi.valid_to,
          image_url: fi.clean_image_url || fi.clipping_image_url || null,
          category: fi._L1 || null,
        });
      }

      // Also include ecom_items (online deals like CVS, etc.)
      const ecomItems = (searchData.ecom_items || []).filter((i: any) => i.current_price != null && i.name);
      for (const ei of ecomItems.slice(0, 5)) {
        deals.push({
          item_name: ei.name,
          price: ei.current_price,
          original_price: ei.original_price || null,
          sale_story: null,
          store: (ei.merchant || 'Online').trim(),
          valid_from: null,
          valid_to: null,
          image_url: ei.image_url || null,
          category: 'Online',
          is_online: true,
        });
      }

      // Sort by price ascending
      deals.sort((a, b) => (a.price || 999) - (b.price || 999));

      results[item] = deals.slice(0, 20); // top 20 per item
    }

    return Response.json({ results, postal_code });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
