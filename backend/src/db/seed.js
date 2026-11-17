const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query, initSchema } = require('./db');

async function seed() {
  console.log('=== Starting StaySync Master Seeding Engine ===');
  await initSchema();

  // Clean existing tables in reverse dependency order
  const tables = [
    'audit_logs', 'pricing_rules', 'loyalty_transactions', 'loyalty_accounts',
    'reviews', 'restaurant_orders', 'maintenance_tickets', 'housekeeping_tasks',
    'service_requests', 'digital_keys', 'checkins', 'payments', 'room_locks',
    'bookings', 'room_amenities', 'amenities', 'rooms', 'room_types', 'hotels', 'users'
  ];

  for (const table of tables) {
    try {
      await query(`DELETE FROM ${table}`);
    } catch (e) {
      // ignore
    }
  }

  const passwordHash = await bcrypt.hash('StaySync@2026', 10);

  // 1. RBAC Users (All 6 Roles)
  const users = [
    { id: 'usr_guest_1', name: 'Alexander Wright', email: 'guest@staysync.com', role: 'GUEST', phone: '+91-98200-11223' },
    { id: 'usr_guest_2', name: 'Ananya Sharma', email: 'ananya@staysync.com', role: 'GUEST', phone: '+91-98200-11229' },
    { id: 'usr_reception_1', name: 'Elena Rostova', email: 'reception@staysync.com', role: 'RECEPTIONIST', phone: '+91-98200-11224' },
    { id: 'usr_manager_1', name: 'Marcus Sterling', email: 'manager@staysync.com', role: 'MANAGER', phone: '+91-98200-11225' },
    { id: 'usr_hk_1', name: 'Sarah Jenkins', email: 'housekeeping@staysync.com', role: 'HOUSEKEEPING', phone: '+91-98200-11226' },
    { id: 'usr_maint_1', name: 'David Miller', email: 'maintenance@staysync.com', role: 'MAINTENANCE', phone: '+91-98200-11227' },
    { id: 'usr_service_1', name: 'Chef Carlos Rossi', email: 'service@staysync.com', role: 'RESTAURANT', phone: '+91-98200-11228' }
  ];

  for (const u of users) {
    await query(
      `INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, passwordHash, u.role, u.phone]
    );
  }
  console.log(`[Seed] 6 RBAC demo accounts created (Password: StaySync@2026)`);

  // 2. Hotels (3 Luxury Flagship Properties)
  const hotels = [
    {
      id: 'htl_mumbai_1',
      name: 'StaySync Grand Resort & Spa',
      description: 'A 5-star flagship oceanfront sanctuary on Marine Drive offering panoramic Arabian Sea vistas, bespoke butler services, Michelin-inspired dining, and holistic Ayurvedic wellness.',
      address: '777 Marine Drive, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      phone: '+91-22-6789-9000',
      rating: 4.95,
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'htl_udaipur_2',
      name: 'StaySync Royal Heritage Palace',
      description: 'Set upon the shimmering waters of Lake Pichola, this majestic Rajputana heritage palace features gilded archways, private jharokhas, courtyards, and royal royal dining.',
      address: 'Lake Palace Island, Lake Pichola',
      city: 'Udaipur',
      state: 'Rajasthan',
      country: 'India',
      phone: '+91-294-245-8000',
      rating: 4.98,
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'htl_goa_3',
      name: 'StaySync Azure Sands Villa & Spa',
      description: 'An exclusive cliffside tropical haven perched above Vagator Beach with private plunge pool villas, coastal yoga pavilions, ocean sunset lounges, and beachside cabanas.',
      address: 'Cliffside Promenade, Vagator Beach',
      city: 'North Goa',
      state: 'Goa',
      country: 'India',
      phone: '+91-832-671-5500',
      rating: 4.91,
      image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  for (const h of hotels) {
    await query(
      `INSERT INTO hotels (id, name, description, address, city, state, country, phone, rating, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [h.id, h.name, h.description, h.address, h.city, h.state, h.country, h.phone, h.rating, h.image_url]
    );
  }
  console.log(`[Seed] 3 Flagship Indian luxury hotels created`);

  // 3. Room Types (Categories & Base Rates in INR)
  const roomTypes = [
    // Mumbai
    {
      id: 'rt_mum_deluxe',
      hotel_id: 'htl_mumbai_1',
      name: 'Deluxe Oceanfront Suite',
      description: 'Floor-to-ceiling glass windows framing the Arabian Sea, private marble balcony, freestanding soaking tub, and ambient touch controls.',
      base_price_per_night: 14500.00,
      max_occupancy: 2,
      bed_type: 'King Bed',
      room_size_sqm: 52,
      image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rt_mum_executive',
      hotel_id: 'htl_mumbai_1',
      name: 'Executive Skyline Suite',
      description: 'High-floor panoramic suite with executive lounge privileges, private espresso bar, executive desk, and walk-in rain shower.',
      base_price_per_night: 18500.00,
      max_occupancy: 3,
      bed_type: 'King Bed + Sofa',
      room_size_sqm: 65,
      image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rt_mum_penthouse',
      hotel_id: 'htl_mumbai_1',
      name: 'Presidential Sea Penthouse',
      description: 'The pinnacle of luxury with private rooftop terrace, heated infinity dip pool, 24/7 dedicated butler, dining salon, and Finnish sauna.',
      base_price_per_night: 42000.00,
      max_occupancy: 4,
      bed_type: 'Super King Bed',
      room_size_sqm: 145,
      image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rt_mum_garden',
      hotel_id: 'htl_mumbai_1',
      name: 'Courtyard Garden Studio',
      description: 'Tranquil ground-floor haven surrounded by tropical palms and lotus ponds, dual queen beds, and outdoor rain terrace.',
      base_price_per_night: 11000.00,
      max_occupancy: 4,
      bed_type: '2 Queen Beds',
      room_size_sqm: 58,
      image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
    },
    // Udaipur
    {
      id: 'rt_udr_royal',
      hotel_id: 'htl_udaipur_2',
      name: 'Royal Rajputana Lake Suite',
      description: 'Carved sandstone jharokhas opening directly onto Lake Pichola, hand-woven silks, antique brass accents, and royal bath rituals.',
      base_price_per_night: 24500.00,
      max_occupancy: 2,
      bed_type: 'Grand King Bed',
      room_size_sqm: 75,
      image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rt_udr_palace',
      hotel_id: 'htl_udaipur_2',
      name: 'Maharaja Heritage Chamber',
      description: 'Lavish traditional frescoes, crystal chandeliers, antique four-poster teak bed, and sweeping views of the Aravalli hills.',
      base_price_per_night: 32000.00,
      max_occupancy: 3,
      bed_type: 'Teak Poster King Bed',
      room_size_sqm: 90,
      image_url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'
    },
    // Goa
    {
      id: 'rt_goa_villa',
      hotel_id: 'htl_goa_3',
      name: 'Azure Beachfront Plunge Villa',
      description: 'Private gated garden villa with its own saltwater plunge pool, outdoor sun deck, open-air stone shower, and direct beach trail.',
      base_price_per_night: 28000.00,
      max_occupancy: 3,
      bed_type: 'Californian King Bed',
      room_size_sqm: 110,
      image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rt_goa_sunset',
      hotel_id: 'htl_goa_3',
      name: 'Vagator Sunset Haven',
      description: 'Upper-deck luxury room designed for coastal relaxation with panoramic Arabian sea sunsets, hammock terrace, and organic minibar.',
      base_price_per_night: 13500.00,
      max_occupancy: 2,
      bed_type: 'King Bed',
      room_size_sqm: 48,
      image_url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    }
  ];

  for (const rt of roomTypes) {
    await query(
      `INSERT INTO room_types (id, hotel_id, name, description, base_price_per_night, max_occupancy, bed_type, room_size_sqm, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rt.id, rt.hotel_id, rt.name, rt.description, rt.base_price_per_night, rt.max_occupancy, rt.bed_type, rt.room_size_sqm, rt.image_url]
    );
  }
  console.log(`[Seed] 8 Luxury Room Types seeded with INR pricing`);

  // 4. Physical Rooms (20 rooms across Mumbai, Udaipur, Goa)
  const rooms = [
    // Mumbai Rooms
    { id: 'rm_101', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_garden', room_number: '101', floor: 1, status: 'AVAILABLE' },
    { id: 'rm_102', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_garden', room_number: '102', floor: 1, status: 'AVAILABLE' },
    { id: 'rm_201', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_deluxe', room_number: '201', floor: 2, status: 'DIRTY' },
    { id: 'rm_202', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_deluxe', room_number: '202', floor: 2, status: 'AVAILABLE' },
    { id: 'rm_301', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_executive', room_number: '301', floor: 3, status: 'AVAILABLE' },
    { id: 'rm_304', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_deluxe', room_number: '304', floor: 3, status: 'OCCUPIED' },
    { id: 'rm_401', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_executive', room_number: '401', floor: 4, status: 'AVAILABLE' },
    { id: 'rm_402', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_executive', room_number: '402', floor: 4, status: 'MAINTENANCE' },
    { id: 'rm_501', hotel_id: 'htl_mumbai_1', room_type_id: 'rt_mum_penthouse', room_number: '501', floor: 5, status: 'AVAILABLE' },
    
    // Udaipur Rooms
    { id: 'rm_udr_101', hotel_id: 'htl_udaipur_2', room_type_id: 'rt_udr_royal', room_number: 'U-101', floor: 1, status: 'AVAILABLE' },
    { id: 'rm_udr_102', hotel_id: 'htl_udaipur_2', room_type_id: 'rt_udr_royal', room_number: 'U-102', floor: 1, status: 'OCCUPIED' },
    { id: 'rm_udr_201', hotel_id: 'htl_udaipur_2', room_type_id: 'rt_udr_palace', room_number: 'U-201', floor: 2, status: 'AVAILABLE' },
    { id: 'rm_udr_202', hotel_id: 'htl_udaipur_2', room_type_id: 'rt_udr_palace', room_number: 'U-202', floor: 2, status: 'AVAILABLE' },

    // Goa Rooms
    { id: 'rm_goa_01', hotel_id: 'htl_goa_3', room_type_id: 'rt_goa_villa', room_number: 'V-01', floor: 1, status: 'AVAILABLE' },
    { id: 'rm_goa_02', hotel_id: 'htl_goa_3', room_type_id: 'rt_goa_villa', room_number: 'V-02', floor: 1, status: 'AVAILABLE' },
    { id: 'rm_goa_101', hotel_id: 'htl_goa_3', room_type_id: 'rt_goa_sunset', room_number: 'G-101', floor: 1, status: 'AVAILABLE' },
    { id: 'rm_goa_102', hotel_id: 'htl_goa_3', room_type_id: 'rt_goa_sunset', room_number: 'G-102', floor: 1, status: 'DIRTY' }
  ];

  for (const r of rooms) {
    await query(
      `INSERT INTO rooms (id, hotel_id, room_type_id, room_number, floor, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [r.id, r.hotel_id, r.room_type_id, r.room_number, r.floor, r.status]
    );
  }
  console.log(`[Seed] ${rooms.length} Physical rooms created across floors and hotels`);

  // 5. Amenities
  const amenitiesList = [
    { id: 'am_wifi', name: 'High-Speed Fiber Wi-Fi', category: 'CONNECTIVITY', icon: 'wifi', description: 'Gigabit fiber optic connectivity throughout suites and gardens' },
    { id: 'am_pool', name: 'Infinity Plunge Pool', category: 'WELLNESS', icon: 'waves', description: 'Private temperature-controlled saltwater plunge pool' },
    { id: 'am_butler', name: '24/7 Dedicated Butler', category: 'SERVICE', icon: 'user-check', description: 'Personalized packing, unpacking, and priority concierge' },
    { id: 'am_espresso', name: 'Nespresso Bar & Organic Teas', category: 'DINING', icon: 'coffee', description: 'Complimentary artisan roast capsules and herbal infusions' },
    { id: 'am_bath', name: 'Marble Jacuzzi & Rain Shower', category: 'BATH', icon: 'bath', description: 'Italian Carrara marble bath with Molton Brown botanical amenities' },
    { id: 'am_balcony', name: 'Private Sea View Balcony', category: 'OUTDOOR', icon: 'sun', description: 'Panoramic outdoor deck with teak sun loungers' },
    { id: 'am_gym', name: 'Fitness & Ayurvedic Spa Access', category: 'WELLNESS', icon: 'activity', description: 'Unlimited access to the wellness pavilion and thermal sauna' }
  ];

  for (const am of amenitiesList) {
    await query(
      `INSERT INTO amenities (id, name, category, icon, description) VALUES (?, ?, ?, ?, ?)`,
      [am.id, am.name, am.category, am.icon, am.description]
    );
  }

  // Link amenities to room types
  const junctions = [
    ['rt_mum_deluxe', 'am_wifi'], ['rt_mum_deluxe', 'am_balcony'], ['rt_mum_deluxe', 'am_bath'], ['rt_mum_deluxe', 'am_espresso'],
    ['rt_mum_executive', 'am_wifi'], ['rt_mum_executive', 'am_espresso'], ['rt_mum_executive', 'am_bath'], ['rt_mum_executive', 'am_gym'],
    ['rt_mum_penthouse', 'am_wifi'], ['rt_mum_penthouse', 'am_pool'], ['rt_mum_penthouse', 'am_butler'], ['rt_mum_penthouse', 'am_bath'], ['rt_mum_penthouse', 'am_espresso'],
    ['rt_udr_royal', 'am_wifi'], ['rt_udr_royal', 'am_butler'], ['rt_udr_royal', 'am_balcony'], ['rt_udr_royal', 'am_bath'],
    ['rt_goa_villa', 'am_wifi'], ['rt_goa_villa', 'am_pool'], ['rt_goa_villa', 'am_balcony'], ['rt_goa_villa', 'am_gym']
  ];

  for (const [rtId, amId] of junctions) {
    await query(`INSERT INTO room_amenities (room_type_id, amenity_id) VALUES (?, ?)`, [rtId, amId]);
  }
  console.log('[Seed] Amenities and category links populated');

  // 6. Active Bookings for Guest (Alexander Wright)
  const today = new Date();
  const checkInCurrent = new Date(today.getTime() - (1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  const checkOutCurrent = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

  const checkInFuture = new Date(today.getTime() + (10 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
  const checkOutFuture = new Date(today.getTime() + (14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

  // 6A. Current In-Stay Booking (Room 304, Deluxe Oceanfront)
  await query(
    `INSERT INTO bookings (id, booking_reference, user_id, room_id, check_in, check_out, total_guests, total_price, status, special_requests)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['bk_current_1', 'STAY-8821', 'usr_guest_1', 'rm_304', checkInCurrent, checkOutCurrent, 2, 51330.00, 'CONFIRMED', 'High floor quiet wing, vegan breakfast']
  );

  // Payment for current booking
  await query(
    `INSERT INTO payments (id, booking_reference, user_id, amount, payment_method, status, transaction_id, idempotency_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pay_curr_1', 'STAY-8821', 'usr_guest_1', 51330.00, 'CREDIT_CARD', 'SUCCESS', 'TXN_9827361', 'idem_seed_curr_1']
  );

  // Check-in record
  await query(
    `INSERT INTO checkins (id, booking_id, guest_id, document_type, document_number, arrival_time, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['chk_curr_1', 'bk_current_1', 'usr_guest_1', 'PASSPORT', 'Z9821455', '14:30 IST', 'VERIFIED']
  );

  // Digital Key
  await query(
    `INSERT INTO digital_keys (id, booking_id, room_id, key_token, qr_payload, is_active, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['dk_curr_1', 'bk_current_1', 'rm_304', 'KEY_NFC_772910', 'staysync://nfc-lock/304/STAY-8821', 1, checkOutCurrent + ' 12:00:00']
  );

  // 6B. Upcoming Stay (Room 501, Presidential Penthouse)
  await query(
    `INSERT INTO bookings (id, booking_reference, user_id, room_id, check_in, check_out, total_guests, total_price, status, special_requests)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['bk_future_1', 'STAY-9104', 'usr_guest_1', 'rm_501', checkInFuture, checkOutFuture, 2, 198240.00, 'CONFIRMED', 'Airport luxury sedan transfer, champagne setup']
  );

  await query(
    `INSERT INTO payments (id, booking_reference, user_id, amount, payment_method, status, transaction_id, idempotency_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['pay_fut_1', 'STAY-9104', 'usr_guest_1', 198240.00, 'UPI', 'SUCCESS', 'TXN_UPI_554812', 'idem_seed_fut_1']
  );

  // 6C. Past Completed Booking
  await query(
    `INSERT INTO bookings (id, booking_reference, user_id, room_id, check_in, check_out, total_guests, total_price, status, special_requests)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['bk_past_1', 'STAY-6512', 'usr_guest_1', 'rm_202', '2026-02-10', '2026-02-13', 2, 45600.00, 'COMPLETED', 'Anniversary celebration']
  );

  console.log('[Seed] Guest bookings (Current in-stay, Upcoming, and Past) configured');

  // 7. Active In-Stay Service Requests (for Room 304)
  const services = [
    {
      id: 'srv_1',
      booking_id: 'bk_current_1',
      room_number: '304',
      user_id: 'usr_guest_1',
      category: 'ROOM_SERVICE',
      description: 'Artisan Burrata Salad & Truffle Fettuccine with San Pellegrino Sparkling Water',
      status: 'IN_PROGRESS',
      cost: 2450.00,
      assigned_to: 'Chef Carlos Rossi'
    },
    {
      id: 'srv_2',
      booking_id: 'bk_current_1',
      room_number: '304',
      user_id: 'usr_guest_1',
      category: 'SPA',
      description: '60-Minute Couples Aromatherapy & Rejuvenation Session (17:00 Slot)',
      status: 'ASSIGNED',
      cost: 5800.00,
      assigned_to: 'Priya Mehta (Spa Therapist)'
    },
    {
      id: 'srv_3',
      booking_id: 'bk_current_1',
      room_number: '304',
      user_id: 'usr_guest_1',
      category: 'HOUSEKEEPING',
      description: 'Evening Turndown Service & Extra Organic Cotton Pillows',
      status: 'COMPLETED',
      cost: 0.00,
      assigned_to: 'Sarah Jenkins (Housekeeping Staff)'
    },
    {
      id: 'srv_4',
      booking_id: 'bk_current_1',
      room_number: '304',
      user_id: 'usr_guest_1',
      category: 'LAUNDRY',
      description: 'Express Dry Cleaning & Steam Pressing (2 Evening Shirts)',
      status: 'IN_PROGRESS',
      cost: 950.00,
      assigned_to: 'Staff Laundry Unit'
    }
  ];

  for (const s of services) {
    await query(
      `INSERT INTO service_requests (id, booking_id, room_number, user_id, category, description, status, cost, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.booking_id, s.room_number, s.user_id, s.category, s.description, s.status, s.cost, s.assigned_to]
    );
  }
  console.log('[Seed] Active in-stay services populated');

  // 8. Housekeeping Tasks
  const hkTasks = [
    { id: 'hk_1', room_id: 'rm_201', room_number: '201', task_type: 'CHECKOUT_CLEAN', priority: 'HIGH', status: 'PENDING', assigned_to: 'Sarah Jenkins', notes: 'Guest checked out 11:30 AM. Deep sanitation required.' },
    { id: 'hk_2', room_id: 'rm_goa_102', room_number: 'G-102', task_type: 'CHECKOUT_CLEAN', priority: 'HIGH', status: 'IN_PROGRESS', assigned_to: 'Sarah Jenkins', notes: 'Linen change and balcony glass cleaning.' },
    { id: 'hk_3', room_id: 'rm_101', room_number: '101', task_type: 'DAILY_TURNDOWN', priority: 'NORMAL', status: 'CLEAN', assigned_to: 'Sarah Jenkins', notes: 'Inspected and certified ready for arrival.' },
    { id: 'hk_4', room_id: 'rm_304', room_number: '304', task_type: 'DAILY_TURNDOWN', priority: 'NORMAL', status: 'IN_PROGRESS', assigned_to: 'Sarah Jenkins', notes: 'In-stay guest turndown service.' }
  ];

  for (const t of hkTasks) {
    await query(
      `INSERT INTO housekeeping_tasks (id, room_id, room_number, task_type, priority, status, assigned_to, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.room_id, t.room_number, t.task_type, t.priority, t.status, t.assigned_to, t.notes]
    );
  }
  console.log('[Seed] Housekeeping task board populated');

  // 9. Maintenance Tickets
  const tickets = [
    { id: 'mnt_1', room_id: 'rm_402', room_number: '402', issue_type: 'HVAC Chilled Water Sensor Calibration', priority: 'HIGH', status: 'IN_PROGRESS', technician: 'David Miller', resolution_notes: 'Replacement valve arriving from engineering store.' },
    { id: 'mnt_2', room_id: 'rm_102', room_number: '102', issue_type: 'Balcony Smart Lock Battery Check', priority: 'LOW', status: 'OPEN', technician: 'David Miller', resolution_notes: null }
  ];

  for (const tk of tickets) {
    await query(
      `INSERT INTO maintenance_tickets (id, room_id, room_number, issue_type, priority, status, technician, resolution_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tk.id, tk.room_id, tk.room_number, tk.issue_type, tk.priority, tk.status, tk.technician, tk.resolution_notes]
    );
  }
  console.log('[Seed] Maintenance tickets seeded');

  // 10. Reviews & Aspect Sentiment
  const sampleReviews = [
    {
      id: 'rev_1',
      hotel_id: 'htl_mumbai_1',
      user_id: 'usr_guest_1',
      booking_id: 'bk_past_1',
      user_name: 'Alexander Wright',
      rating: 5,
      overall_sentiment: 'POSITIVE',
      comment: 'Exceptional beachfront elegance. The digital NFC room key and online check-in saved us 20 minutes at the front desk. Food was world class.',
      cleanliness_rating: 5,
      food_rating: 5,
      room_rating: 5,
      staff_rating: 5,
      wifi_rating: 5
    },
    {
      id: 'rev_2',
      hotel_id: 'htl_mumbai_1',
      user_id: 'usr_guest_2',
      booking_id: null,
      user_name: 'Dr. Siddharth Mehta',
      rating: 5,
      overall_sentiment: 'POSITIVE',
      comment: 'Unmatched hospitality and breathtaking views over Marine Drive. The smart room controls and concierge made our weekend getaway effortless.',
      cleanliness_rating: 5,
      food_rating: 5,
      room_rating: 5,
      staff_rating: 5,
      wifi_rating: 4
    },
    {
      id: 'rev_3',
      hotel_id: 'htl_udaipur_2',
      user_id: 'usr_guest_1',
      booking_id: null,
      user_name: 'Lady Catherine Spencer',
      rating: 5,
      overall_sentiment: 'POSITIVE',
      comment: 'Like living in a dream. The Lake Pichola arrival boat and royal butler service were simply unforgettable. Worth every rupee.',
      cleanliness_rating: 5,
      food_rating: 5,
      room_rating: 5,
      staff_rating: 5,
      wifi_rating: 4
    }
  ];

  for (const rv of sampleReviews) {
    await query(
      `INSERT INTO reviews (id, hotel_id, user_id, booking_id, user_name, rating, overall_sentiment, comment, cleanliness_rating, food_rating, room_rating, staff_rating, wifi_rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [rv.id, rv.hotel_id, rv.user_id, rv.booking_id, rv.user_name, rv.rating, rv.overall_sentiment, rv.comment, rv.cleanliness_rating, rv.food_rating, rv.room_rating, rv.staff_rating, rv.wifi_rating]
    );
  }
  console.log('[Seed] Guest reviews and aspect ratings seeded');

  // 11. Loyalty Account & Transactions
  await query(
    `INSERT INTO loyalty_accounts (user_id, points_balance, tier) VALUES (?, ?, ?)`,
    ['usr_guest_1', 3450, 'GOLD']
  );

  await query(
    `INSERT INTO loyalty_transactions (id, user_id, booking_id, points, type, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['lt_1', 'usr_guest_1', 'bk_past_1', 4560, 'EARNED', '10% Reward Points on Completed Stay (STAY-6512)']
  );
  console.log('[Seed] Guest Loyalty Account initialized with 3,450 points (GOLD Tier)');

  // 12. Dynamic Pricing Rules
  await query(
    `INSERT INTO pricing_rules (id, hotel_id, base_multiplier, weekend_surge, occupancy_surge, seasonal_surge)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['pr_mum_1', 'htl_mumbai_1', 1.00, 1.15, 1.20, 1.10]
  );
  await query(
    `INSERT INTO pricing_rules (id, hotel_id, base_multiplier, weekend_surge, occupancy_surge, seasonal_surge)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['pr_udr_1', 'htl_udaipur_2', 1.00, 1.20, 1.25, 1.15]
  );
  await query(
    `INSERT INTO pricing_rules (id, hotel_id, base_multiplier, weekend_surge, occupancy_surge, seasonal_surge)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['pr_goa_1', 'htl_goa_3', 1.00, 1.25, 1.30, 1.20]
  );
  console.log('[Seed] Dynamic pricing rules configured for 3 properties');

  console.log('=== StaySync Master Seeding Completed Successfully! ===');
}

module.exports = seed;

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
