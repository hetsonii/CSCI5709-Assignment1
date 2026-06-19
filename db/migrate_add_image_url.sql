-- docker exec -i tenanttrails-mysql mysql -u root -proot1234 tenanttrails < migrate_add_image_url.sql

USE tenanttrails;

ALTER TABLE reviews
  ADD COLUMN image_url VARCHAR(500) DEFAULT NULL
  AFTER body;