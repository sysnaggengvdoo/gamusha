const SHEETS = {
  spots: 'spots',
  logs: 'logs',
  conditions: 'conditions',
  scoreResults: 'score_results',
  settings: 'settings',
};

const BASE_AREAS = {
  '田牛': { latitude: 34.654, longitude: 138.917 },
  '石廊崎': { latitude: 34.604, longitude: 138.844 },
  '中木吉田': { latitude: 34.628, longitude: 138.798 },
  '雲見松崎': { latitude: 34.724, longitude: 138.742 },
  '仁科田子': { latitude: 34.802, longitude: 138.760 },
};

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'getSpots') return jsonOk(getSpots());
    if (action === 'getSpot') return jsonOk(getSpotById(e.parameter.spot_id));
    if (action === 'getLogs') return jsonOk(getLogs_(e.parameter.spot_id));
    if (action === 'scoreAll') return jsonOk(scoreAll_(getLatestCondition_()));
    if (action === 'timeline') return jsonOk(createTimeline_(e.parameter.spot_id, getLatestCondition_()));
    if (action === 'forecast') return forecastResponse_(e.parameter.date, e.parameter.area);
    return jsonError_('Unknown action');
  } catch (error) {
    return jsonError_(String(error));
  }
}

function getSpots() {
  return getRows_(SHEETS.spots).map(normalizeSpot_);
}

function getSpotById(spot_id) {
  return getSpots().find((spot) => spot.spot_id === spot_id) || null;
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.action === 'saveLog') return jsonOk(appendRow_(SHEETS.logs, body.log));
    if (body.action === 'saveCondition') return jsonOk(appendRow_(SHEETS.conditions, body.condition));
    if (body.action === 'scoreAll') return jsonOk(scoreAll_(body.condition));
    return jsonError_('Unknown action');
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

function fetchWeatherForecast_(point, date) {
  const params = {
    latitude: point.latitude,
    longitude: point.longitude,
    timezone: 'Asia/Tokyo',
    start_date: date,
    end_date: date,
    hourly: 'weather_code,wind_speed_10m,wind_direction_10m',
    daily: 'weather_code,wind_speed_10m_max,wind_direction_10m_dominant',
    wind_speed_unit: 'ms',
  };
  return fetchJson_('https://api.open-meteo.com/v1/forecast', params);
}

function fetchMarineForecast_(point, date) {
  const params = {
    latitude: point.latitude,
    longitude: point.longitude,
    timezone: 'Asia/Tokyo',
    start_date: date,
    end_date: date,
    hourly: 'wave_height,swell_wave_height,swell_wave_direction,sea_surface_temperature,sea_level_height_msl',
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
    base_area: String(row.base_area || ''),
    latitude: Number(row.latitude || 0),
    longitude: Number(row.longitude || 0),
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

function appendRow_(sheetName, object) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map((header) => object[header] || '');
  sheet.appendRow(row);
  return object;
}

function jsonOk(data) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data, error: null })).setMimeType(ContentService.MimeType.JSON);
}

function jsonError_(message) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, data: null, error: message })).setMimeType(ContentService.MimeType.JSON);
}

function clamp_(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toBool_(value) {
  return value === true || value === 'TRUE' || value === 'true' || value === 1 || value === '1';
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
