-- 초기 데이터 삽입

-- 기존 데이터 삭제 (재실행 시 중복 방지)
DELETE FROM order_item_options;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM options;
DELETE FROM menus;

-- 메뉴 데이터
INSERT INTO menus (name, description, price, image, stock) VALUES
('아메리카노(ICE)', '에스프레소에 물을 넣어 만든 시원한 커피', 4000, '/images/americano-ice.jpg', 10),
('아메리카노(HOT)', '에스프레소에 물을 넣어 만든 따뜻한 커피', 4000, '/images/americano-hot.jpg', 10),
('카페라떼', '에스프레소와 스팀 밀크의 조화', 5000, '/images/caffe-latte.jpg', 10);

-- 옵션 데이터 (메뉴 ID는 자동 생성되므로 서브쿼리 사용)
INSERT INTO options (name, price, menu_id) VALUES
('샷 추가', 500, (SELECT id FROM menus WHERE name = '아메리카노(ICE)')),
('시럽 추가', 0, (SELECT id FROM menus WHERE name = '아메리카노(ICE)')),
('샷 추가', 500, (SELECT id FROM menus WHERE name = '아메리카노(HOT)')),
('시럽 추가', 0, (SELECT id FROM menus WHERE name = '아메리카노(HOT)')),
('샷 추가', 500, (SELECT id FROM menus WHERE name = '카페라떼')),
('시럽 추가', 0, (SELECT id FROM menus WHERE name = '카페라떼'));

