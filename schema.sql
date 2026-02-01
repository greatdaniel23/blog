DROP TABLE IF EXISTS bookings;
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL
);
INSERT INTO bookings (guest_name, room_type, check_in, check_out) VALUES ('John Doe', 'Deluxe', '2023-10-01', '2023-10-05');
