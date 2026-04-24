-- Enforce relational integrity for existing schema
-- Root cause fixed: MyISAM tables do not support foreign keys

SET FOREIGN_KEY_CHECKS = 0;

-- 1) Convert all application tables to InnoDB so FK constraints are supported.
ALTER TABLE `cart` ENGINE=InnoDB;
ALTER TABLE `cart_item` ENGINE=InnoDB;
ALTER TABLE `category` ENGINE=InnoDB;
ALTER TABLE `chart_of_account` ENGINE=InnoDB;
ALTER TABLE `color` ENGINE=InnoDB;
ALTER TABLE `comment` ENGINE=InnoDB;
ALTER TABLE `expense_voucher` ENGINE=InnoDB;
ALTER TABLE `image` ENGINE=InnoDB;
ALTER TABLE `inventory` ENGINE=InnoDB;
ALTER TABLE `inventory_movement_ledger` ENGINE=InnoDB;
ALTER TABLE `journal_entry` ENGINE=InnoDB;
ALTER TABLE `journal_line` ENGINE=InnoDB;
ALTER TABLE `memory` ENGINE=InnoDB;
ALTER TABLE `migration_state` ENGINE=InnoDB;
ALTER TABLE `order_item` ENGINE=InnoDB;
ALTER TABLE `orders` ENGINE=InnoDB;
ALTER TABLE `payable` ENGINE=InnoDB;
ALTER TABLE `payment_transaction` ENGINE=InnoDB;
ALTER TABLE `product` ENGINE=InnoDB;
ALTER TABLE `product_color` ENGINE=InnoDB;
ALTER TABLE `product_image` ENGINE=InnoDB;
ALTER TABLE `product_memory` ENGINE=InnoDB;
ALTER TABLE `receivable` ENGINE=InnoDB;
ALTER TABLE `stock_issue` ENGINE=InnoDB;
ALTER TABLE `stock_issue_item` ENGINE=InnoDB;
ALTER TABLE `stock_receipt` ENGINE=InnoDB;
ALTER TABLE `stock_receipt_item` ENGINE=InnoDB;
ALTER TABLE `user` ENGINE=InnoDB;
ALTER TABLE `warehouse` ENGINE=InnoDB;

-- 2) Remove orphan rows that would block FK creation.
DELETE ci FROM `cart_item` ci LEFT JOIN `cart` c ON ci.cart_id = c.id WHERE c.id IS NULL;
DELETE ci FROM `cart_item` ci LEFT JOIN `product` p ON ci.product_id = p.id WHERE p.id IS NULL;

DELETE c FROM `cart` c LEFT JOIN `user` u ON c.user_id = u.id WHERE u.id IS NULL;
DELETE c FROM `cart` c LEFT JOIN `product` p ON c.product_id = p.id WHERE p.id IS NULL;

DELETE cm FROM `comment` cm LEFT JOIN `user` u ON cm.user_id = u.id WHERE u.id IS NULL;
DELETE cm FROM `comment` cm LEFT JOIN `product` p ON cm.product_id = p.id WHERE p.id IS NULL;

DELETE i FROM `image` i LEFT JOIN `user` u ON i.user_id = u.id WHERE u.id IS NULL;
DELETE o FROM `orders` o LEFT JOIN `user` u ON o.user_id = u.id WHERE u.id IS NULL;
DELETE oi FROM `order_item` oi LEFT JOIN `orders` o ON oi.order_id = o.id WHERE o.id IS NULL;

DELETE pi FROM `product_image` pi LEFT JOIN `product` p ON pi.product_id = p.id WHERE p.id IS NULL;
DELETE pm FROM `product_memory` pm LEFT JOIN `product` p ON pm.product_id = p.id WHERE p.id IS NULL;
DELETE pm FROM `product_memory` pm LEFT JOIN `memory` m ON pm.memory_id = m.id WHERE m.id IS NULL;

DELETE inv FROM `inventory` inv LEFT JOIN `warehouse` w ON inv.warehouse_id = w.id WHERE w.id IS NULL;
DELETE inv FROM `inventory` inv LEFT JOIN `product` p ON inv.product_id = p.id WHERE p.id IS NULL;
DELETE inv FROM `inventory` inv LEFT JOIN `color` c ON inv.color_id = c.id WHERE inv.color_id IS NOT NULL AND c.id IS NULL;

DELETE iml FROM `inventory_movement_ledger` iml LEFT JOIN `warehouse` w ON iml.warehouse_id = w.id WHERE w.id IS NULL;
DELETE iml FROM `inventory_movement_ledger` iml LEFT JOIN `product` p ON iml.product_id = p.id WHERE p.id IS NULL;
DELETE iml FROM `inventory_movement_ledger` iml LEFT JOIN `color` c ON iml.color_id = c.id WHERE iml.color_id IS NOT NULL AND c.id IS NULL;

DELETE sri FROM `stock_receipt_item` sri LEFT JOIN `stock_receipt` sr ON sri.stock_receipt_id = sr.id WHERE sr.id IS NULL;
DELETE sri FROM `stock_receipt_item` sri LEFT JOIN `product` p ON sri.product_id = p.id WHERE p.id IS NULL;
DELETE sri FROM `stock_receipt_item` sri LEFT JOIN `color` c ON sri.color_id = c.id WHERE sri.color_id IS NOT NULL AND c.id IS NULL;

DELETE sii FROM `stock_issue_item` sii LEFT JOIN `stock_issue` si ON sii.stock_issue_id = si.id WHERE si.id IS NULL;
DELETE sii FROM `stock_issue_item` sii LEFT JOIN `product` p ON sii.product_id = p.id WHERE p.id IS NULL;
DELETE sii FROM `stock_issue_item` sii LEFT JOIN `color` c ON sii.color_id = c.id WHERE sii.color_id IS NOT NULL AND c.id IS NULL;

DELETE sr FROM `stock_receipt` sr LEFT JOIN `warehouse` w ON sr.warehouse_id = w.id WHERE w.id IS NULL;
DELETE si FROM `stock_issue` si LEFT JOIN `warehouse` w ON si.warehouse_id = w.id WHERE w.id IS NULL;

DELETE r FROM `receivable` r LEFT JOIN `orders` o ON r.order_id = o.id WHERE o.id IS NULL;
DELETE r FROM `receivable` r LEFT JOIN `user` u ON r.user_id = u.id WHERE u.id IS NULL;
DELETE pt FROM `payment_transaction` pt LEFT JOIN `orders` o ON pt.order_id = o.id WHERE o.id IS NULL;
DELETE p FROM `payable` p LEFT JOIN `stock_receipt` sr ON p.stock_receipt_id = sr.id WHERE sr.id IS NULL;

DELETE ev FROM `expense_voucher` ev LEFT JOIN `warehouse` w ON ev.warehouse_id = w.id WHERE w.id IS NULL;
DELETE jl FROM `journal_line` jl LEFT JOIN `journal_entry` je ON jl.journal_entry_id = je.id WHERE je.id IS NULL;
DELETE jl FROM `journal_line` jl LEFT JOIN `chart_of_account` coa ON jl.account_id = coa.id WHERE coa.id IS NULL;

DELETE pc FROM `product_color` pc LEFT JOIN `product` p ON pc.product_id = p.id WHERE p.id IS NULL;
DELETE pc FROM `product_color` pc LEFT JOIN `color` c ON pc.color_id = c.id WHERE c.id IS NULL;

-- 3) Utility procedure to add FK only when missing.
DROP PROCEDURE IF EXISTS add_fk_if_missing;
DELIMITER $$
CREATE PROCEDURE add_fk_if_missing(
    IN p_table VARCHAR(64),
    IN p_fk_name VARCHAR(64),
    IN p_fk_sql TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
          AND CONSTRAINT_NAME = p_fk_name
          AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ) THEN
        SET @sql_stmt = p_fk_sql;
        PREPARE stmt FROM @sql_stmt;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- 4) Add missing FK constraints.
CALL add_fk_if_missing('cart', 'fk_cart_user',
    'ALTER TABLE `cart` ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('cart', 'fk_cart_product',
    'ALTER TABLE `cart` ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('cart_item', 'fk_cart_item_cart',
    'ALTER TABLE `cart_item` ADD CONSTRAINT `fk_cart_item_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('cart_item', 'fk_cart_item_product',
    'ALTER TABLE `cart_item` ADD CONSTRAINT `fk_cart_item_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('comment', 'fk_comment_user',
    'ALTER TABLE `comment` ADD CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('comment', 'fk_comment_product',
    'ALTER TABLE `comment` ADD CONSTRAINT `fk_comment_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');

CALL add_fk_if_missing('image', 'fk_image_user',
    'ALTER TABLE `image` ADD CONSTRAINT `fk_image_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('orders', 'fk_orders_user',
    'ALTER TABLE `orders` ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('order_item', 'fk_order_item_order',
    'ALTER TABLE `order_item` ADD CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');

CALL add_fk_if_missing('product', 'fk_product_category',
    'ALTER TABLE `product` ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('product_image', 'fk_product_image_product',
    'ALTER TABLE `product_image` ADD CONSTRAINT `fk_product_image_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('product_memory', 'fk_product_memory_product',
    'ALTER TABLE `product_memory` ADD CONSTRAINT `fk_product_memory_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('product_memory', 'fk_product_memory_memory',
    'ALTER TABLE `product_memory` ADD CONSTRAINT `fk_product_memory_memory` FOREIGN KEY (`memory_id`) REFERENCES `memory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('inventory', 'fk_inventory_warehouse',
    'ALTER TABLE `inventory` ADD CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('inventory', 'fk_inventory_product',
    'ALTER TABLE `inventory` ADD CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('inventory', 'fk_inventory_color',
    'ALTER TABLE `inventory` ADD CONSTRAINT `fk_inventory_color` FOREIGN KEY (`color_id`) REFERENCES `color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('inventory_movement_ledger', 'fk_iml_warehouse',
    'ALTER TABLE `inventory_movement_ledger` ADD CONSTRAINT `fk_iml_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('inventory_movement_ledger', 'fk_iml_product',
    'ALTER TABLE `inventory_movement_ledger` ADD CONSTRAINT `fk_iml_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('inventory_movement_ledger', 'fk_iml_color',
    'ALTER TABLE `inventory_movement_ledger` ADD CONSTRAINT `fk_iml_color` FOREIGN KEY (`color_id`) REFERENCES `color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('stock_receipt', 'fk_stock_receipt_warehouse',
    'ALTER TABLE `stock_receipt` ADD CONSTRAINT `fk_stock_receipt_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('stock_receipt_item', 'fk_stock_receipt_item_receipt',
    'ALTER TABLE `stock_receipt_item` ADD CONSTRAINT `fk_stock_receipt_item_receipt` FOREIGN KEY (`stock_receipt_id`) REFERENCES `stock_receipt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('stock_receipt_item', 'fk_stock_receipt_item_product',
    'ALTER TABLE `stock_receipt_item` ADD CONSTRAINT `fk_stock_receipt_item_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('stock_receipt_item', 'fk_stock_receipt_item_color',
    'ALTER TABLE `stock_receipt_item` ADD CONSTRAINT `fk_stock_receipt_item_color` FOREIGN KEY (`color_id`) REFERENCES `color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('stock_issue', 'fk_stock_issue_warehouse',
    'ALTER TABLE `stock_issue` ADD CONSTRAINT `fk_stock_issue_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('stock_issue_item', 'fk_stock_issue_item_issue',
    'ALTER TABLE `stock_issue_item` ADD CONSTRAINT `fk_stock_issue_item_issue` FOREIGN KEY (`stock_issue_id`) REFERENCES `stock_issue`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('stock_issue_item', 'fk_stock_issue_item_product',
    'ALTER TABLE `stock_issue_item` ADD CONSTRAINT `fk_stock_issue_item_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('stock_issue_item', 'fk_stock_issue_item_color',
    'ALTER TABLE `stock_issue_item` ADD CONSTRAINT `fk_stock_issue_item_color` FOREIGN KEY (`color_id`) REFERENCES `color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('receivable', 'fk_receivable_order',
    'ALTER TABLE `receivable` ADD CONSTRAINT `fk_receivable_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('receivable', 'fk_receivable_user',
    'ALTER TABLE `receivable` ADD CONSTRAINT `fk_receivable_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('payment_transaction', 'fk_payment_transaction_order',
    'ALTER TABLE `payment_transaction` ADD CONSTRAINT `fk_payment_transaction_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');
CALL add_fk_if_missing('payable', 'fk_payable_stock_receipt',
    'ALTER TABLE `payable` ADD CONSTRAINT `fk_payable_stock_receipt` FOREIGN KEY (`stock_receipt_id`) REFERENCES `stock_receipt`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('expense_voucher', 'fk_expense_voucher_warehouse',
    'ALTER TABLE `expense_voucher` ADD CONSTRAINT `fk_expense_voucher_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('journal_line', 'fk_journal_line_entry',
    'ALTER TABLE `journal_line` ADD CONSTRAINT `fk_journal_line_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('journal_line', 'fk_journal_line_account',
    'ALTER TABLE `journal_line` ADD CONSTRAINT `fk_journal_line_account` FOREIGN KEY (`account_id`) REFERENCES `chart_of_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE');

CALL add_fk_if_missing('product_color', 'fk_product_color_product',
    'ALTER TABLE `product_color` ADD CONSTRAINT `fk_product_color_product` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');
CALL add_fk_if_missing('product_color', 'fk_product_color_color',
    'ALTER TABLE `product_color` ADD CONSTRAINT `fk_product_color_color` FOREIGN KEY (`color_id`) REFERENCES `color`(`id`) ON DELETE CASCADE ON UPDATE CASCADE');

DROP PROCEDURE IF EXISTS add_fk_if_missing;

SET FOREIGN_KEY_CHECKS = 1;
