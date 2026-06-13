const SHEETS = {
  spots: 'spots',
  logs: 'logs',
  conditions: 'conditions',
  scoreResults: 'score_results',
  settings: 'settings',
  reportIndex: 'report_index',
  reportDetails: 'report_details',
  catchRecords: 'catch_records',
  shibudaiCandidates: 'shibudai_candidates',
  pointMonthSummary: 'point_month_summary',
  pointAliases: 'point_aliases',
  failedUrls: 'failed_urls',
};

const AVAILABLE_GET_ACTIONS = [
  'getSpots',
  'getSpot',
  'getLogs',
  'scoreAll',
  'timeline',
  'forecast',
  'goldenTime',
  'getGoldenTime',
  'golden',
  'gt',
  'catchSummary',
  'catchBySpot',
  'shibudaiHistory',
];

const PORTSIDE_SHEET_HEADERS = {
  report_index: ['year', 'date_raw', 'date', 'list_location', 'list_fish_text', 'report_url', 'repo_id'],
  report_details: ['repo_id', 'report_url', 'title', 'detail_text', 'detected_points', 'detected_methods', 'detected_conditions', 'evidence_text', 'fetch_status', 'error_message'],
  catch_records: ['date', 'year', 'month', 'repo_id', 'report_url', 'list_location', 'detected_point', 'fish_raw', 'fish_normalized', 'size_cm', 'weight_kg', 'method', 'is_night_fishing', 'evidence_text', 'confidence'],
  shibudai_candidates: ['date', 'year', 'month', 'repo_id', 'report_url', 'list_location', 'detected_point', 'fish_raw', 'fish_normalized', 'size_cm', 'weight_kg', 'method', 'is_night_fishing', 'evidence_text', 'confidence'],
  point_month_summary: ['point', 'month', 'fish_normalized', 'count', 'report_urls'],
  point_aliases: ['spot_id', 'app_spot_name', 'alias', 'confidence', 'memo'],
  failed_urls: ['url', 'source', 'repo_id', 'fetch_status', 'error_message', 'last_attempt_at'],
};

const PORTSIDE_DEFAULT_ALIASES = [
  { spot_id: '62_takanba', app_spot_name: '高ん場', alias: '高ん場', confidence: 'high', memo: 'アプリ釣り場名と同一' },
  { spot_id: '74_motone', app_spot_name: '元根', alias: '元根', confidence: 'high', memo: 'アプリ釣り場名と同一' },
  { spot_id: '75_kagurane', app_spot_name: 'カグラ根', alias: 'カグラ根', confidence: 'high', memo: 'アプリ釣り場名と同一' },
  { spot_id: '75_kagurane', app_spot_name: 'カグラ根', alias: '神楽根', confidence: 'high', memo: '本文表記ゆれ' },
  { spot_id: '76_ongoku', app_spot_name: '遠国', alias: '遠国', confidence: 'high', memo: 'アプリ釣り場名と同一' },
  { spot_id: '76_ongoku', app_spot_name: '遠国', alias: '田牛周辺', confidence: 'low', memo: '広域表記のため断定しない' },
  { spot_id: '77_aragami_taraisaki', app_spot_name: '荒神 タライ岬', alias: '荒神', confidence: 'medium', memo: '周辺表記の可能性あり' },
  { spot_id: '77_aragami_taraisaki', app_spot_name: '荒神 タライ岬', alias: 'タライ岬', confidence: 'medium', memo: '周辺表記の可能性あり' },
  { spot_id: '80_suiheiba', app_spot_name: '水平場 裏水平場', alias: '水平場', confidence: 'high', memo: 'アプリ釣り場名の短縮' },
  { spot_id: '86_yoshida_ozone', app_spot_name: '吉田大根', alias: '吉田大根', confidence: 'high', memo: 'アプリ釣り場名と同一' },
  { spot_id: '95_okatonbi', app_spot_name: '陸トンビ', alias: '陸トンビ', confidence: 'high', memo: 'アプリ釣り場名と同一' },
  { spot_id: '96_kurosaki', app_spot_name: '黒崎', alias: '黒崎', confidence: 'high', memo: 'アプリ釣り場名と同一' },
];

const BASE_AREAS = {
  '外浦須崎': { latitude: 34.666, longitude: 138.987 },
  '下田田牛': { latitude: 34.642, longitude: 138.918 },
  '小稲石廊崎': { latitude: 34.602, longitude: 138.843 },
  '中木吉田': { latitude: 34.628, longitude: 138.798 },
  '妻良伊浜': { latitude: 34.667, longitude: 138.784 },
  '雲見松崎': { latitude: 34.724, longitude: 138.742 },
  '仁科田子': { latitude: 34.802, longitude: 138.760 },
  '田牛': { latitude: 34.642, longitude: 138.918 },
  '石廊崎': { latitude: 34.602, longitude: 138.843 },
};

const AREA_BASE_AREA_MAP = {
  '南伊豆・外浦須崎': '外浦須崎',
  '南伊豆・須崎': '外浦須崎',
  '下田田牛・下田湾口': '下田田牛',
  '下田田牛・和歌ノ浦': '下田田牛',
  '下田田牛': '下田田牛',
  '小稲石廊崎': '小稲石廊崎',
  '中木吉田': '中木吉田',
  '妻良伊浜': '妻良伊浜',
  '雲見松崎': '雲見松崎',
  '仁科田子': '仁科田子',
};

const SPOT_COORDINATES = [
  { spot_id: '62_takanba', latitude: 34.66595429372546, longitude: 138.9873055540375, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '65_kuroshima_yoko', latitude: 34.65426782417559, longitude: 138.97066067517838, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '66_sakiyama_gakeshita', latitude: 34.65377453625561, longitude: 138.97392028652447, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '67_akane', latitude: 34.65304613324002, longitude: 138.9768772289867, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '69_akasaki', latitude: 34.6524524078731, longitude: 138.95424055676256, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '71_ganjima', latitude: 34.66737458063759, longitude: 138.94924154399172, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '72_akanejima', latitude: 34.66261331702966, longitude: 138.9470681525203, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '73_noroshizaki', latitude: 34.6621708470976, longitude: 138.94146867988673, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: 'nagaiso', latitude: 34.64485409927357, longitude: 138.91799374628604, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '74_motone', latitude: 34.64252154653855, longitude: 138.91769486847107, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '75_kagurane', latitude: 34.64158415200717, longitude: 138.9163332129774, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '76_ongoku', latitude: 34.631407151077035, longitude: 138.90766167981823, coord_accuracy: 'exact', coordinate_note: 'ユーザー再確認座標' },
  { spot_id: '77_aragami_taraisaki', latitude: 34.62856742719255, longitude: 138.90017626229135, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '78_takaiso_takamizaki', latitude: 34.62450084764903, longitude: 138.88976346852775, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '79_umanose', latitude: 34.601874894939705, longitude: 138.84610014891663, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '80_suiheiba', latitude: 34.601691921431076, longitude: 138.84533396162823, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '81_yunohana', latitude: 34.60150246320644, longitude: 138.84229939001986, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '82_naraiomote', latitude: 34.60183364764506, longitude: 138.84131494194511, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '83_tsunohonze', latitude: 34.603712922850185, longitude: 138.83809507432585, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '86_yoshida_ozone', latitude: 34.636902553185855, longitude: 138.78949726418423, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '90_kokeshijima_ura', latitude: 34.666680262689525, longitude: 138.78363252083324, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '94_zappun', latitude: 34.71512159674666, longitude: 138.74220405903077, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '95_okatonbi', latitude: 34.72841388427518, longitude: 138.74172547582492, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '96_kurosaki', latitude: 34.73621197019109, longitude: 138.7498091400067, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '97_hagiyazaki', latitude: 34.745850774653306, longitude: 138.75487720942178, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '98_murozaki', latitude: 34.752510999095485, longitude: 138.76490781932355, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '99_ajirozaki', latitude: 34.771779995331265, longitude: 138.7623452687985, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
  { spot_id: '100_onbi', latitude: 34.77472702255147, longitude: 138.76746673650615, coord_accuracy: 'exact', coordinate_note: 'ユーザー確認座標' },
];

function doGet(e) {
  try {
    const action = String((e.parameter && e.parameter.action) || '').trim();
    if (action === 'getSpots') return jsonOk(getSpots());
    if (action === 'getSpot') return jsonOk(getSpotById(e.parameter.spot_id));
    if (action === 'getLogs') return jsonOk(getLogs_(e.parameter.spot_id));
    if (action === 'scoreAll') return jsonOk(scoreAll_(getLatestCondition_()));
    if (action === 'timeline') return jsonOk(createTimeline_(e.parameter.spot_id, getLatestCondition_()));
    if (action === 'forecast') return forecastResponse_(e.parameter.date, e.parameter.area);
    if (isGoldenTimeAction_(action)) return goldenTimeResponse_(e.parameter.spot_id, e.parameter.date);
    if (action === 'catchSummary') return jsonPayload_({ ok: true, ...catchSummary_() });
    if (action === 'catchBySpot') return jsonPayload_({ ok: true, ...catchBySpot_(e.parameter.spot_id) });
    if (action === 'shibudaiHistory') return jsonPayload_({ ok: true, ...shibudaiHistory_() });
    return jsonError_('Unknown action: ' + (action || '(empty)'), { availableActions: AVAILABLE_GET_ACTIONS });
  } catch (error) {
    return jsonError_(String(error));
  }
}

function isGoldenTimeAction_(action) {
  return ['goldenTime', 'getGoldenTime', 'golden', 'gt'].includes(action);
}

function getSpots() {
  return getRows_(SHEETS.spots).map(normalizeSpot_);
}

function getSpotById(spot_id) {
  return getSpots().find((spot) => spot.spot_id === spot_id) || null;
}

function setupPortsideSheets() {
  const ss = SpreadsheetApp.getActive();
  const created = [];
  const updated = [];
  Object.keys(PORTSIDE_SHEET_HEADERS).forEach((sheetName) => {
    const result = ensureSheetHeaders_(ss, sheetName, PORTSIDE_SHEET_HEADERS[sheetName]);
    if (result.created) created.push(sheetName);
    if (result.addedHeaders.length > 0) updated.push({ sheetName, addedHeaders: result.addedHeaders });
  });
  const aliasSeeded = seedPointAliases_(ss);
  const result = { created, updated, aliasSeeded };
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function catchSummary_() {
  const summary = getRowsSafe_(SHEETS.pointMonthSummary).map(normalizePointMonthSummary_);
  const aliases = getAllPointAliases_();
  const records = getRowsSafe_(SHEETS.catchRecords).map(normalizeCatchRecord_).map((record) => enrichRecordWithAlias_(record, aliases));
  return {
    summary,
    records,
    shibudai_records: shibudaiHistoryRecords_(aliases),
    generated_at: Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss'),
  };
}

function catchBySpot_(spotId) {
  const spot = getSpotById(spotId);
  const aliases = getPointAliasesForSpot_(spotId, spot);
  const records = getRowsSafe_(SHEETS.catchRecords)
    .map(normalizeCatchRecord_)
    .map((record) => {
      const match = findAliasMatchForRecord_(record, aliases);
      if (!match) return null;
      return {
        ...record,
        spot_id: spotId,
        spot_name: spot ? spot.name : match.app_spot_name,
        alias: match.alias,
        alias_confidence: match.confidence,
        confidence: combineConfidence_(record.confidence, match.confidence),
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  return {
    spot_id: spotId || '',
    spot_name: spot ? spot.name : '',
    records,
  };
}

function shibudaiHistory_() {
  return { records: shibudaiHistoryRecords_() };
}

function shibudaiHistoryRecords_(aliases) {
  const candidateRows = getRowsSafe_(SHEETS.shibudaiCandidates);
  const sourceRows = candidateRows.length > 0
    ? candidateRows
    : getRowsSafe_(SHEETS.catchRecords).filter(isShibudaiCandidateRow_);
  const aliasRows = aliases || getAllPointAliases_();
  return sourceRows
    .map(normalizeCatchRecord_)
    .map((record) => enrichRecordWithAlias_(record, aliasRows))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

function ensureSheetHeaders_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  const created = !sheet;
  if (!sheet) sheet = ss.insertSheet(sheetName);
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return { created, addedHeaders: headers };
  }

  let existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const missing = headers.filter((header) => !existingHeaders.includes(header));
  if (missing.length > 0) {
    sheet.getRange(1, existingHeaders.length + 1, 1, missing.length).setValues([missing]);
    existingHeaders = existingHeaders.concat(missing);
  }
  return { created, addedHeaders: missing };
}

function seedPointAliases_(ss) {
  const sheet = ss.getSheetByName(SHEETS.pointAliases);
  if (!sheet) return 0;
  if (sheet.getLastRow() > 1) return 0;
  const headers = PORTSIDE_SHEET_HEADERS.point_aliases;
  const values = PORTSIDE_DEFAULT_ALIASES.map((alias) => headers.map((header) => alias[header] || ''));
  if (values.length > 0) sheet.getRange(2, 1, values.length, headers.length).setValues(values);
  return values.length;
}

function getPointAliasesForSpot_(spotId, spot) {
  const aliases = getAllPointAliases_()
    .filter((row) => String(row.spot_id || '') === String(spotId || ''))
    .filter((row) => row.alias);
  if (spot && spot.name && !aliases.some((row) => normalizeText_(row.alias) === normalizeText_(spot.name))) {
    aliases.push({
      spot_id: spot.spot_id,
      app_spot_name: spot.name,
      alias: spot.name,
      confidence: 'high',
      memo: '釣り場名による自動マッチ',
    });
  }
  return aliases;
}

function getAllPointAliases_() {
  return getRowsSafe_(SHEETS.pointAliases).map(normalizePointAlias_).filter((row) => row.alias);
}

function enrichRecordWithAlias_(record, aliases) {
  const aliasRows = aliases || getAllPointAliases_();
  const match = findAliasMatchForRecord_(record, aliasRows);
  if (!match) return record;
  return {
    ...record,
    spot_id: match.confidence === 'low' ? '' : match.spot_id,
    candidate_spot_id: match.spot_id,
    app_spot_name: match.app_spot_name,
    alias: match.alias,
    alias_confidence: match.confidence,
    confidence: combineConfidence_(record.confidence, match.confidence),
  };
}

function findAliasMatchForRecord_(record, aliases) {
  const haystacks = [record.detected_point, record.list_location]
    .map(normalizeText_)
    .filter(Boolean);
  const rankedAliases = aliases
    .filter((alias) => alias.alias)
    .sort((a, b) => confidenceWeight_(b.confidence) - confidenceWeight_(a.confidence));
  for (const alias of rankedAliases) {
    const needle = normalizeText_(alias.alias);
    if (!needle) continue;
    if (haystacks.some((text) => text === needle || (needle.length >= 2 && text.includes(needle)))) return alias;
  }
  return null;
}

function normalizeCatchRecord_(row) {
  const date = formatDateCell_(row.date);
  return {
    date,
    year: Number(row.year || (date ? String(date).slice(0, 4) : '')) || '',
    month: Number(row.month || (date ? String(date).slice(5, 7) : '')) || '',
    repo_id: String(row.repo_id || ''),
    report_url: String(row.report_url || ''),
    list_location: String(row.list_location || ''),
    detected_point: String(row.detected_point || ''),
    fish_raw: String(row.fish_raw || ''),
    fish_normalized: String(row.fish_normalized || ''),
    size_cm: row.size_cm || '',
    weight_kg: row.weight_kg || '',
    method: String(row.method || ''),
    is_night_fishing: toBool_(row.is_night_fishing),
    evidence_text: truncateText_(row.evidence_text || '', 120),
    confidence: String(row.confidence || ''),
  };
}

function normalizePointMonthSummary_(row) {
  return {
    point: String(row.point || ''),
    month: Number(row.month || 0),
    fish_normalized: String(row.fish_normalized || ''),
    count: Number(row.count || 0),
    report_urls: splitUrls_(row.report_urls),
  };
}

function normalizePointAlias_(row) {
  return {
    spot_id: String(row.spot_id || ''),
    app_spot_name: String(row.app_spot_name || ''),
    alias: String(row.alias || ''),
    confidence: String(row.confidence || 'medium').toLowerCase(),
    memo: String(row.memo || ''),
  };
}

function isShibudaiCandidateRow_(row) {
  const text = [
    row.fish_normalized,
    row.fish_raw,
    row.evidence_text,
    row.list_fish_text,
    row.detail_text,
  ].map((value) => String(value || '')).join(' ');
  return /シブダイ|フエダイ/.test(text) || String(row.fish_normalized || '') === 'シブダイ系';
}

function splitUrls_(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return String(value || '')
    .split(/[\s,、]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function formatDateCell_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, 'Asia/Tokyo', 'yyyy-MM-dd');
  }
  return String(value || '');
}

function truncateText_(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function normalizeText_(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function confidenceWeight_(confidence) {
  const value = String(confidence || '').toLowerCase();
  if (value === 'high') return 3;
  if (value === 'medium') return 2;
  if (value === 'low') return 1;
  return 2;
}

function combineConfidence_(recordConfidence, aliasConfidence) {
  const record = String(recordConfidence || '').toLowerCase();
  const alias = String(aliasConfidence || '').toLowerCase();
  if (record === 'low' || alias === 'low') return 'low';
  if (record === 'high' && alias === 'high') return 'high';
  return record || alias || 'medium';
}

function setupSpotCoordinates() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.spots);
  if (!sheet) throw new Error('spots sheet not found');
  const requiredHeaders = ['latitude', 'longitude', 'coord_accuracy', 'coordinate_note', 'base_area'];
  const values = sheet.getDataRange().getValues();
  if (values.length === 0) throw new Error('spots sheet has no header row');
  let headers = values[0].map(String);
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    sheet.getRange(1, headers.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
    headers = headers.concat(missingHeaders);
    values[0] = headers;
  }

  const column = Object.fromEntries(headers.map((header, index) => [header, index]));
  if (column.spot_id === undefined) throw new Error('spots sheet requires spot_id column');
  const coordinatesById = Object.fromEntries(SPOT_COORDINATES.map((spot) => [spot.spot_id, spot]));
  const foundIds = {};
  let updated = 0;

  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    const row = values[rowIndex];
    while (row.length < headers.length) row.push('');
    const spotId = String(row[column.spot_id] || '');
    const coordinate = coordinatesById[spotId];
    if (!coordinate) continue;
    row[column.latitude] = coordinate.latitude;
    row[column.longitude] = coordinate.longitude;
    row[column.coord_accuracy] = coordinate.coord_accuracy;
    row[column.coordinate_note] = coordinate.coordinate_note;
    row[column.base_area] = baseAreaFor_(row[column.area]);
    foundIds[spotId] = true;
    updated++;
  }

  sheet.getRange(1, 1, values.length, headers.length).setValues(values);
  const missingSpotIds = SPOT_COORDINATES
    .map((spot) => spot.spot_id)
    .filter((spotId) => !foundIds[spotId]);
  const result = { updated, missingSpotIds };
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.action === 'saveLog') return jsonOk(appendRow_(SHEETS.logs, body.log));
    if (body.action === 'saveCondition') return jsonOk(appendRow_(SHEETS.conditions, body.condition));
    if (body.action === 'scoreAll') return jsonOk(scoreAll_(body.condition));
    return jsonError_('Unknown action: ' + (body.action || '(empty)'), { availableActions: ['saveLog', 'saveCondition', 'scoreAll'] });
  } catch (error) {
    return jsonError_(String(error));
  }
}

function forecastResponse_(targetDate, areaName) {
  const date = targetDate || Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  const area = BASE_AREAS[areaName] ? areaName : '田牛';
  const point = BASE_AREAS[area];
  const weather = fetchWeatherForecast_(point, date);
  const marine = fetchMarineForecast_(point, date);
  const conditions = buildAutoConditions_(date, weather, marine);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, date, area, conditions }))
    .setMimeType(ContentService.MimeType.JSON);
}

function fetchWeatherForecast_(point, date, endDate) {
  const params = {
    latitude: point.latitude,
    longitude: point.longitude,
    timezone: 'Asia/Tokyo',
    start_date: date,
    end_date: endDate || date,
    hourly: 'weather_code,wind_speed_10m,wind_direction_10m,cloud_cover',
    daily: 'weather_code,wind_speed_10m_max,wind_direction_10m_dominant,sunrise,sunset',
    wind_speed_unit: 'ms',
  };
  return fetchJson_('https://api.open-meteo.com/v1/forecast', params);
}

function fetchMarineForecast_(point, date, endDate) {
  const params = {
    latitude: point.latitude,
    longitude: point.longitude,
    timezone: 'Asia/Tokyo',
    start_date: date,
    end_date: endDate || date,
    hourly: 'wave_height,swell_wave_height,swell_wave_direction,sea_surface_temperature,sea_level_height_msl,ocean_current_velocity,ocean_current_direction',
    daily: 'wave_height_max,swell_wave_height_max,swell_wave_direction_dominant',
    cell_selection: 'sea',
  };
  return fetchJson_('https://marine-api.open-meteo.com/v1/marine', params);
}

function fetchJson_(endpoint, params) {
  const query = Object.keys(params)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
  const response = UrlFetchApp.fetch(endpoint + '?' + query, { muteHttpExceptions: true });
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) throw new Error('Open-Meteo API error: ' + text);
  return JSON.parse(text);
}

function buildAutoConditions_(date, weather, marine) {
  const hourlyWeather = weather.hourly || {};
  const hourlyMarine = marine.hourly || {};
  const dailyWeather = weather.daily || {};
  const dailyMarine = marine.daily || {};
  const waterTemp = average_(hourlyMarine.sea_surface_temperature);
  const seaLevels = hourlyMarine.sea_level_height_msl || [];
  const tideRange = max_(seaLevels) - min_(seaLevels);
  const weatherCodes = hourlyWeather.weather_code || dailyWeather.weather_code || [];
  const windSpeed = max_(hourlyWeather.wind_speed_10m || dailyWeather.wind_speed_10m_max || []);
  const windDirection = directionToCompass_(averageDirection_(hourlyWeather.wind_direction_10m || dailyWeather.wind_direction_10m_dominant || []));
  const waveHeight = max_(hourlyMarine.wave_height || dailyMarine.wave_height_max || []);
  const swellDirection = directionToCompass_(averageDirection_(hourlyMarine.swell_wave_direction || dailyMarine.swell_wave_direction_dominant || []));
  const moon = moonCondition_(date);

  return {
    waterTemp: round1_(waterTemp || 24),
    tempTrend: 0,
    tide: tideRange >= 0.35 ? 'moving' : tideRange >= 0.18 ? 'start' : 'slack',
    moon,
    waveHeight: round1_(waveHeight || 0.8),
    swellDirection,
    windDirection,
    windSpeed: round1_(windSpeed || 4),
    thunderRisk: hasThunderRisk_(weatherCodes),
    routeRisk: max_(seaLevels) >= 0.45,
  };
}

function goldenTimeResponse_(spotId, targetDate) {
  const spot = getSpotById(spotId);
  if (!spot) return jsonError_('spot not found');
  const date = targetDate || Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  const endDate = nextDate_(date);
  const point = pointForSpot_(spot);
  let result;
  try {
    const weather = fetchWeatherForecast_(point, date, endDate);
    const marine = fetchMarineForecast_(point, date, endDate);
    result = buildGoldenTime_(spot, date, point, weather, marine);
  } catch (error) {
    result = buildSimpleGoldenTime_(spot, date, 'Open-Meteo取得失敗: ' + String(error));
  }
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, ...result }))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildSimpleGoldenTime_(spot, date, errorNote) {
  const astronomy = {
    sunset: '18:58',
    sunrise: '04:32',
    moon_age: round1_(moonAge_(new Date(date + 'T12:00:00+09:00'))),
    moonrise: '',
    moonset: '',
  };
  const safetyPenalty = Number(spot.night_safety || 3) <= 1 ? 18 : Number(spot.night_safety || 3) === 2 ? 8 : 0;
  const firstScore = clamp_(72 + Number(spot.shibudai_score || 3) * 2 - Number(spot.difficulty || 3) - safetyPenalty);
  const secondScore = clamp_(68 + Number(spot.shibudai_score || 3) - safetyPenalty);
  const windows = [
    {
      start: '19:00',
      end: '21:00',
      score: firstScore,
      label: '夕まずめ〜夜序盤',
      reasons: ['日没後の暗さ', '夜釣り向き時間帯'],
    },
    {
      start: '03:30',
      end: '04:30',
      score: secondScore,
      label: '夜明け前',
      reasons: ['朝まずめ前の回遊期待'],
    },
  ];
  const notice = '潮位・潮流は推定参考値です。現地判断を優先してください。' + (errorNote ? ' ' + errorNote : '');
  return {
    spot_id: spot.spot_id,
    spot_name: spot.name,
    date,
    source: 'simple_estimate',
    notice,
    astronomy,
    golden_times: windows,
    golden_time: {
      windows,
      astronomy,
      notice,
    },
    hourly: windows.map((window) => ({
      time: window.start,
      golden_score: window.score,
      tide_movement_score: 60,
      tide_size_score: 55,
      current_score: 55,
      darkness_score: 82,
      moon_score: 65,
      sun_score: 78,
      sea_safety_score: 70,
    })),
  };
}

function buildGoldenTime_(spot, date, point, weather, marine) {
  const nextDate = nextDate_(date);
  const hourlyMarine = marine.hourly || {};
  const hourlyWeather = weather.hourly || {};
  const times = hourlyMarine.time || [];
  const seaLevels = hourlyMarine.sea_level_height_msl || [];
  const tideRange = max_(seaLevels) - min_(seaLevels);
  const sunTimes = sunTimesFromWeather_(weather, date, nextDate, point);

  const hourly = times
    .map((time, index) => {
      const day = String(time).slice(0, 10);
      const hour = Number(String(time).slice(11, 13));
      if (!((day === date && hour >= 18) || (day === nextDate && hour <= 5))) return null;

      const weatherIndex = matchingTimeIndex_(hourlyWeather.time || [], time);
      const dt = parseLocalTime_(time);
      const seaLevel = numberOr_(seaLevels[index], 0);
      const prevLevel = numberOr_(seaLevels[index - 1], seaLevel);
      const nextLevel = numberOr_(seaLevels[index + 1], seaLevel);
      const movement = Math.max(Math.abs(seaLevel - prevLevel), Math.abs(nextLevel - seaLevel));
      const currentVelocity = numberOr_(hourlyMarine.ocean_current_velocity && hourlyMarine.ocean_current_velocity[index], 0);
      const waveHeight = numberOr_(hourlyMarine.wave_height && hourlyMarine.wave_height[index], 0.8);
      const swellDirection = directionToCompass_(numberOr_(hourlyMarine.swell_wave_direction && hourlyMarine.swell_wave_direction[index], 225));
      const windSpeed = numberOr_(hourlyWeather.wind_speed_10m && hourlyWeather.wind_speed_10m[weatherIndex], 4);
      const weatherCode = numberOr_(hourlyWeather.weather_code && hourlyWeather.weather_code[weatherIndex], 0);
      const cloudCover = numberOr_(hourlyWeather.cloud_cover && hourlyWeather.cloud_cover[weatherIndex], 0);
      const moon = moonDetails_(dt, point.latitude, point.longitude);
      const dangerPenalty = dangerPenalty_(spot, waveHeight, windSpeed, swellDirection, weatherCode);

      const tideMovementScore = tideMovementScore_(movement, seaLevels, index);
      const tideSizeScore = tideSizeScore_(tideRange, waveHeight);
      const currentScore = currentScore_(currentVelocity);
      const darknessScore = darknessScore_(dt, sunTimes.sunset, sunTimes.sunrise);
      const moonScore = moonScore_(moon, cloudCover);
      const sunScore = sunTransitionScore_(dt, sunTimes.sunset, sunTimes.sunrise);
      const seaSafetyScore = seaSafetyScore_(waveHeight, windSpeed, swellDirection, spot, weatherCode);
      const goldenScore = clamp_(
        tideMovementScore * 0.30 +
        tideSizeScore * 0.15 +
        currentScore * 0.15 +
        darknessScore * 0.15 +
        moonScore * 0.10 +
        sunScore * 0.05 +
        seaSafetyScore * 0.10 -
        dangerPenalty
      );

      return {
        time: hourLabel_(dt),
        iso_time: time,
        golden_score: goldenScore,
        tide_movement_score: tideMovementScore,
        tide_size_score: tideSizeScore,
        current_score: currentScore,
        darkness_score: darknessScore,
        moon_score: moonScore,
        sun_score: sunScore,
        sea_safety_score: seaSafetyScore,
        tide_level: round1_(seaLevel),
        tide_movement: round1_(movement),
        current_velocity: round1_(currentVelocity),
        current_direction: directionToCompass_(numberOr_(hourlyMarine.ocean_current_direction && hourlyMarine.ocean_current_direction[index], 0)),
        wave_height: round1_(waveHeight),
        wind_speed: round1_(windSpeed),
        moon_age: round1_(moon.age),
        moon_altitude: round1_(moon.altitude),
        label: goldenLabel_(goldenScore),
        reasons: goldenReasons_(tideMovementScore, currentScore, darknessScore, moonScore, sunScore, seaSafetyScore, dangerPenalty),
      };
    })
    .filter(Boolean);

  const goldenWindows = buildGoldenWindows_(hourly);
  const astronomy = astronomySummary_(hourly, sunTimes);
  const notice = '潮位・潮流はOpen-Meteo Marine APIの推定参考値です。沿岸地磯では誤差があるため現地判断を優先してください。';

  return {
    spot_id: spot.spot_id,
    spot_name: spot.name,
    date,
    source: 'open_meteo_estimate',
    notice,
    astronomy,
    golden_times: goldenWindows,
    golden_time: {
      windows: goldenWindows,
      astronomy,
      notice,
    },
    hourly,
  };
}

function astronomySummary_(hourly, sunTimes) {
  return {
    sunset: hourLabel_(sunTimes.sunset),
    sunrise: hourLabel_(sunTimes.sunrise),
    moon_age: hourly.length ? hourly[0].moon_age : '',
    moonrise: moonCrossing_(hourly, 'rise'),
    moonset: moonCrossing_(hourly, 'set'),
  };
}

function moonCrossing_(hourly, type) {
  for (let index = 1; index < hourly.length; index++) {
    const prev = Number(hourly[index - 1].moon_altitude);
    const next = Number(hourly[index].moon_altitude);
    if (type === 'rise' && prev < 0 && next >= 0) return hourly[index].time;
    if (type === 'set' && prev >= 0 && next < 0) return hourly[index].time;
  }
  return '';
}

function buildGoldenWindows_(hourly) {
  const winners = [];
  let current = [];
  hourly.forEach((slot) => {
    if (slot.golden_score >= 70) {
      current.push(slot);
    } else if (current.length) {
      winners.push(current);
      current = [];
    }
  });
  if (current.length) winners.push(current);

  const windows = winners
    .map((group) => {
      const best = group.reduce((top, slot) => slot.golden_score > top.golden_score ? slot : top, group[0]);
      const end = addHourLabel_(group[group.length - 1].iso_time);
      return {
        start: group[0].time,
        end,
        score: best.golden_score,
        label: goldenLabel_(best.golden_score),
        reasons: best.reasons,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (windows.length > 0) return windows;
  const best = hourly.reduce((top, slot) => !top || slot.golden_score > top.golden_score ? slot : top, null);
  return best ? [{
    start: best.time,
    end: addHourLabel_(best.iso_time),
    score: best.golden_score,
    label: goldenLabel_(best.golden_score),
    reasons: best.reasons,
  }] : [];
}

function tideMovementScore_(movement, seaLevels, index) {
  let score = 42;
  if (movement >= 0.14) score = 96;
  else if (movement >= 0.09) score = 86;
  else if (movement >= 0.05) score = 74;
  else if (movement >= 0.025) score = 58;
  const prev = numberOr_(seaLevels[index], 0) - numberOr_(seaLevels[index - 1], numberOr_(seaLevels[index], 0));
  const next = numberOr_(seaLevels[index + 1], numberOr_(seaLevels[index], 0)) - numberOr_(seaLevels[index], 0);
  if (prev !== 0 && next !== 0 && (prev > 0) !== (next > 0)) score += 10;
  return clamp_(score);
}

function tideSizeScore_(range, waveHeight) {
  let score = range >= 0.9 ? 94 : range >= 0.6 ? 82 : range >= 0.35 ? 68 : range >= 0.18 ? 52 : 40;
  if (range >= 0.9 && waveHeight >= 1.2) score -= 10;
  return clamp_(score);
}

function currentScore_(velocity) {
  if (velocity <= 0.05) return 42;
  if (velocity <= 0.35) return 62;
  if (velocity <= 1.4) return 92;
  if (velocity <= 2.4) return 78;
  if (velocity <= 3.4) return 55;
  return 34;
}

function darknessScore_(dt, sunset, sunrise) {
  const afterSunset = (dt.getTime() - sunset.getTime()) / 60000;
  const beforeSunrise = (sunrise.getTime() - dt.getTime()) / 60000;
  if (afterSunset >= 70 && beforeSunrise >= 70) return 96;
  if (afterSunset >= 30 || beforeSunrise >= 30) return 82;
  if (afterSunset >= 0 || beforeSunrise >= 0) return 62;
  return 28;
}

function moonScore_(moon, cloudCover) {
  let score = moon.altitude < -2 ? 96 : moon.altitude < 8 ? 86 : moon.altitude < 22 ? 70 : 54;
  if (moon.illumination >= 0.75 && moon.altitude >= 12) score -= 22;
  if (cloudCover >= 65 && moon.altitude >= 0) score += 8;
  return clamp_(score);
}

function sunTransitionScore_(dt, sunset, sunrise) {
  const afterSunset = (dt.getTime() - sunset.getTime()) / 60000;
  const beforeSunrise = (sunrise.getTime() - dt.getTime()) / 60000;
  if (afterSunset >= 30 && afterSunset <= 150) return 88;
  if (beforeSunrise >= 30 && beforeSunrise <= 120) return 82;
  return 48;
}

function seaSafetyScore_(waveHeight, windSpeed, swellDirection, spot, weatherCode) {
  if (weatherCode >= 95 && weatherCode <= 99) return 0;
  let score = 88;
  if (waveHeight > 0.8) score -= (waveHeight - 0.8) * 28;
  if (windSpeed > 5) score -= (windSpeed - 5) * 5;
  const ngDirections = String(spot.ng_swell_direction || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (ngDirections.includes(swellDirection)) score -= waveHeight >= 1.0 ? 28 : 12;
  if (Number(spot.night_safety || 3) <= 1) score -= 35;
  if (Number(spot.night_safety || 3) === 2) score -= 10;
  return clamp_(score);
}

function dangerPenalty_(spot, waveHeight, windSpeed, swellDirection, weatherCode) {
  let penalty = 0;
  if (weatherCode >= 95 && weatherCode <= 99) penalty += 80;
  if (waveHeight >= 1.7) penalty += 36;
  else if (waveHeight >= 1.3) penalty += 16;
  if (windSpeed >= 12) penalty += 26;
  else if (windSpeed >= 9) penalty += 10;
  const ngDirections = String(spot.ng_swell_direction || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (ngDirections.includes(swellDirection) && waveHeight >= 1.1) penalty += 18;
  if (Number(spot.night_safety || 3) <= 1) penalty += 26;
  return penalty;
}

function goldenReasons_(tideMovement, current, darkness, moon, sun, seaSafety, dangerPenalty) {
  const reasons = [];
  if (tideMovement >= 78) reasons.push('潮位変化が大きく、潮が動く推定');
  if (current >= 78) reasons.push('海流速度が適度で仕掛けが効きやすい推定');
  if (darkness >= 82) reasons.push('日没後で暗い時間帯');
  if (moon >= 82) reasons.push('月高度が低い、または月没後で暗い');
  if (sun >= 80) reasons.push('日没後または夜明け前の移行帯');
  if (seaSafety >= 76) reasons.push('波風が許容範囲');
  if (dangerPenalty > 0) reasons.push('危険条件があるため安全側に減点');
  return reasons.length ? reasons : ['複数条件が平均的に揃う推定時間'];
}

function goldenLabel_(score) {
  if (score >= 82) return '本命集中';
  if (score >= 74) return '継続価値あり';
  if (score >= 66) return '短時間勝負';
  return '調査候補';
}

function sunTimesFromWeather_(weather, date, nextDate, point) {
  const daily = weather.daily || {};
  const days = daily.time || [];
  const sunsetIndex = days.indexOf(date);
  const sunriseIndex = days.indexOf(nextDate);
  const sunsetText = sunsetIndex >= 0 && daily.sunset ? daily.sunset[sunsetIndex] : date + 'T18:45';
  const sunriseText = sunriseIndex >= 0 && daily.sunrise ? daily.sunrise[sunriseIndex] : nextDate + 'T04:40';
  return {
    sunset: parseLocalTime_(sunsetText),
    sunrise: parseLocalTime_(sunriseText),
  };
}

function moonDetails_(dt, latitude, longitude) {
  const d = toDays_(dt);
  const coords = moonCoords_(d);
  const lw = -longitude * Math.PI / 180;
  const phi = latitude * Math.PI / 180;
  const H = siderealTime_(d, lw) - coords.ra;
  const altitude = Math.asin(Math.sin(phi) * Math.sin(coords.dec) + Math.cos(phi) * Math.cos(coords.dec) * Math.cos(H));
  const age = moonAge_(dt);
  const illumination = (1 - Math.cos(2 * Math.PI * age / 29.53058867)) / 2;
  return {
    age,
    illumination,
    altitude: altitude * 180 / Math.PI,
  };
}

function moonCoords_(d) {
  const rad = Math.PI / 180;
  const L = rad * (218.316 + 13.176396 * d);
  const M = rad * (134.963 + 13.064993 * d);
  const F = rad * (93.272 + 13.229350 * d);
  const l = L + rad * 6.289 * Math.sin(M);
  const b = rad * 5.128 * Math.sin(F);
  return {
    ra: rightAscension_(l, b),
    dec: declination_(l, b),
  };
}

function rightAscension_(l, b) {
  const e = Math.PI / 180 * 23.4397;
  return Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l));
}

function declination_(l, b) {
  const e = Math.PI / 180 * 23.4397;
  return Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
}

function siderealTime_(d, lw) {
  return Math.PI / 180 * (280.16 + 360.9856235 * d) - lw;
}

function toDays_(date) {
  return date.getTime() / 86400000 - 10957.5;
}

function moonAge_(date) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const days = (date.getTime() - knownNewMoon.getTime()) / 86400000;
  return ((days % 29.53058867) + 29.53058867) % 29.53058867;
}

function pointForSpot_(spot) {
  const latitude = Number(spot.latitude);
  const longitude = Number(spot.longitude);
  if (isFinite(latitude) && isFinite(longitude) && latitude !== 0 && longitude !== 0) return { latitude, longitude };
  const area = spot.base_area || baseAreaFor_(spot.area);
  return BASE_AREAS[area] || BASE_AREAS['田牛'];
}

function matchingTimeIndex_(times, targetTime) {
  const index = (times || []).indexOf(targetTime);
  return index >= 0 ? index : 0;
}

function parseLocalTime_(text) {
  const value = String(text || '');
  return new Date(value.length === 16 ? value + ':00+09:00' : value);
}

function hourLabel_(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'HH:mm');
}

function addHourLabel_(isoTime) {
  const date = parseLocalTime_(isoTime);
  date.setHours(date.getHours() + 1);
  return hourLabel_(date);
}

function nextDate_(dateText) {
  const date = new Date(dateText + 'T00:00:00+09:00');
  date.setDate(date.getDate() + 1);
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
}

function numberOr_(value, fallback) {
  const number = Number(value);
  return isFinite(number) ? number : fallback;
}

function hasThunderRisk_(codes) {
  return (codes || []).some((code) => Number(code) >= 95 && Number(code) <= 99);
}

function moonCondition_(dateText) {
  const date = new Date(dateText + 'T12:00:00+09:00');
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const days = (date.getTime() - knownNewMoon.getTime()) / 86400000;
  const age = ((days % 29.53058867) + 29.53058867) % 29.53058867;
  if (age <= 5 || age >= 24) return 'dark';
  if (age >= 11 && age <= 18) return 'bright';
  return 'low';
}

function directionToCompass_(degrees) {
  if (!isFinite(degrees)) return 'SW';
  const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return labels[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}

function averageDirection_(values) {
  const nums = (values || []).map(Number).filter(isFinite);
  if (nums.length === 0) return NaN;
  let x = 0;
  let y = 0;
  nums.forEach((degrees) => {
    const radians = degrees * Math.PI / 180;
    x += Math.cos(radians);
    y += Math.sin(radians);
  });
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

function average_(values) {
  const nums = (values || []).map(Number).filter(isFinite);
  if (nums.length === 0) return NaN;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function max_(values) {
  const nums = (values || []).map(Number).filter(isFinite);
  return nums.length ? Math.max.apply(null, nums) : 0;
}

function min_(values) {
  const nums = (values || []).map(Number).filter(isFinite);
  return nums.length ? Math.min.apply(null, nums) : 0;
}

function round1_(value) {
  return Math.round(Number(value) * 10) / 10;
}

function getLogs_(spotId) {
  const logs = getRows_(SHEETS.logs);
  return spotId ? logs.filter((log) => log.spot_id === spotId) : logs;
}

function getLatestCondition_() {
  const rows = getRows_(SHEETS.conditions);
  return rows[rows.length - 1] || {
    water_temp: 24.5,
    temp_trend: -0.3,
    tide: 'moving',
    moon: 'dark',
    wave_height: 0.8,
    swell_direction: 'SW',
    wind_direction: 'N',
    wind_speed: 4,
    thunder_risk: false,
    solo_night: true,
    route_risk: false,
    no_life_jacket: false,
  };
}

function scoreAll_(condition) {
  const spots = getSpots();
  const logs = getRows_(SHEETS.logs);
  return spots
    .map((spot) => scoreSpot_(spot, normalizeCondition_(condition), logs))
    .sort((a, b) => b.score - a.score);
}

function createTimeline_(spotId, condition) {
  const spot = getSpotById(spotId);
  const result = scoreSpot_(spot, normalizeCondition_(condition), getRows_(SHEETS.logs));
  const slots = [
    ['19:00', -16, 'まだ明るい。下見と立ち位置確認'],
    ['20:00', -4, '潮が効き始めるなら候補'],
    ['21:00', 8, '本命筋'],
    ['22:00', 12, '勝負時間'],
    ['23:00', 2, '継続可'],
    ['0:00', -14, '潮止まり気味なら撤退判断'],
  ];
  return slots.map(([time, delta, comment]) => ({
    time,
    score: result.judge === '出撃不可' ? 0 : clamp_(result.score + delta),
    comment: result.judge === '出撃不可' ? '安全NGのため見送り' : comment,
  }));
}

function scoreSpot_(spot, condition, logs) {
  if (!spot) throw new Error('spot not found');
  const water = scoreWaterTemp_(condition.waterTemp, condition.tempTrend);
  const tide = scoreTide_(condition.tide, spot);
  const sea = scoreSea_(condition, spot);
  const moon = scoreMoon_(condition.moon, spot);
  const spotScore = clamp_(Number(spot.shibudai_score || 3) * 18 + Number(spot.night_safety || 3) * 2 - Number(spot.difficulty || 3) * 2);
  const past = scorePastLogs_(logs, spot.spot_id);
  const safety = safetyGate_(condition, spot);
  const confidencePenalty = logs.some((log) => log.spot_id === spot.spot_id) ? 0 : 4;
  const raw = water * 0.2 + tide * 0.2 + sea * 0.2 + moon * 0.1 + spotScore * 0.15 + past * 0.15 - safety.penalty - confidencePenalty;
  const score = safety.blocked ? 0 : clamp_(raw);
  const judge = judgeScore_(score, safety.blocked);
  return {
    spot_id: spot.spot_id,
    name: spot.name,
    area: spot.area,
    type: spot.type,
    access_min: spot.access_min,
    difficulty: spot.difficulty,
    night_safety: spot.night_safety,
    shibudai_score: spot.shibudai_score,
    madai_score: spot.madai_score,
    shimaaji_score: spot.shimaaji_score,
    recommended_method: spot.recommended_method,
    notes: spot.notes,
    base_area: spot.base_area,
    latitude: spot.latitude,
    longitude: spot.longitude,
    coord_accuracy: spot.coord_accuracy,
    coordinate_note: spot.coordinate_note,
    score,
    judge,
    best_window: bestWindow_(score, safety.blocked),
    parts: { water, tide, sea, moon, spot: spotScore, past, dangerPenalty: safety.penalty, confidencePenalty },
    reasons: safety.reasons,
  };
}

function normalizeSpot_(row) {
  return {
    spot_id: String(row.spot_id || ''),
    name: String(row.name || ''),
    area: String(row.area || ''),
    type: String(row.type || ''),
    access_min: String(row.access_min || ''),
    difficulty: Number(row.difficulty || 3),
    night_safety: Number(row.night_safety || 3),
    shibudai_score: Number(row.shibudai_score || 3),
    madai_score: Number(row.madai_score || 0),
    shimaaji_score: Number(row.shimaaji_score || 0),
    recommended_method: String(row.recommended_method || ''),
    notes: String(row.notes || ''),
    base_area: String(row.base_area || baseAreaFor_(row.area) || ''),
    latitude: optionalNumber_(row.latitude),
    longitude: optionalNumber_(row.longitude),
    coord_accuracy: String(row.coord_accuracy || ''),
    coordinate_note: String(row.coordinate_note || ''),
    ng_swell_direction: String(row.ng_swell_direction || ''),
    danger_tide_level: String(row.danger_tide_level || ''),
  };
}

function normalizeCondition_(row) {
  return {
    waterTemp: Number(row.waterTemp || row.water_temp || 24.5),
    tempTrend: Number(row.tempTrend || row.temp_trend || -0.3),
    tide: row.tide || 'moving',
    moon: row.moon || 'dark',
    waveHeight: Number(row.waveHeight || row.wave_height || 0.8),
    swellDirection: row.swellDirection || row.swell_direction || 'SW',
    windDirection: row.windDirection || row.wind_direction || 'N',
    windSpeed: Number(row.windSpeed || row.wind_speed || 4),
    thunderRisk: toBool_(row.thunderRisk || row.thunder_risk),
    soloNight: toBool_(row.soloNight || row.solo_night),
    routeRisk: toBool_(row.routeRisk || row.route_risk),
    noLifeJacket: toBool_(row.noLifeJacket || row.no_life_jacket),
  };
}

function safetyGate_(condition, spot) {
  const reasons = [];
  const ngDirections = String(spot.ng_swell_direction || '').split(',').map((item) => item.trim());
  let penalty = 0;
  let blocked = false;
  if (Number(spot.night_safety) <= 1) {
    blocked = true;
    reasons.push('夜釣り非推奨。釣り場マスターの安全度が低い。');
  } else if (Number(spot.night_safety) === 2) {
    penalty += 16;
    reasons.push('夜釣り注意。明るいうちの下見と撤退ライン確認が必須。');
  }
  if (Number(spot.difficulty) >= 5) {
    penalty += 12;
    reasons.push('難度5の上級者向け。単独夜釣りは避ける。');
  }
  if (condition.noLifeJacket) {
    blocked = true;
    reasons.push('装備不足。ライフジャケットと磯靴なしは出撃不可。');
  }
  if (condition.thunderRisk) {
    blocked = true;
    reasons.push('雷リスクあり。スコアに関係なく出撃不可。');
  }
  if (condition.waveHeight >= 1.7) {
    blocked = true;
    reasons.push('波高が危険域。低い磯や外向き堤防は除外。');
  }
  if (ngDirections.includes(condition.swellDirection) && condition.waveHeight >= 1.2) {
    blocked = true;
    reasons.push(condition.swellDirection + 'うねりがこの釣り場のNG波向き。');
  }
  if (condition.windSpeed >= 12) {
    blocked = true;
    reasons.push('風速が強すぎる。夜磯では操作性と撤退判断が落ちる。');
  }
  if (condition.routeRisk) penalty += 18;
  if (condition.soloNight && Number(spot.difficulty) >= 4) penalty += 12;
  return { blocked, penalty, reasons };
}

function scoreWaterTemp_(temp, trend) {
  let score = 50;
  if (temp >= 25) score += 25;
  else if (temp >= 23) score += 20;
  else if (temp >= 21) score += 10;
  else score -= 10;
  if (trend >= -0.5 && trend <= 0.8) score += 15;
  if (trend < -1.0) score -= 25;
  if (trend > 1.5) score += 5;
  return clamp_(score);
}

function scoreTide_(tide, spot) {
  let score = 50;
  if (tide === 'moving') score += 25;
  if (tide === 'start') score += 22;
  if (tide === 'fast') score -= 8;
  if (tide === 'slack') score -= 18;
  return clamp_(score);
}

function scoreSea_(condition, spot) {
  let score = 65;
  const ngDirections = String(spot.ng_swell_direction || '').split(',').map((item) => item.trim());
  if (condition.waveHeight <= 0.8) score += 18;
  else if (condition.waveHeight <= 1.2) score += 6;
  else if (condition.waveHeight <= 1.6) score -= 12;
  else score -= 40;
  if (ngDirections.includes(condition.swellDirection)) score -= condition.waveHeight >= 1.0 ? 35 : 14;
  if (condition.windSpeed <= 5) score += 10;
  else if (condition.windSpeed <= 9) score -= 5;
  else score -= 28;
  return clamp_(score);
}

function scoreMoon_(moon, spot) {
  let score = 55;
  if (moon === 'dark') score += 28;
  if (moon === 'low') score += 20;
  if (moon === 'cloud') score += 16;
  if (moon === 'bright') score -= 12;
  return clamp_(score);
}

function scorePastLogs_(logs, spotId) {
  const targetLogs = logs.filter((log) => log.spot_id === spotId);
  if (targetLogs.length === 0) return 45;
  const catchBonus = targetLogs.filter((log) => /シブダイ|フエダイ/.test(log.catch_result || '')).length * 12;
  const dangerPenalty = targetLogs.filter((log) => log.danger_note).length * 6;
  return clamp_(45 + catchBonus - dangerPenalty);
}

function judgeScore_(score, blocked) {
  if (blocked) return '出撃不可';
  if (score >= 80) return '本命日';
  if (score >= 65) return '出撃候補';
  if (score >= 50) return '条件付き';
  if (score >= 35) return '厳しい';
  return '見送り';
}

function bestWindow_(score, blocked) {
  if (blocked) return '見送り';
  if (score >= 80) return '21:00〜23:00';
  if (score >= 65) return '20:00〜22:00';
  if (score >= 50) return '22:00〜0:00';
  return '下見向き';
}

function getRows_(sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}

function getRowsSafe_(sheetName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 1 || sheet.getLastColumn() < 1) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  if (!headers || headers.length === 0) return [];
  return values
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index]])));
}

function appendRow_(sheetName, object) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map((header) => object[header] || '');
  sheet.appendRow(row);
  return object;
}

function jsonPayload_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}

function jsonOk(data) {
  return jsonPayload_({ ok: true, data, error: null });
}

function jsonError_(message, extra) {
  return jsonPayload_({ ok: false, data: null, error: message, ...(extra || {}) });
}

function clamp_(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toBool_(value) {
  return value === true || value === 'TRUE' || value === 'true' || value === 1 || value === '1';
}

function optionalNumber_(value) {
  if (value === '' || value === null || value === undefined) return '';
  const number = Number(value);
  return isFinite(number) ? number : '';
}

function baseAreaFor_(area) {
  return AREA_BASE_AREA_MAP[String(area || '')] || String(area || '');
}

function testGetLatestCondition() {
  const condition = getLatestCondition_();
  Logger.log(JSON.stringify(condition, null, 2));
  return condition;
}

function testGetSpots() {
  const spots = getSpots();
  Logger.log(JSON.stringify(spots.slice(0, 3), null, 2));
  return spots;
}

function testScoreAll() {
  const results = scoreAll_(getLatestCondition_());
  Logger.log(JSON.stringify(results, null, 2));
  return results;
}

function testForecast() {
  const text = forecastResponse_(
    Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd'),
    '田牛'
  ).getContent();
  Logger.log(text);
  return JSON.parse(text);
}

function testGoldenTime() {
  const text = goldenTimeResponse_(
    '74_motone',
    Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd')
  ).getContent();
  Logger.log(text);
  return JSON.parse(text);
}

function testSetupSpotCoordinates() {
  return setupSpotCoordinates();
}

function testSetupPortsideSheets() {
  return setupPortsideSheets();
}

function testCatchSummary() {
  const result = catchSummary_();
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function testCatchBySpot() {
  const result = catchBySpot_('74_motone');
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function testShibudaiHistory() {
  const result = shibudaiHistory_();
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
