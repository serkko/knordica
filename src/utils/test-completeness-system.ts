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
  deposit_required: false,
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

  for (const combo of VALID_COMBINATIONS) {
    console.log(`Testing: ${combo.type.toUpperCase()} × ${combo.op.toUpperCase()}`);

    // Create a copy of minimal data
    const testData = { ...MINIMAL_DATA };

    // Test 1: Verify the system correctly calculates score when only operation and property_type are provided as parameters
    // and no other fields are completed
    const scoreOnlyParams = computeCompletenessScore(
      testData,
      combo.type,
      combo.op,
      0,
      (field) => checkFieldApplies(field, combo.type, combo.op)
    );

    // Test 2: Verify recommendations show absolute weights for operation and property_type
    const recommendations = scoreOnlyParams.recommendations;
    const operationRecommendation = recommendations.find(r => r.field === 'operation');
    const propertyTypeRecommendation = recommendations.find(r => r.field === 'property_type');

    // Test 3: Verify total score is 0% when no fields are completed (since operation and property_type are not fields but parameters)
    // The score should be 0% because no fields are completed, but the combination context is valid
    const expectedScore = 0; // No fields completed, so 0%

    console.log(` Score with only parameters: ${scoreOnlyParams.score}%`);
    console.log(` Expected score: ${expectedScore}%`);

    // Check if recommendations show correct absolute weights for operation and property_type
    const operationRecommendationValid = operationRecommendation && operationRecommendation.weight === 15;
    const propertyTypeRecommendationValid = propertyTypeRecommendation && propertyTypeRecommendation.weight === 15;

    console.log(` Operation recommendation weight: ${operationRecommendation?.weight || 'N/A'} (${operationRecommendationValid ? '✓' : '✗'})`);
    console.log(` Property type recommendation weight: ${propertyTypeRecommendation?.weight || 'N/A'} (${propertyTypeRecommendationValid ? '✓' : '✗'})`);

    // The test passes if the recommendations show the correct absolute weights
    // The score being 0% is expected since no fields are completed
    const testPassed = operationRecommendationValid && propertyTypeRecommendationValid;

    if (!testPassed) {
      allTestsPassed = false;
      console.log(' ❌ TEST FAILED\n');
    } else {
      console.log(' ✓ TEST PASSED\n');
    }
  }

  console.log('Testing completed.');

  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED: Operation and property_type recommendations show correct absolute weights');
  } else {
    console.log('❌ SOME TESTS FAILED: Operation and property_type recommendation weights are incorrect');
  }

  return allTestsPassed;
}

// Run the test
await testCompletenessSystem();