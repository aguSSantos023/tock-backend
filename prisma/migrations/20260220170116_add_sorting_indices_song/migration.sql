-- CreateIndex
CREATE INDEX `Song_user_id_order_par_idx` ON `Song`(`user_id`, `order_par`);

-- CreateIndex
CREATE INDEX `Song_user_id_order_impar_idx` ON `Song`(`user_id`, `order_impar`);
