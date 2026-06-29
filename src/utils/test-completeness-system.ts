import { computeCompletenessScore } from './propertyCompleteness.ts';
import { checkFieldApplies } from './propertyDiscrimination.ts';

// Define all valid combinations from property-completeness-weights.md
const VALID_COMBINATIONS = [
  { type: 'casa', op: 'venta' },
  { type: 'casa', op: 'alquiler' },
  { type: 'casa', op: 'vacacional' },
  { type: 'apartamento', op: 'venta' },
  { type: 'apartamento', op: 'alquiler' },
  { type: 'apartamento', op: 'vacacional' },
  { type: 'townhouse', op: 'venta' },
  { type: 'townhouse', op: 'alquiler' },
  { type: 'townhouse', op: 'vacacional' },
  { type: 'anexo', op: 'venta' },
  { type: 'anexo', op: 'alquiler' },
  { type: 'anexo', op: 'vacacional' },
  { type: 'habitacion', op: 'alquiler' },
  { type: 'habitacion', op: 'vacacional' },
  { type: 'edificio', op: 'venta' },
  { type: 'edificio', op: 'alquiler' },
  { type: 'galpon', op: 'venta' },
  { type: 'galpon', op: 'alquiler' },
  { type: 'hacienda_finca', op: 'venta' },
  { type: 'hacienda_finca', op: 'alquiler' },
  { type: 'local', op: 'venta' },
  { type: 'local', op: 'alquiler' },
  { type: 'oficina', op: 'venta' },
  { type: 'oficina', op: 'alquiler' },
  { type: 'terreno_lote', op: 'venta' },
  { type: 'terreno_lote', op: 'alquiler' },
  { type: 'hacienda_finca', op: 'vacacional' },
];

// Define minimal data structure for testing
const MINIMAL_DATA = {
  price: '',
  price_currency: '',
  price_negotiable: false,
  price_per_night: '',
  price_weekend: '',
  min_nights: '',
  max_guests: '',
  checkin_time: '',
  checkout_time: '',
  house_rules: '',
  includes_breakfast: false,
  area_built: '',
  area_total: '',
  area_hectares: '',
  bedrooms: '',
  bathrooms: '',
  half_bathrooms: '',
  parking_spaces: '',
  parking_covered: false,
  total_floors: '',
  floor_number: '',
  year_built: '',
  condition: '',
  furnished: '',
  municipio: '',
  zone_id: '',
  address_es: '',
  address_en: '',
  lat: '',
  lng: '',
  show_exact_location: false,
  has_elevator: null,
  has_water_tank: null,
  has_hot_water: null,
  has_generator: null,
  gas_type: '',
  has_internet: null,
  has_security_24h: null,
  has_electric_gate: null,
  has_cctv: null,
  has_electric_fence: null,
  has_intercom: null,
  has_armored_door: null,
  has_ac: null,
  has_heating: null,
  kitchen_type: '',
  bathroom_type: '',
  host_housing_type: '',
  cohabitation: '',
  occupants_count: '',
  gender_policy: '',
  deposit_required: null,
  deposit_amount: '',
  allows_pets: null,
  allows_cooking: null,
  has_independent_entrance: null,
  topography: '',
  land_use: '',
  access_type: '',
  current_use: '',
  has_own_water: null,
  video_url: '',
  virtual_tour_url: '',
};

// Test function to validate the property completeness system
export async function testCompletenessSystem() {
  console.log('Testing property completeness system across all 27 combinations...\n');

  let allTestsPassed = true;

  // Test Case A: Empty form (no operation, no property type)
  console.log('--- Test Case A: Completely Empty Form ---');
  const emptyData = { ...MINIMAL_DATA };
  const scoreEmpty = computeCompletenessScore(emptyData, '', '', 0, () => false);
  const recOp = scoreEmpty.recommendations.find(r => r.field === 'operation');
  const recType = scoreEmpty.recommendations.find(r => r.field === 'property_type');
  const emptyPassed = scoreEmpty.score === 0 && recOp?.weight === 15 && recType?.weight === 15;
  console.log(`Score: ${scoreEmpty.score}% (Expected: 0%)`);
  console.log(`Operation Rec Weight: ${recOp?.weight || 'N/A'} (Expected: 15)`);
  console.log(`Property Type Rec Weight: ${recType?.weight || 'N/A'} (Expected: 15)`);
  if (!emptyPassed) {
    allTestsPassed = false;
    console.log(' ❌ TEST CASE A FAILED\n');
  } else {
    console.log(' ✓ TEST CASE A PASSED\n');
  }

  // Test Case B: Only Operation Selected
  console.log('--- Test Case B: Only Operation Selected ---');
  const scoreOnlyOp = computeCompletenessScore(emptyData, '', 'venta', 0, () => false);
  const recTypeOnly = scoreOnlyOp.recommendations.find(r => r.field === 'property_type');
  const onlyOpPassed = scoreOnlyOp.score === 15 && recTypeOnly?.weight === 15 && !scoreOnlyOp.recommendations.some(r => r.field === 'operation');
  console.log(`Score: ${scoreOnlyOp.score}% (Expected: 15%)`);
  console.log(`Property Type Rec Weight: ${recTypeOnly?.weight || 'N/A'} (Expected: 15)`);
  if (!onlyOpPassed) {
    allTestsPassed = false;
    console.log(' ❌ TEST CASE B FAILED\n');
  } else {
    console.log(' ✓ TEST CASE B PASSED\n');
  }

  // Test Case C: All valid combinations with ONLY parameters selected (should be exactly 30%)
  console.log('--- Test Case C: Valid Combinations with Only Parameters ---');
  for (const combo of VALID_COMBINATIONS) {
    const testData = { ...MINIMAL_DATA };
    const result = computeCompletenessScore(
      testData,
      combo.type,
      combo.op,
      0,
      (field) => checkFieldApplies(field, combo.type, combo.op)
    );

    const expectedScore = 30; // 15% operation + 15% property_type, others empty
    const hasOpRec = result.recommendations.some(r => r.field === 'operation');
    const hasTypeRec = result.recommendations.some(r => r.field === 'property_type');
    
    const comboPassed = result.score === expectedScore && !hasOpRec && !hasTypeRec;
    
    console.log(`Combo ${combo.type} x ${combo.op}: Score = ${result.score}% (Expected: ${expectedScore}%) | Passed: ${comboPassed ? '✓' : '✗'}`);
    
    if (!comboPassed) {
      allTestsPassed = false;
      console.log(`Recommendations returned:`, result.recommendations);
    }
  }

  console.log('\nTesting completed.');

  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED');
  } else {
    console.log('❌ SOME TESTS FAILED');
  }

  return allTestsPassed;
}

// Run the test
await testCompletenessSystem();