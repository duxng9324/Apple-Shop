-- Backfill cart_item from legacy cart.product_id rows.
-- Safe to run multiple times due to LEFT JOIN filter.

INSERT INTO cart_item (creat_by, creat_date, modify_by, modifi_date, quantity, cart_id, product_id)
SELECT c.creat_by,
       c.creat_date,
       c.modify_by,
       c.modifi_date,
       COALESCE(c.quantity, 1),
       c.id,
       c.product_id
FROM cart c
LEFT JOIN cart_item ci
  ON ci.cart_id = c.id AND ci.product_id = c.product_id
WHERE c.product_id IS NOT NULL
  AND ci.id IS NULL;
