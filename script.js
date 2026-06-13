const STORAGE_KEY = "shibudai_logs_v1";
const GAS_API_URL = globalThis.SHIBUDAI_GAS_API_URL || "";

const sampleSpots = [
  { spot_id: "62_takanba", name: "高ん場", area: "南伊豆・外浦須崎", type: "地磯", access_min: "15-20", difficulty: 2, night_safety: 3, shibudai_score: 3, madai_score: 3, shimaaji_score: 2, recommended_method: "夜スルスル・夜カゴ", notes: "西風に強い万能磯。魚種多く調査価値あり。夜は下見必須。" },
  { spot_id: "65_kuroshima_yoko", name: "黒島横の磯", area: "南伊豆・須崎", type: "地磯", access_min: "3", difficulty: 1, night_safety: 4, shibudai_score: 2, madai_score: 2, shimaaji_score: 1, recommended_method: "フカセ・エギング・軽め夜釣り", notes: "アクセス良好な保険候補。シブダイ本命より調査・練習向き。" },
  { spot_id: "66_sakiyama_gakeshita", name: "崎山 崖下", area: "南伊豆・須崎", type: "地磯", access_min: "25-30", difficulty: 5, night_safety: 1, shibudai_score: 4, madai_score: 2, shimaaji_score: 2, recommended_method: "日中上級者向け", notes: "地形は魅力だが入磯危険度が高すぎる。夜釣り・単独は非推奨。" },
  { spot_id: "67_akane", name: "赤根", area: "下田田牛・下田湾口", type: "地磯", access_min: "25-35", difficulty: 4, night_safety: 2, shibudai_score: 4, madai_score: 3, shimaaji_score: 2, recommended_method: "太仕掛けスルスル・夜カゴ", notes: "魚種豊富な荒根系。シブダイ調査価値高いが夜の入釣は慎重に。" },
  { spot_id: "69_akasaki", name: "赤崎", area: "下田田牛・下田湾口", type: "地磯", access_min: "15-20", difficulty: 3, night_safety: 3, shibudai_score: 3, madai_score: 3, shimaaji_score: 2, recommended_method: "夜スルスル・夜カゴ", notes: "湾口の大型地磯。バランス型で夜調査候補。" },
  { spot_id: "71_ganjima", name: "雁島", area: "下田田牛・和歌ノ浦", type: "小磯", access_min: "2-3", difficulty: 1, night_safety: 4, shibudai_score: 1, madai_score: 1, shimaaji_score: 1, recommended_method: "フカセ・エギング", notes: "安全寄りの小場所。シブダイ本命ではなく保険候補。" },
  { spot_id: "72_akanejima", name: "赤根島", area: "下田田牛・下田湾口", type: "地磯", access_min: "10-15", difficulty: 3, night_safety: 3, shibudai_score: 3, madai_score: 3, shimaaji_score: 2, recommended_method: "夜スルスル・夜カゴ", notes: "湾口絡みで魚種多い。潮が効く夜に調査価値あり。" },
  { spot_id: "73_noroshizaki", name: "狼煙崎", area: "下田田牛", type: "地磯", access_min: "25-40", difficulty: 4, night_safety: 1, shibudai_score: 4, madai_score: 2, shimaaji_score: 2, recommended_method: "日中下見・上級者向け", notes: "地形は魅力だが夜釣り安全性が低い。単独夜釣り非推奨。" },
  { spot_id: "nagaiso", name: "長磯周辺", area: "下田田牛", type: "低磯", access_min: "不明", difficulty: 2, night_safety: 2, shibudai_score: 2, madai_score: 2, shimaaji_score: 1, recommended_method: "軽め夜釣り・調査", notes: "低磯で波を被りやすい。凪限定のサブ候補。" },
  { spot_id: "74_motone", name: "元根", area: "下田田牛", type: "地磯", access_min: "8-10", difficulty: 3, night_safety: 3, shibudai_score: 4, madai_score: 4, shimaaji_score: 2, recommended_method: "太仕掛けスルスル本命", notes: "田牛エリアの現実的本命候補。根際・水道・砂地との境目が狙い。" },
  { spot_id: "75_kagurane", name: "カグラ根", area: "下田田牛", type: "地磯", access_min: "5-7", difficulty: 2, night_safety: 4, shibudai_score: 2, madai_score: 2, shimaaji_score: 1, recommended_method: "短時間調査・保険", notes: "砂地とワンド要素が強い。シブダイ本命よりサブ候補。" },
  { spot_id: "76_ongoku", name: "遠国", area: "下田田牛", type: "地磯", access_min: "15-20", difficulty: 4, night_safety: 2, shibudai_score: 5, madai_score: 3, shimaaji_score: 2, recommended_method: "太仕掛けスルスル本命", notes: "荒根・水道・サラシあり。安全条件つき本命。" },
  { spot_id: "77_aragami_taraisaki", name: "荒神 タライ岬", area: "下田田牛", type: "地磯", access_min: "25-30", difficulty: 4, night_safety: 2, shibudai_score: 5, madai_score: 3, shimaaji_score: 2, recommended_method: "太仕掛けスルスル本命", notes: "田牛代表級の大場所。荒根・深場・潮通しがありシブダイ本命候補。" },
  { spot_id: "78_takaiso_takamizaki", name: "高磯 高見崎", area: "小稲石廊崎", type: "地磯", access_min: "10-20", difficulty: 3, night_safety: 2, shibudai_score: 3, madai_score: 2, shimaaji_score: 2, recommended_method: "夜スルスル調査", notes: "古いルートを通る荒磯。石物・ヒラスズキ寄りで調査候補。" },
  { spot_id: "79_umanose", name: "馬の背", area: "小稲石廊崎", type: "地磯", access_min: "25-30", difficulty: 5, night_safety: 1, shibudai_score: 5, madai_score: 3, shimaaji_score: 2, recommended_method: "日中下見・上級者向け", notes: "魚の匂いは強いが夜は危険。安全ゲートで弾く候補。" },
  { spot_id: "80_suiheiba", name: "水平場 裏水平場", area: "小稲石廊崎", type: "地磯", access_min: "25-30", difficulty: 3, night_safety: 3, shibudai_score: 4, madai_score: 3, shimaaji_score: 2, recommended_method: "太仕掛けスルスル・夜カゴ", notes: "石廊崎では現実的な本命候補。根際・水道・サラシ切れ目狙い。" },
  { spot_id: "81_yunohana", name: "湯の花", area: "小稲石廊崎", type: "地磯", access_min: "25-30", difficulty: 3, night_safety: 2, shibudai_score: 3, madai_score: 2, shimaaji_score: 2, recommended_method: "夜スルスル調査", notes: "人気磯。サラシと根周り条件で調査候補。" },
  { spot_id: "82_naraiomote", name: "ナライ表", area: "小稲石廊崎", type: "地磯", access_min: "25-30", difficulty: 3, night_safety: 3, shibudai_score: 4, madai_score: 3, shimaaji_score: 2, recommended_method: "太仕掛けスルスル・夜カゴ", notes: "収容力と魚影のバランス良。シブダイ本命候補に入る。" },
  { spot_id: "83_tsunohonze", name: "ツノホンゼ", area: "小稲石廊崎", type: "地磯", access_min: "20-25", difficulty: 4, night_safety: 2, shibudai_score: 4, madai_score: 3, shimaaji_score: 2, recommended_method: "太仕掛けスルスル本命", notes: "ほぼ沖磯感のある一級地磯。夜は下見必須。" },
  { spot_id: "86_yoshida_ozone", name: "吉田大根", area: "中木吉田", type: "地磯", access_min: "25-30", difficulty: 4, night_safety: 2, shibudai_score: 5, madai_score: 3, shimaaji_score: 3, recommended_method: "太仕掛けスルスル本命", notes: "潮通し抜群の大場所。シブダイ超本命級だが安全条件つき。" },
  { spot_id: "90_kokeshijima_ura", name: "こけし島裏の磯", area: "妻良伊浜", type: "地磯", access_min: "30-35", difficulty: 3, night_safety: 3, shibudai_score: 3, madai_score: 2, shimaaji_score: 1, recommended_method: "夜スルスル調査", notes: "湾内外の境目。潮が通れば石物・アオリ絡みで調査価値あり。" },
  { spot_id: "94_zappun", name: "ザップン", area: "雲見松崎", type: "地磯", access_min: "30-40", difficulty: 4, night_safety: 1, shibudai_score: 2, madai_score: 2, shimaaji_score: 1, recommended_method: "日中上物向き", notes: "メジナ・ヒラスズキ寄り。シブダイ本命ではない。" },
  { spot_id: "95_okatonbi", name: "陸トンビ", area: "雲見松崎", type: "地磯", access_min: "10-12", difficulty: 2, night_safety: 3, shibudai_score: 3, madai_score: 2, shimaaji_score: 2, recommended_method: "夜スルスル調査", notes: "潮通しよく石物・イサキ絡み。西伊豆側の調査候補。" },
  { spot_id: "96_kurosaki", name: "黒崎", area: "雲見松崎", type: "地磯", access_min: "15-20", difficulty: 2, night_safety: 3, shibudai_score: 3, madai_score: 2, shimaaji_score: 2, recommended_method: "夜スルスル調査", notes: "西伊豆代表級の一級地磯。夜イカタン調査あり。" },
  { spot_id: "97_hagiyazaki", name: "萩谷崎", area: "雲見松崎", type: "地磯", access_min: "15-20", difficulty: 2, night_safety: 3, shibudai_score: 2, madai_score: 2, shimaaji_score: 1, recommended_method: "サブ調査", notes: "ゴロタ・砂地・ワンドが絡む多魚種場。シブダイ優先度は低め。" },
  { spot_id: "98_murozaki", name: "室崎", area: "雲見松崎", type: "地磯", access_min: "20-30", difficulty: 4, night_safety: 2, shibudai_score: 4, madai_score: 3, shimaaji_score: 2, recommended_method: "夜スルスル調査", notes: "魚影は濃いが険しさあり。西伊豆側では面白い候補。" },
  { spot_id: "99_ajirozaki", name: "安城岬", area: "仁科田子", type: "地磯", access_min: "20-25", difficulty: 3, night_safety: 3, shibudai_score: 2, madai_score: 2, shimaaji_score: 1, recommended_method: "サブ調査", notes: "ゴロタ・砂浜・磯・ワンドが揃う万能場。シブダイ本命ではない。" },
  { spot_id: "100_onbi", name: "オンビ", area: "仁科田子", type: "地磯", access_min: "6", difficulty: 2, night_safety: 4, shibudai_score: 2, madai_score: 2, shimaaji_score: 1, recommended_method: "夜調査・ぶっ込み", notes: "入りやすくハマフエフキも絡む。安全寄りの夜調査候補。" },
];

const areaBaseAreaMap = {
  "南伊豆・外浦須崎": "外浦須崎",
  "南伊豆・須崎": "外浦須崎",
  "下田田牛・下田湾口": "下田田牛",
  "下田田牛・和歌ノ浦": "下田田牛",
  "下田田牛": "下田田牛",
  "小稲石廊崎": "小稲石廊崎",
  "中木吉田": "中木吉田",
  "妻良伊浜": "妻良伊浜",
  "雲見松崎": "雲見松崎",
  "仁科田子": "仁科田子",
};

const spotCoordinates = {
  "62_takanba": { latitude: 34.66595429372546, longitude: 138.9873055540375, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "65_kuroshima_yoko": { latitude: 34.65426782417559, longitude: 138.97066067517838, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "66_sakiyama_gakeshita": { latitude: 34.65377453625561, longitude: 138.97392028652447, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "67_akane": { latitude: 34.65304613324002, longitude: 138.9768772289867, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "69_akasaki": { latitude: 34.6524524078731, longitude: 138.95424055676256, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "71_ganjima": { latitude: 34.66737458063759, longitude: 138.94924154399172, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "72_akanejima": { latitude: 34.66261331702966, longitude: 138.9470681525203, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "73_noroshizaki": { latitude: 34.6621708470976, longitude: 138.94146867988673, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  nagaiso: { latitude: 34.64485409927357, longitude: 138.91799374628604, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "74_motone": { latitude: 34.64252154653855, longitude: 138.91769486847107, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "75_kagurane": { latitude: 34.64158415200717, longitude: 138.9163332129774, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "76_ongoku": { latitude: 34.631407151077035, longitude: 138.90766167981823, coord_accuracy: "exact", coordinate_note: "ユーザー再確認座標" },
  "77_aragami_taraisaki": { latitude: 34.62856742719255, longitude: 138.90017626229135, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "78_takaiso_takamizaki": { latitude: 34.62450084764903, longitude: 138.88976346852775, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "79_umanose": { latitude: 34.601874894939705, longitude: 138.84610014891663, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "80_suiheiba": { latitude: 34.601691921431076, longitude: 138.84533396162823, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "81_yunohana": { latitude: 34.60150246320644, longitude: 138.84229939001986, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "82_naraiomote": { latitude: 34.60183364764506, longitude: 138.84131494194511, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "83_tsunohonze": { latitude: 34.603712922850185, longitude: 138.83809507432585, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "86_yoshida_ozone": { latitude: 34.636902553185855, longitude: 138.78949726418423, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "90_kokeshijima_ura": { latitude: 34.666680262689525, longitude: 138.78363252083324, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "94_zappun": { latitude: 34.71512159674666, longitude: 138.74220405903077, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "95_okatonbi": { latitude: 34.72841388427518, longitude: 138.74172547582492, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "96_kurosaki": { latitude: 34.73621197019109, longitude: 138.7498091400067, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "97_hagiyazaki": { latitude: 34.745850774653306, longitude: 138.75487720942178, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "98_murozaki": { latitude: 34.752510999095485, longitude: 138.76490781932355, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "99_ajirozaki": { latitude: 34.771779995331265, longitude: 138.7623452687985, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
  "100_onbi": { latitude: 34.77472702255147, longitude: 138.76746673650615, coord_accuracy: "exact", coordinate_note: "ユーザー確認座標" },
};

sampleSpots.forEach((spot) => {
  Object.assign(spot, spotCoordinates[spot.spot_id] || {});
  spot.base_area = spot.base_area || areaBaseAreaMap[spot.area] || spot.area;
});

const defaultConditions = {
  waterTemp: 24.5,
  tempTrend: -0.3,
  tide: "moving",
  moon: "dark",
  waveHeight: 0.8,
  swellDirection: "SW",
  windDirection: "N",
  windSpeed: 4,
  thunderRisk: false,
  soloNight: true,
  routeRisk: false,
  noLifeJacket: false,
};

const baseAreaOptions = ["田牛", "石廊崎", "中木吉田", "雲見松崎", "仁科田子"];

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function scoreWaterTemp(temp, trend) {
  let score = 50;
  if (temp >= 25) score += 25;
  else if (temp >= 23) score += 20;
  else if (temp >= 21) score += 10;
  else score -= 10;

  if (trend >= -0.5 && trend <= 0.8) score += 15;
  if (trend < -1.0) score -= 25;
  if (trend > 1.5) score += 5;
  return clamp(score);
}

function scoreTide(tide, spot) {
  let score = 50;
  if (tide === "moving") score += 25;
  if (tide === "start") score += 22;
  if (tide === "fast") score -= 8;
  if (tide === "slack") score -= 18;
  if ((spot.good_tide || "").includes("上げ") && ["moving", "start"].includes(tide)) score += 8;
  if ((spot.good_tide || "").includes("下げ") && ["moving", "start"].includes(tide)) score += 5;
  return clamp(score);
}

function scoreMoon(moon, spot) {
  let score = 55;
  if (moon === "dark") score += 28;
  if (moon === "low") score += 20;
  if (moon === "cloud") score += 16;
  if (moon === "bright") score -= spot.bottom_type === "荒根" ? 4 : 15;
  return clamp(score);
}

function scoreSea(conditions, spot) {
  let score = 65;
  const ngDirections = String(spot.ng_wave_direction || "").split(",").map((item) => item.trim());
  if (conditions.waveHeight <= 0.8) score += 18;
  else if (conditions.waveHeight <= 1.2) score += 6;
  else if (conditions.waveHeight <= 1.6) score -= 12;
  else score -= 40;

  if (ngDirections.includes(conditions.swellDirection)) score -= conditions.waveHeight >= 1.0 ? 35 : 14;
  if (conditions.windSpeed <= 5) score += 10;
  else if (conditions.windSpeed <= 9) score -= 5;
  else score -= 28;

  if (conditions.windDirection === spot.direction) score -= 8;
  return clamp(score);
}

function scoreSpotPotential(spot) {
  const potential = Number(spot.shibudai_score || spot.shibudai_potential || 3) * 18;
  const landing = (6 - Number(spot.difficulty || spot.landing_difficulty || 3)) * 3;
  const safety = Number(spot.night_safety || 3) * 2;
  const bottom = spot.bottom_type === "荒根" ? 8 : spot.bottom_type === "ゴロタ" ? 5 : 2;
  return clamp(potential + landing + safety + bottom);
}

function scorePastLogs(logs, spotId) {
  const targetLogs = logs.filter((log) => log.spot_id === spotId);
  if (targetLogs.length === 0) return 45;
  const catchBonus = targetLogs.filter((log) => /シブダイ|フエダイ/.test(log.catch_result || "")).length * 12;
  const dangerPenalty = targetLogs.filter((log) => log.danger_note).length * 6;
  const lostBonus = targetLogs.reduce((sum, log) => sum + Number(log.lost_fish || 0), 0) * 4;
  return clamp(45 + catchBonus + lostBonus - dangerPenalty);
}

function safetyGate(conditions, spot) {
  const reasons = [];
  const ngDirections = String(spot.ng_wave_direction || "").split(",").map((item) => item.trim());
  let penalty = 0;
  let blocked = false;

  if (Number(spot.night_safety) <= 1) {
    blocked = true;
    reasons.push("夜釣り非推奨。釣り場マスターの安全度が低い。");
  } else if (Number(spot.night_safety) === 2) {
    penalty += 16;
    reasons.push("夜釣り注意。明るいうちの下見と撤退ライン確認が必須。");
  }
  if (Number(spot.difficulty) >= 5) {
    penalty += 12;
    reasons.push("難度5の上級者向け。単独夜釣りは避ける。");
  }
  if (conditions.noLifeJacket) {
    blocked = true;
    reasons.push("装備不足。ライフジャケットと磯靴なしは出撃不可。");
  }
  if (conditions.thunderRisk) {
    blocked = true;
    reasons.push("雷リスクあり。スコアに関係なく出撃不可。");
  }
  if (conditions.waveHeight >= 1.7) {
    blocked = true;
    reasons.push("波高が危険域。低い磯や外向き堤防は除外。");
  }
  if (ngDirections.includes(conditions.swellDirection) && conditions.waveHeight >= 1.2) {
    blocked = true;
    reasons.push(`${conditions.swellDirection}うねりがこの釣り場のNG波向き。`);
  }
  if (conditions.windSpeed >= 12) {
    blocked = true;
    reasons.push("風速が強すぎる。夜磯では操作性と撤退判断が落ちる。");
  }
  if (conditions.routeRisk) {
    penalty += 18;
    reasons.push("満潮で帰路が危険。入るなら撤退時刻を先に決める。");
  }
  if (conditions.soloNight && Number(spot.difficulty || spot.landing_difficulty || 3) >= 4) {
    penalty += 12;
    reasons.push("単独夜磯かつランディング難度高め。無理な取り込みは不可。");
  }
  if (Number(spot.difficulty || spot.landing_difficulty || 3) >= 5) {
    penalty += 8;
    reasons.push("ランディング難度が最大。掛けてからの安全な立ち位置が必要。");
  }
  return { blocked, penalty, reasons };
}

function judgeScore(score, blocked) {
  if (blocked) return "出撃不可";
  if (score >= 80) return "本命日";
  if (score >= 65) return "出撃候補";
  if (score >= 50) return "条件付き";
  if (score >= 35) return "厳しい";
  return "見送り";
}

function bestWindowFromScore(score, blocked) {
  if (blocked) return "見送り";
  if (score >= 80) return "21:00〜23:00";
  if (score >= 65) return "20:00〜22:00";
  if (score >= 50) return "22:00〜0:00";
  return "下見向き";
}

function reasonItem(label, text, value = "") {
  return { label, text, value };
}

function buildReasonGroups(parts, safety, spot, conditions, goldenTime) {
  const positives = [];
  const negatives = [];
  const safetyReasons = safety.reasons.map((text) => reasonItem("安全", text, safety.blocked ? "停止" : "注意"));
  const bestGolden = bestGoldenTime(goldenTime);

  if (parts.water >= 75) positives.push(reasonItem("水温", `水温 ${conditions.waterTemp}℃ はシブダイ狙いで好材料。`, `+${Math.round(parts.water * 0.2)}`));
  else if (parts.water < 55) negatives.push(reasonItem("水温", `水温条件が弱く、活性面の期待値を下げます。`, `${Math.round(parts.water * 0.2)}`));

  if (parts.tide >= 70) positives.push(reasonItem("潮", `潮が動く前提で、餌が効きやすい時間帯です。`, `+${Math.round(parts.tide * 0.2)}`));
  else if (parts.tide < 45) negatives.push(reasonItem("潮", `潮止まり寄りで、勝負時間としては弱めです。`, `${Math.round(parts.tide * 0.2)}`));

  if (parts.sea >= 75) positives.push(reasonItem("風波", `波高 ${conditions.waveHeight}m、風速 ${conditions.windSpeed}m/s は操作しやすい範囲です。`, `+${Math.round(parts.sea * 0.2)}`));
  else if (parts.sea < 55) negatives.push(reasonItem("風波", `風波条件が悪く、仕掛け操作と足場安全に影響します。`, `${Math.round(parts.sea * 0.2)}`));

  if (parts.moon >= 75) positives.push(reasonItem("月", `月条件は暗さを作りやすく、夜の差し込みに期待できます。`, `+${Math.round(parts.moon * 0.1)}`));
  else if (parts.moon < 50) negatives.push(reasonItem("月", `月明かりが強めで、暗い溝や根の影を優先したい条件です。`, `${Math.round(parts.moon * 0.1)}`));

  if (Number(spot.shibudai_score || 0) >= 4) positives.push(reasonItem("釣り場", `シブダイ適性 ${spot.shibudai_score}/5。${spot.recommended_method} が合う候補です。`, `+${Math.round(parts.spot * 0.15)}`));
  else negatives.push(reasonItem("釣り場", `シブダイ適性 ${spot.shibudai_score}/5。今回は本命より調査寄りです。`, `${Math.round(parts.spot * 0.15)}`));

  if (parts.past > 45) positives.push(reasonItem("ログ", `過去ログに好材料があります。`, `+${Math.round(parts.past * 0.15)}`));
  else if (parts.confidencePenalty > 0) negatives.push(reasonItem("信頼度", `この釣り場の実釣ログが少ないため、信頼度を少し下げています。`, `-${parts.confidencePenalty}`));

  if (parts.dangerPenalty > 0) negatives.push(reasonItem("安全補正", `安全面の注意があり、総合点から減点しています。`, `-${parts.dangerPenalty}`));

  if (parts.goldenTimeBonus > 0 && bestGolden) {
    positives.push(reasonItem("GT", `${bestGolden.start}〜${bestGolden.end} は ${bestGolden.label}。潮・暗さ・月条件の重なりを加点しています。`, `+${parts.goldenTimeBonus}`));
  }

  if (safetyReasons.length === 0) {
    safetyReasons.push(reasonItem("安全", "安全ゲートは通過。現地で波周期、足場、退路を再確認。", "通過"));
  }

  return {
    positives,
    negatives,
    safety: safetyReasons,
  };
}

function createResult(spot, conditions, logs, goldenTime = null) {
  const water = scoreWaterTemp(conditions.waterTemp, conditions.tempTrend);
  const tide = scoreTide(conditions.tide, spot);
  const sea = scoreSea(conditions, spot);
  const moon = scoreMoon(conditions.moon, spot);
  const spotScore = scoreSpotPotential(spot);
  const past = scorePastLogs(logs, spot.spot_id);
  const safety = safetyGate(conditions, spot);
  const confidencePenalty = logs.some((log) => log.spot_id === spot.spot_id) ? 0 : 4;
  const gtBonus = goldenTimeBonus(goldenTime);

  const raw =
    water * 0.2 +
    tide * 0.2 +
    sea * 0.2 +
    moon * 0.1 +
    spotScore * 0.15 +
    past * 0.15 -
    safety.penalty -
    confidencePenalty +
    gtBonus;

  const score = safety.blocked ? 0 : clamp(raw);
  const judge = judgeScore(score, safety.blocked);
  const parts = { water, tide, sea, moon, spot: spotScore, past, dangerPenalty: safety.penalty, confidencePenalty, goldenTimeBonus: gtBonus };
  const reasonGroups = buildReasonGroups(parts, safety, spot, conditions, goldenTime);
  const reasons = [
    `水温 ${water}/100、潮 ${tide}/100、風波 ${sea}/100、月 ${moon}/100。`,
    `地形適性 ${spotScore}/100、過去ログ補正 ${past}/100。`,
    ...safety.reasons,
  ];

  if (!safety.blocked && safety.penalty === 0) {
    reasons.push("安全ゲートは通過。現地で波周期と退路を再確認。");
  }

  return {
    score,
    judge,
    safetyLabel: safetyLabel(spot, safety.blocked),
    bestWindow: bestWindowFromScore(score, safety.blocked),
    parts,
    reasons,
    reasonGroups,
    goldenTime,
  };
}

function safetyLabel(spot, blocked = false) {
  const safety = Number(spot.night_safety || 3);
  if (blocked || safety <= 1) return "夜釣り非推奨";
  if (safety === 2) return "夜釣り注意";
  if (safety === 3) return "要確認";
  return "安全寄り";
}

function createTimeline(baseScore, blocked) {
  const slots = [
    ["19:00", -16, "まだ明るい。下見と立ち位置確認"],
    ["20:00", -4, "潮が効き始めるなら候補"],
    ["21:00", 8, "本命筋"],
    ["22:00", 12, "勝負時間"],
    ["23:00", 2, "継続可"],
    ["0:00", -14, "潮止まり気味なら撤退判断"],
  ];
  return slots.map(([time, delta, comment]) => ({
    time,
    score: blocked ? 0 : clamp(baseScore + delta),
    comment: blocked ? "安全NGのため見送り" : comment,
  }));
}

function bestGoldenTime(goldenTime) {
  const windows = goldenTime?.golden_times || [];
  return windows.length ? [...windows].sort((a, b) => Number(b.score || 0) - Number(a.score || 0))[0] : null;
}

function goldenTimeBonus(goldenTime) {
  const best = bestGoldenTime(goldenTime);
  if (!best) return 0;
  return clamp((Number(best.score || 0) - 62) / 3, 0, 10);
}

function goldenTimeLabel(goldenTime) {
  const best = bestGoldenTime(goldenTime);
  return best ? `GT ${best.start}〜${best.end}` : "GT 推定中";
}

function createFallbackGoldenTime(spot, date, conditions) {
  const nightSafety = Number(spot.night_safety || 3);
  const difficulty = Number(spot.difficulty || 3);
  const shibudai = Number(spot.shibudai_score || 3);
  const seaPenalty = Math.max(0, Number(conditions.waveHeight || 0.8) - 1.0) * 18 + Math.max(0, Number(conditions.windSpeed || 4) - 7) * 3;
  const moonBonus = conditions.moon === "dark" ? 10 : conditions.moon === "low" ? 7 : conditions.moon === "cloud" ? 5 : -4;
  const safetyPenalty = nightSafety <= 1 ? 24 : nightSafety === 2 ? 10 : 0;
  const baseScore = clamp(58 + shibudai * 5 + moonBonus + nightSafety * 2 - difficulty * 2 - seaPenalty - safetyPenalty);
  const firstScore = clamp(baseScore + 8);
  const secondScore = clamp(baseScore - 2);

  return {
    spot_id: spot.spot_id,
    date,
    source: "local_estimate",
    notice: "GAS未取得時の簡易推定です。潮位・潮流は参考値として扱ってください。",
    astronomy: {
      sunset: "推定中",
      sunrise: "推定中",
      moon_age: "",
      moonrise: "",
      moonset: "",
    },
    golden_times: [
      {
        start: "20:30",
        end: "22:00",
        score: firstScore,
        label: firstScore >= 80 ? "本命集中" : "第一候補",
        reasons: ["日没後の暗い時間帯", "手入力の潮条件を優先", "波風の手入力条件を反映"],
      },
      {
        start: "02:00",
        end: "03:00",
        score: secondScore,
        label: secondScore >= 75 ? "継続価値あり" : "調査候補",
        reasons: ["深夜の暗さを評価", "朝まずめ前の差し込み候補"],
      },
    ],
    hourly: ["19:00", "20:00", "21:00", "22:00", "23:00", "00:00", "01:00", "02:00", "03:00", "04:00"].map((time, index) => ({
      time,
      golden_score: clamp(baseScore + (index >= 2 && index <= 3 ? 8 : index >= 7 && index <= 8 ? 4 : -6)),
      tide_movement_score: conditions.tide === "slack" ? 42 : conditions.tide === "fast" ? 64 : 74,
      tide_size_score: 60,
      current_score: 60,
      darkness_score: index >= 1 ? 82 : 55,
      moon_score: conditions.moon === "bright" ? 48 : 78,
      sun_score: index >= 1 && index <= 3 ? 78 : 55,
      sea_safety_score: scoreSea(conditions, spot),
    })),
  };
}

function createDateOptions() {
  const formatter = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", weekday: "short" });
  return Array.from({ length: 8 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const value = formatDateValue(date);
    const label = index === 0 ? `今日 ${formatter.format(date)}` : `${index}日後 ${formatter.format(date)}`;
    return { value, label };
  });
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function gasGet(action, params = {}) {
  if (!GAS_API_URL) return null;
  const url = new URL(GAS_API_URL);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  });
  const response = await fetch(url.toString());
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "GAS API error");
  return payload.data ?? payload;
}

async function gasPost(body) {
  if (!GAS_API_URL) return null;
  const response = await fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "GAS API error");
  return payload.data ?? payload;
}

const app = Vue.createApp({
  data() {
    const today = formatDateValue(new Date());
    return {
      nav: [
        { id: "spots", label: "一覧" },
        { id: "detail", label: "詳細" },
        { id: "timeline", label: "時合い" },
        { id: "log", label: "ログ" },
        { id: "design", label: "設計" },
      ],
      view: "spots",
      gasApiUrl: GAS_API_URL,
      apiStatus: GAS_API_URL ? "GAS APIへ接続準備中" : "ローカルサンプルDBで表示中",
      forecastStatus: "手入力条件で計算中",
      autoLoading: false,
      goldenLoading: false,
      goldenStatus: "GTは推定表示中",
      goldenTimesBySpot: {},
      selectedDate: today,
      dateOptions: createDateOptions(),
      baseArea: "田牛",
      baseAreas: baseAreaOptions,
      spotSort: "shibudai_score",
      spots: sampleSpots,
      selectedSpotId: sampleSpots[0].spot_id,
      conditions: { ...defaultConditions },
      logs: JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
      logForm: {
        log_id: "",
        date: today,
        spot_id: sampleSpots[0].spot_id,
        method: "太仕掛けスルスル夜フカセ",
        water_temp: 24.5,
        bite_time: "",
        catch_result: "",
        lost_fish: 0,
        utsubo_count: 0,
        snag_count: 0,
        danger_note: "",
        memo: "",
      },
    };
  },
  async mounted() {
    await this.loadFromGas();
    this.refreshLocalGoldenTimes();
  },
  watch: {
    selectedDate() {
      this.refreshLocalGoldenTimes();
    },
    conditions: {
      handler() {
        this.refreshLocalGoldenTimes();
      },
      deep: true,
    },
  },
  computed: {
    rankedSpots() {
      return [...this.spots].sort((a, b) => {
        if (this.spotSort === "night_safety") return Number(b.night_safety || 0) - Number(a.night_safety || 0);
        if (this.spotSort === "difficulty") return Number(a.difficulty || 0) - Number(b.difficulty || 0);
        if (this.spotSort === "score") return this.scoreSpot(b).score - this.scoreSpot(a).score;
        return Number(b.shibudai_score || 0) - Number(a.shibudai_score || 0) || Number(b.night_safety || 0) - Number(a.night_safety || 0);
      });
    },
    topSpot() {
      return this.rankedSpots[0];
    },
    topResult() {
      return this.scoreSpot(this.topSpot);
    },
    selectedSpot() {
      return this.spots.find((spot) => spot.spot_id === this.selectedSpotId) || this.spots[0];
    },
    selectedResult() {
      return this.scoreSpot(this.selectedSpot);
    },
    selectedGoldenTime() {
      return this.goldenTimeData(this.selectedSpot);
    },
    timeline() {
      return createTimeline(this.selectedResult.score, this.selectedResult.judge === "出撃不可");
    },
  },
  methods: {
    async loadFromGas() {
      if (!GAS_API_URL) return;
      try {
        const [spots, logs] = await Promise.all([gasGet("getSpots"), gasGet("getLogs")]);
        if (Array.isArray(spots) && spots.length > 0) {
          this.spots = spots;
          if (!this.spots.some((spot) => spot.spot_id === this.selectedSpotId)) {
            this.selectedSpotId = this.spots[0].spot_id;
            this.logForm.spot_id = this.spots[0].spot_id;
          }
        }
        if (Array.isArray(logs)) this.logs = logs;
        this.refreshLocalGoldenTimes();
        this.apiStatus = "GAS APIからスプレッドシートDBを読み込み済み";
      } catch (error) {
        this.apiStatus = `GAS API読み込み失敗。ローカルサンプルで表示中: ${error.message}`;
      }
    },
    async fetchAutoConditions() {
      const manualSafety = {
        soloNight: this.conditions.soloNight,
        noLifeJacket: this.conditions.noLifeJacket,
      };
      if (!GAS_API_URL) {
        this.forecastStatus = "GAS API URL未設定。手入力で調整してください。";
        return;
      }
      this.autoLoading = true;
      this.forecastStatus = `${this.baseArea} / ${this.selectedDate} の海況を取得中`;
      try {
        const forecast = await gasGet("forecast", { date: this.selectedDate, area: this.baseArea });
        const nextConditions = forecast.conditions || {};
        this.conditions = {
          ...this.conditions,
          ...nextConditions,
          ...manualSafety,
        };
        this.forecastStatus = `${forecast.area || this.baseArea} / ${forecast.date || this.selectedDate} の海況を反映しました。潮位系は参考値です。`;
        this.spotSort = "score";
        await this.fetchGoldenTimesForSpots();
      } catch (error) {
        this.forecastStatus = `海況取得に失敗しました: ${error.message}`;
      } finally {
        this.autoLoading = false;
      }
    },
    scoreSpot(spot) {
      return createResult(spot, this.conditions, this.logs, this.goldenTimeData(spot));
    },
    refreshLocalGoldenTimes() {
      const next = {};
      this.spots.forEach((spot) => {
        const cached = this.goldenTimesBySpot[spot.spot_id];
        next[spot.spot_id] = cached?.source === "gas" && cached.date === this.selectedDate ? cached : createFallbackGoldenTime(spot, this.selectedDate, this.conditions);
      });
      this.goldenTimesBySpot = next;
    },
    async fetchGoldenTimesForSpots() {
      if (!GAS_API_URL) {
        this.goldenStatus = "GTはローカル推定です";
        return;
      }
      this.goldenLoading = true;
      this.goldenStatus = `${this.selectedDate} のゴールデンタイムを取得中`;
      const targets = this.spots.filter((spot) => this.hasCoordinates(spot)).slice(0, 32);
      const results = await Promise.allSettled(
        targets.map((spot) => gasGet("goldenTime", { spot_id: spot.spot_id, date: this.selectedDate }))
      );
      const next = { ...this.goldenTimesBySpot };
      let okCount = 0;
      const errors = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value?.golden_times) {
          next[targets[index].spot_id] = { ...result.value, source: "gas" };
          okCount++;
        } else {
          const spotName = targets[index]?.name || targets[index]?.spot_id || "不明";
          const message = result.status === "rejected" ? result.reason?.message : "GAS応答にgolden_timesがありません";
          errors.push(`${spotName}: ${message || "不明なエラー"}`);
        }
      });
      this.goldenTimesBySpot = next;
      if (okCount > 0) {
        this.goldenStatus = errors.length > 0
          ? `${okCount}件のGTを反映済み。一部失敗: ${errors[0]}`
          : `${okCount}件のGTを反映済み（潮位・潮流は推定）`;
      } else {
        this.goldenStatus = `GT取得失敗: ${errors[0] || "詳細不明"}。ローカル推定を表示中`;
      }
      this.goldenLoading = false;
    },
    goldenTimeData(spot) {
      return this.goldenTimesBySpot[spot?.spot_id] || createFallbackGoldenTime(spot, this.selectedDate, this.conditions);
    },
    goldenTimeLabel(spot) {
      return goldenTimeLabel(this.goldenTimeData(spot));
    },
    judgeClass(judge) {
      return {
        "is-best": judge === "本命日",
        "is-candidate": judge === "出撃候補",
        "is-conditional": judge === "条件付き",
        "is-hard": judge === "厳しい" || judge === "見送り",
        "is-blocked": judge === "出撃不可",
      };
    },
    safetyLabel(spot) {
      return safetyLabel(spot, this.scoreSpot(spot).judge === "出撃不可");
    },
    safetyClass(spot) {
      const label = this.safetyLabel(spot);
      return {
        "is-blocked": label === "夜釣り非推奨",
        "is-conditional": label === "夜釣り注意",
        "is-candidate": label === "安全寄り",
        "is-hard": label === "要確認",
      };
    },
    hasCoordinates(spot) {
      const latitude = Number(spot?.latitude);
      const longitude = Number(spot?.longitude);
      return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude !== 0 && longitude !== 0;
    },
    formatCoordinate(value) {
      return String(value || "");
    },
    googleMapUrl(spot) {
      if (!this.hasCoordinates(spot)) return "";
      return `https://www.google.com/maps/search/?api=1&query=${spot.latitude},${spot.longitude}`;
    },
    selectSpot(spotId, nextView) {
      this.selectedSpotId = spotId;
      this.logForm.spot_id = spotId;
      this.view = nextView;
    },
    resetConditions() {
      this.conditions = { ...defaultConditions };
    },
    spotName(spotId) {
      return this.spots.find((spot) => spot.spot_id === spotId)?.name || spotId;
    },
    async saveLog() {
      const log = { ...this.logForm, log_id: `log-${Date.now()}` };
      try {
        await gasPost({ action: "saveLog", log });
        this.apiStatus = "GAS APIへログ保存済み";
      } catch (error) {
        this.apiStatus = GAS_API_URL ? `GAS保存失敗。ブラウザ内に保存: ${error.message}` : "ブラウザ内にログ保存済み";
      }
      this.logs = [log, ...this.logs];
      if (!GAS_API_URL) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
      this.logForm.catch_result = "";
      this.logForm.bite_time = "";
      this.logForm.danger_note = "";
      this.logForm.memo = "";
      this.logForm.lost_fish = 0;
      this.logForm.utsubo_count = 0;
      this.logForm.snag_count = 0;
    },
  },
});

app.mount("#app");
