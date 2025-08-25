DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
   
-- =========================
-- 1) TABLE: stations (Trạm xăng)
-- =========================
CREATE TABLE stations (
    station_id   BIGSERIAL PRIMARY KEY,
    code         VARCHAR(20) UNIQUE NOT NULL,
    name         TEXT NOT NULL,
    address      TEXT,
    status       VARCHAR(20) DEFAULT 'active',
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- 2) TABLE: products (Hàng hóa)
-- =========================
CREATE TABLE products (
    product_id   BIGSERIAL PRIMARY KEY,
    code         VARCHAR(20) UNIQUE NOT NULL,  -- e.g., A95, E5, DO
    name         TEXT NOT NULL,
    octane       INT,                          -- nullable (for gasoline only)
    unit         VARCHAR(5) NOT NULL DEFAULT 'L', -- liters
    active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================
-- 3) TABLE: pumps (Trụ bơm)
-- =========================
CREATE TABLE pumps (
    pump_id      BIGSERIAL PRIMARY KEY,
    station_id   BIGINT NOT NULL REFERENCES stations(station_id) ON DELETE CASCADE,
    code         VARCHAR(20) NOT NULL,         -- mã trụ trong trạm
    serial_no    TEXT,
    status       VARCHAR(20) DEFAULT 'active',
    UNIQUE (station_id, code)                  -- mã trụ duy nhất trong 1 trạm
);

-- =========================
-- 4) TABLE: pump_product (Lịch sử loại hàng cho trụ bơm)
-- =========================
CREATE TABLE pump_product (
    pump_product_id BIGSERIAL PRIMARY KEY,
    pump_id      BIGINT NOT NULL REFERENCES pumps(pump_id) ON DELETE CASCADE,
    product_id   BIGINT NOT NULL REFERENCES products(product_id),
    valid_from   TIMESTAMPTZ NOT NULL,
    valid_to     TIMESTAMPTZ,
    CHECK (valid_to IS NULL OR valid_to > valid_from)
);

CREATE INDEX idx_pump_product_range ON pump_product(pump_id, valid_from, valid_to);

-- =========================
-- 5) TABLE: transactions (Giao dịch)
-- =========================
CREATE TABLE transactions (
    tx_id           BIGSERIAL PRIMARY KEY,
    tx_time         TIMESTAMPTZ NOT NULL,
    station_id      BIGINT NOT NULL REFERENCES stations(station_id),
    pump_id         BIGINT NOT NULL REFERENCES pumps(pump_id),
    product_id      BIGINT NOT NULL REFERENCES products(product_id),
    quantity_liters NUMERIC(12,3) NOT NULL CHECK (quantity_liters > 0),
    unit_price      NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    amount          NUMERIC(14,2) GENERATED ALWAYS AS (quantity_liters * unit_price) STORED,
    payment_method  VARCHAR(20),
    invoice_no      VARCHAR(50),

    -- Quản lý khách hàng trong giao dịch
    customer_type   VARCHAR(20) DEFAULT 'guest', -- 'guest' hoặc 'registered'
    customer_id     BIGINT,                      -- NULL nếu khách lẻ
    customer_name   TEXT                          -- tên khách hàng hoặc 'Khách lẻ'
);

-- Indexes cho hiệu năng
CREATE INDEX idx_tx_station_time ON transactions(station_id, tx_time);
CREATE INDEX idx_tx_pump_time ON transactions(pump_id, tx_time);
CREATE INDEX idx_tx_station_prod_time ON transactions(station_id, product_id, tx_time);

-- =========================
-- SAMPLE DATA
-- =========================
INSERT INTO stations (code, name, address) VALUES 
('ST01', 'Trạm Xăng A', '123 Lê Lợi, HCM'),
('ST02', 'Trạm Xăng B', '456 Nguyễn Huệ, HCM');

INSERT INTO products (code, name, octane) VALUES
('A95', 'Xăng RON95', 95),
('E5', 'Xăng E5 RON92', 92),
('DO', 'Dầu DO', NULL);

INSERT INTO pumps (station_id, code) VALUES
(1, 'P01'), (1, 'P02'), (2, 'P01');

INSERT INTO pump_product (pump_id, product_id, valid_from) VALUES
(1, 1, '2025-01-01'),  -- Pump 1: A95
(2, 3, '2025-01-01');  -- Pump 2: DO

-- Transactions với khách lẻ
INSERT INTO transactions (
    tx_time, station_id, pump_id, product_id, quantity_liters, unit_price, payment_method, invoice_no,
    customer_type, customer_name
)
VALUES
('2025-08-05 08:00:00', 1, 1, 1, 15.0, 23000, 'cash', 'INV004', 'guest', 'Khách lẻ');

-- Transactions với khách quan trọng
INSERT INTO transactions (
    tx_time, station_id, pump_id, product_id, quantity_liters, unit_price, payment_method, invoice_no,
    customer_type, customer_id, customer_name
)
VALUES
('2025-08-06 09:30:00', 1, 2, 3, 50.0, 20000, 'card', 'INV005', 'registered', 101, 'Công ty ABC');

-- query 1: lấy tất cả giao dịch của trạm trong 1 ngày
SELECT *
FROM transactions
WHERE station_id = 1
  AND tx_time BETWEEN '2025-08-06' AND '2025-08-07'
ORDER BY tx_time;


-- query 2: tổng doanh thu theo ngày cho 1 trụ bơm
SELECT DATE(tx_time) AS day, SUM(amount) AS revenue
FROM transactions
WHERE pump_id = 1
GROUP BY DATE(tx_time)
ORDER BY day;

-- query 3: tổng doanh thu theo ngày cho 1 trạm
SELECT DATE(tx_time) AS day, SUM(amount) AS revenue
FROM transactions
WHERE station_id = 1
GROUP BY DATE(tx_time)
ORDER BY day;

-- query 4: lấy top 3 hàng hóa bán chạy nhất và tổng số lít tại trạm trong 1 tháng
WITH month_data AS (
    SELECT *
    FROM transactions
    WHERE station_id = 1
      AND tx_time >= date_trunc('month', '2025-08-01'::date)
      AND tx_time <  date_trunc('month', '2025-08-01'::date) + INTERVAL '1 month'
)
SELECT p.name, SUM(quantity_liters) AS total_liters
FROM month_data md
JOIN products p ON p.product_id = md.product_id
GROUP BY p.name
ORDER BY total_liters DESC
LIMIT 3;

