USE tenanttrails;


CREATE TABLE users (
  user_id    INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
);

CREATE TABLE apartments (
  apartment_id  INT          NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  name          VARCHAR(150) NOT NULL,
  address       VARCHAR(200) NOT NULL,
  neighbourhood VARCHAR(100) NOT NULL,
  landlord      VARCHAR(150),
  units         INT,
  year_built    YEAR,
  description   TEXT,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (apartment_id)
);

CREATE TABLE reviews (
  review_id    INT       NOT NULL AUTO_INCREMENT,
  apartment_id INT       NOT NULL,
  user_id      INT       NOT NULL,
  rating       TINYINT   NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         TEXT      NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  FOREIGN KEY (apartment_id) REFERENCES apartments(apartment_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)      REFERENCES users(user_id)           ON DELETE CASCADE
);

CREATE TABLE comments (
  comment_id INT       NOT NULL AUTO_INCREMENT,
  review_id  INT       NOT NULL,
  user_id    INT       NOT NULL,
  body       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(user_id)     ON DELETE CASCADE
);


INSERT INTO users (name, email, password) VALUES
  ('Alex Mitchell', 'alex@dal.ca',  '$2b$10$hashedpassword1'),
  ('James Chen',    'james@dal.ca', '$2b$10$hashedpassword2'),
  ('Priya Sharma',  'priya@dal.ca', '$2b$10$hashedpassword3'),
  ('Omar Hassan',   'omar@dal.ca',  '$2b$10$hashedpassword4'),
  ('Sofia Reyes',   'sofia@dal.ca', '$2b$10$hashedpassword5');


INSERT INTO apartments (slug, name, address, neighbourhood, landlord, units, year_built, description) VALUES
  ('the-marlstone',         'The Marlstone',         '5540 Spring Garden Rd', 'Spring Garden', 'Westwood Realty',    24,  2018, 'Modern boutique building steps from the Public Gardens.'),
  ('park-victoria',         'Park Victoria',         '1496 Carlton St',       'South End',     'Oxford Properties',  36,  2005, 'Well-maintained mid-rise in a quiet residential street.'),
  ('le-marchant-towers',    'Le Marchant Towers',    '1585 Le Marchant St',   'West End',      'Killam Properties',  88,  1975, 'High-rise tower in a quiet residential neighbourhood.'),
  ('fenwick-tower',         'Fenwick Tower',         '5599 Fenwick St',       'Downtown',      'Fenwick Management', 120, 1969, 'Iconic Halifax high-rise with panoramic harbour views.'),
  ('southpoint-apartments', 'Southpoint Apartments', '1050 South Park St',    'South End',     'Nova Rentals',       52,  1988, 'Affordable units close to universities and the waterfront.');


INSERT INTO reviews (apartment_id, user_id, rating, body) VALUES
  (1, 3, 5, 'Incredible building. Brand new appliances, responsive super, secure entry. Best rental experience I have had in Halifax.'),
  (2, 1, 5, 'Spotless common areas and management actually answers emails. Rent is steep but you get what you pay for.'),
  (2, 4, 4, 'Very quiet building and the neighbourhood is safe. Parking included which is rare downtown. Maintenance is quick.'),
  (3, 2, 4, 'Good building overall. Management is professional and responsive within 48 hours. Parking waitlist is brutal — I waited five months.'),
  (3, 1, 4, 'Lived here for two years. Quiet neighbours and the Quinpool Road location is extremely convenient. Elevator breaks down monthly but gets fixed fast.'),
  (3, 5, 3, 'Decent location near the park but the building has issues. Heater broke in winter and took four days to fix.'),
  (4, 3, 4, 'The view from the 28th floor is incredible. You can see the harbour, Dartmouth, and McNabs Island.'),
  (4, 4, 4, 'Rent is very reasonable for downtown Halifax. Unit is functional, nothing fancy. Laundry on every floor.'),
  (4, 2, 2, 'Elevators are unreliable and lobby security is inconsistent. Good location but management needs improvement.'),
  (5, 1, 3, 'Average experience. Laundry room is always busy and half the machines are broken.'),
  (5, 5, 3, 'Decent location near the park but maintenance response time is slow.'),
  (5, 4, 2, 'Roaches in the basement storage. Reported it three times before anything was done. Would not renew.'),
  (5, 2, 2, 'Thin walls, loud neighbours, and heating was inconsistent all winter. Management ignored two maintenance requests.');


INSERT INTO comments (review_id, user_id, body) VALUES
  (4, 1, 'How long was the parking waitlist when you moved in?'),
  (4, 2, 'Still on the list after seven months. They said demand doubled post-pandemic.'),
  (6, 2, 'Same issue here — took them nearly a week to fix my heating in February.'),
  (9, 3, 'Did you escalate to the building manager or just the super?'),
  (9, 4, 'I had the same experience. Filed a complaint with Access Nova Scotia in the end.'),
  (12, 1, 'That is a health violation. You can report it to Halifax Regional Municipality.'),
  (13, 5, 'Agreed on the walls. I could hear my neighbours full conversations every night.');