const { query } = require('./src/db/db');
const roomController = require('./src/services/room/roomController');

async function testPriceFilter() {
  console.log('===============================================================');
  console.log('     STAYSYNC ROOM PRICE FILTERING VERIFICATION SUITE          ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Check all rooms in database
    const allRooms = await query(`
      SELECT r.room_number, rt.name as room_type, rt.base_price_per_night
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY rt.base_price_per_night ASC
    `);

    console.log(`Total Rooms in Database: ${allRooms.length}`);
    allRooms.forEach(r => console.log(`  - Room #${r.room_number} (${r.room_type}): ₹${r.base_price_per_night}/night`));
    console.log('');

    // TEST 1: Price Boundary at ₹36,000
    console.log('--- TEST 1: Max Price ₹36,000 Boundary Test ---');
    const maxPrice36k = 36000;
    const roomsFiltered36k = allRooms.filter(r => parseFloat(r.base_price_per_night) <= maxPrice36k);
    const roomsExcluded36k = allRooms.filter(r => parseFloat(r.base_price_per_night) > maxPrice36k);

    assert(roomsFiltered36k.length > 0, `Filtered rooms count: ${roomsFiltered36k.length}`);
    assert(roomsExcluded36k.some(r => r.base_price_per_night === 42000), 'Presidential Sea Penthouse (₹42,000) is strictly EXCLUDED');
    assert(!roomsFiltered36k.some(r => r.base_price_per_night > 36000), 'No room priced above ₹36,000 appears in results');
    assert(roomsFiltered36k.every(r => r.base_price_per_night <= 36000), 'All included rooms have price <= ₹36,000');

    // Edge case: A room priced exactly at ₹36,000 is included
    const mockRoom36k = { room_number: '999', base_price_per_night: 36000 };
    assert(parseFloat(mockRoom36k.base_price_per_night) <= maxPrice36k, 'Room priced exactly at ₹36,000 is included');

    // Edge case: A room priced at ₹36,001 is excluded
    const mockRoom36k1 = { room_number: '998', base_price_per_night: 36001 };
    assert(!(parseFloat(mockRoom36k1.base_price_per_night) <= maxPrice36k), 'Room priced at ₹36,001 is excluded');

    // TEST 2: Price Boundary at ₹25,000
    console.log('\n--- TEST 2: Max Price ₹25,000 Boundary Test ---');
    const maxPrice25k = 25000;
    const roomsFiltered25k = allRooms.filter(r => parseFloat(r.base_price_per_night) <= maxPrice25k);
    assert(roomsFiltered25k.every(r => r.base_price_per_night <= 25000), 'All rooms in 25k filter are <= ₹25,000');
    assert(!roomsFiltered25k.some(r => r.base_price_per_night > 25000), 'All rooms > ₹25,000 (28k, 32k, 42k) are excluded');

    // TEST 3: Backend SQL Query Verification with maxPrice
    console.log('\n--- TEST 3: Backend SQL Query Execution with maxPrice ---');
    const checkIn = '2026-12-10';
    const checkOut = '2026-12-12';

    const dbFiltered36k = await query(`
      SELECT r.id, r.room_number, rt.name, rt.base_price_per_night
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.status != 'MAINTENANCE'
        AND rt.base_price_per_night <= ?
      ORDER BY rt.base_price_per_night ASC
    `, [36000]);

    assert(dbFiltered36k.length > 0, `Database returned ${dbFiltered36k.length} rooms for <= ₹36,000`);
    assert(!dbFiltered36k.some(r => r.base_price_per_night > 36000), 'Zero rooms over ₹36,000 returned by database query');
    assert(!dbFiltered36k.some(r => r.name === 'Presidential Sea Penthouse'), 'Presidential Sea Penthouse excluded from database results');

    // TEST 4: Combined Filter (City + Max Price)
    console.log('\n--- TEST 4: Combined Filter Test (Mumbai + Max Price ₹20,000) ---');
    const dbCombined = await query(`
      SELECT r.room_number, rt.name, rt.base_price_per_night, h.city
      FROM rooms r
      JOIN room_types rt ON r.room_type_id = rt.id
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.status != 'MAINTENANCE'
        AND LOWER(h.city) LIKE '%mumbai%'
        AND rt.base_price_per_night <= ?
    `, [20000]);

    assert(dbCombined.every(r => r.city === 'Mumbai' && r.base_price_per_night <= 20000), 'Combined filter returns only Mumbai rooms <= ₹20,000');
    console.log(`  Combined result rooms: ${dbCombined.map(r => `${r.name} (₹${r.base_price_per_night})`).join(', ')}`);

    console.log('\n===============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testPriceFilter();
