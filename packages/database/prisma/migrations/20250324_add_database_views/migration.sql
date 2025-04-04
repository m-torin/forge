-- CreateView for ProductPricingView
CREATE VIEW product_pricing_view AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.slug AS product_slug,
    p.category_id,
    pc.name AS category_name,
    psb.seller_id,
    b.name AS seller_name,
    psb.relation_type,
    psb.price_high,
    psb.price_sale,
    psb.discount_percent,
    psb.is_available,
    psb.sku,
    pv.publisher_id,
    pb.name AS publisher_name
FROM 
    products p
JOIN 
    product_seller_brands psb ON p.id = psb.product_id
JOIN 
    brands b ON psb.seller_id = b.id
LEFT JOIN 
    product_categories pc ON p.category_id = pc.id
LEFT JOIN 
    product_variants pv ON pv.product_id = p.id
LEFT JOIN 
    brands pb ON pv.publisher_id = pb.id;

-- CreateView for StoryStatsView
CREATE VIEW story_stats_view AS
SELECT 
    s.id AS story_id,
    s.name AS story_name,
    s.slug AS story_slug,
    s.fandom_id,
    f.name AS fandom_name,
    COUNT(DISTINCT p.id) AS product_count,
    COUNT(DISTINCT psb.seller_id) AS seller_count,
    COUNT(DISTINCT pv.id) AS variant_count,
    COUNT(DISTINCT url.id) AS total_links,
    MIN(psb.price_sale) AS min_price,
    MAX(psb.price_sale) AS max_price,
    AVG(psb.price_sale) AS avg_price,
    s.updated_at
FROM 
    stories s
LEFT JOIN 
    fandoms f ON s.fandom_id = f.id
LEFT JOIN 
    products p ON p.id IN (
        SELECT product_id 
        FROM _ProductToStory 
        WHERE story_id = s.id
    )
LEFT JOIN 
    product_variants pv ON p.id = pv.product_id
LEFT JOIN 
    product_seller_brands psb ON p.id = psb.product_id
LEFT JOIN 
    url_registry url ON (
        url.entity_type = 'STORY' AND url.entity_id = s.id
    )
GROUP BY 
    s.id, s.name, s.slug, s.fandom_id, f.name, s.updated_at;
