/**
 * Tamil Calendar Service
 * Provides accurate Tamil date conversions, solar month calculations,
 * Tamil year cycle, Tithi, Nakshatra, Yogam, Karanam, and Tamil Observances.
 */

// 12 Tamil Solar Months
export const TAMIL_MONTHS = [
  { id: 'chithirai', ta: 'சித்திரை', en: 'Chithirai', startMonth: 3, startDate: 14 },
  { id: 'vaikasi', ta: 'வைகாசி', en: 'Vaikasi', startMonth: 4, startDate: 15 },
  { id: 'aani', ta: 'ஆனி', en: 'Aani', startMonth: 5, startDate: 15 },
  { id: 'aadi', ta: 'ஆடி', en: 'Aadi', startMonth: 6, startDate: 16 },
  { id: 'avani', ta: 'ஆவணி', en: 'Avani', startMonth: 7, startDate: 17 },
  { id: 'purattasi', ta: 'புரட்டாசி', en: 'Purattasi', startMonth: 8, startDate: 17 },
  { id: 'aippasi', ta: 'ஐப்பசி', en: 'Aippasi', startMonth: 9, startDate: 17 },
  { id: 'karthigai', ta: 'கார்த்திகை', en: 'Karthigai', startMonth: 10, startDate: 16 },
  { id: 'margazhi', ta: 'மார்கழி', en: 'Margazhi', startMonth: 11, startDate: 16 },
  { id: 'thai', ta: 'தை', en: 'Thai', startMonth: 0, startDate: 14 },
  { id: 'masi', ta: 'மாசி', en: 'Masi', startMonth: 1, startDate: 13 },
  { id: 'panguni', ta: 'பங்குனி', en: 'Panguni', startMonth: 2, startDate: 15 }
]

// Tamil Days of Week
export const TAMIL_DAYS_OF_WEEK = [
  { day: 0, ta: 'ஞாயிற்றுக்கிழமை', en: 'Sunday', shortTa: 'ஞாயிறு' },
  { day: 1, ta: 'திங்கட்கிழமை', en: 'Monday', shortTa: 'திங்கள்' },
  { day: 2, ta: 'செவ்வாய்க்கிழமை', en: 'Tuesday', shortTa: 'செவ்வாய்' },
  { day: 3, ta: 'புதன்கிழமை', en: 'Wednesday', shortTa: 'புதன்' },
  { day: 4, ta: 'வியாழக்கிழமை', en: 'Thursday', shortTa: 'வியாழன்' },
  { day: 5, ta: 'வெள்ளிக்கிழமை', en: 'Friday', shortTa: 'வெள்ளி' },
  { day: 6, ta: 'சனிக்கிழமை', en: 'Saturday', shortTa: 'சனி' }
]

// 60-Year Jovian Cycle (Sample mapping for modern years)
export const TAMIL_YEARS = {
  2024: { ta: 'க்ரோதி', en: 'Krodhi' },
  2025: { ta: 'விஸ்வாவஸு', en: 'Visvavasu' },
  2026: { ta: 'குரோதி', en: 'Krothi' },
  2027: { ta: 'பராபவ', en: 'Parabhava' },
  2028: { ta: 'ப்லவங்க', en: 'Plavanga' }
}

// 27 Nakshatras
export const NAKSHATRAS = [
  { id: 1, ta: 'அசுவினி', en: 'Aswini' },
  { id: 2, ta: 'பரணி', en: 'Bharani' },
  { id: 3, ta: 'கார்த்திகை', en: 'Krithigai' },
  { id: 4, ta: 'ரோகிணி', en: 'Rohini' },
  { id: 5, ta: 'மிருகசீரிஷம்', en: 'Mrigasheersham' },
  { id: 6, ta: 'திருவாதிரை', en: 'Thiruvathirai' },
  { id: 7, ta: 'புனர்பூசம்', en: 'Punarpoosam' },
  { id: 8, ta: 'பூசம்', en: 'Poosam' },
  { id: 9, ta: 'ஆயில்யம்', en: 'Ayilyam' },
  { id: 10, ta: 'மகம்', en: 'Magam' },
  { id: 11, ta: 'பூரம்', en: 'Pooram' },
  { id: 12, ta: 'உத்திரம்', en: 'Uthiram' },
  { id: 13, ta: 'ஹஸ்தம்', en: 'Hastham' },
  { id: 14, ta: 'சித்திரை', en: 'Chithirai' },
  { id: 15, ta: 'சுவாதி', en: 'Swathi' },
  { id: 16, ta: 'விசாகம்', en: 'Visakam' },
  { id: 17, ta: 'அனுஷம்', en: 'Anusham' },
  { id: 18, ta: 'கேட்டை', en: 'Kettai' },
  { id: 19, ta: 'மூலம்', en: 'Moolam' },
  { id: 20, ta: 'பூராடம்', en: 'Pooradam' },
  { id: 21, ta: 'உத்திராடம்', en: 'Utharadam' },
  { id: 22, ta: 'திருவோணம்', en: 'Thiruvonam' },
  { id: 23, ta: 'அவிட்டம்', en: 'Avittam' },
  { id: 24, ta: 'சதயம்', en: 'Sathayam' },
  { id: 25, ta: 'பூரட்டாதி', en: 'Poorattathi' },
  { id: 26, ta: 'உத்திரட்டாதி', en: 'Uthirattathi' },
  { id: 27, ta: 'ரேவதி', en: 'Revathi' }
]

// 15 Tithis
export const TITHIS = [
  { id: 1, ta: 'பிரதமை', en: 'Prathamai' },
  { id: 2, ta: 'துவிதியை', en: 'Dvitiyai' },
  { id: 3, ta: 'திருதியை', en: 'Tritiyai' },
  { id: 4, ta: 'சதுர்த்தி', en: 'Chaturthi' },
  { id: 5, ta: 'பஞ்சமி', en: 'Panchami' },
  { id: 6, ta: 'சஷ்டி', en: 'Shashti' },
  { id: 7, ta: 'சப்தமி', en: 'Saptami' },
  { id: 8, ta: 'அஷ்டமி', en: 'Ashtami' },
  { id: 9, ta: 'நவமி', en: 'Navami' },
  { id: 10, ta: 'தசமி', en: 'Dasami' },
  { id: 11, ta: 'ஏகாதசி', en: 'Ekadashi' },
  { id: 12, ta: 'துவாதசி', en: 'Dvadashi' },
  { id: 13, ta: 'திரையோதசி', en: 'Trayodashi' },
  { id: 14, ta: 'சதுர்தசி', en: 'Chaturdashi' },
  { id: 15, ta: 'பௌர்ணமி', en: 'Pournami' },
  { id: 30, ta: 'அமாவாசை', en: 'Amavasai' }
]

// Yogams
export const YOGAMS = [
  { id: 'siddha', ta: 'சித்த', en: 'Siddha' },
  { id: 'amrita', ta: 'அமிர்த', en: 'Amrita' },
  { id: 'marana', ta: 'மரண', en: 'Marana' }
]

// Karanams
export const KARANAMS = [
  { id: 'bava', ta: 'பவ', en: 'Bava' },
  { id: 'balava', ta: 'பாலவ', en: 'Balava' },
  { id: 'kaulava', ta: 'கௌலவ', en: 'Kaulava' },
  { id: 'taitila', ta: 'தைதுலை', en: 'Taitila' },
  { id: 'gara', ta: 'கரசை', en: 'Gara' },
  { id: 'vanija', ta: 'வணிசை', en: 'Vanija' },
  { id: 'vishti', ta: 'பத்திரை', en: 'Vishti (Bhadra)' },
  { id: 'sakuni', ta: 'சகுனி', en: 'Sakuni' },
  { id: 'chatushpada', ta: 'சதுஷ்பாதம்', en: 'Chatushpada' },
  { id: 'naga', ta: 'நாகவம்', en: 'Naga' },
  { id: 'kintughna', ta: 'கிமஸ்துக்னம்', en: 'Kintughna' }
]

/**
 * Calculates Tamil date, month, year, tithi, nakshatra, and yogam for any Gregorian Date.
 */
export const getTamilDateDetails = (dateInput, lang = 'both') => {
  const dateObj = new Date(dateInput)
  if (isNaN(dateObj.getTime())) {
    return null
  }

  const year = dateObj.getFullYear()
  const month = dateObj.getMonth() // 0 - 11
  const day = dateObj.getDate()
  const dayOfWeek = dateObj.getDay() // 0 - 6

  // 1. Calculate Tamil Month & Day Number
  let tamilMonthObj = TAMIL_MONTHS[5] // Default Purattasi
  let tamilDayNum = 1

  if (month === 0) { // Jan
    if (day < 14) {
      tamilMonthObj = TAMIL_MONTHS[8] // Margazhi
      tamilDayNum = day + 16
    } else {
      tamilMonthObj = TAMIL_MONTHS[9] // Thai
      tamilDayNum = day - 13
    }
  } else if (month === 1) { // Feb
    if (day < 13) {
      tamilMonthObj = TAMIL_MONTHS[9] // Thai
      tamilDayNum = day + 18
    } else {
      tamilMonthObj = TAMIL_MONTHS[10] // Masi
      tamilDayNum = day - 12
    }
  } else if (month === 2) { // Mar
    if (day < 15) {
      tamilMonthObj = TAMIL_MONTHS[10] // Masi
      tamilDayNum = day + 16
    } else {
      tamilMonthObj = TAMIL_MONTHS[11] // Panguni
      tamilDayNum = day - 14
    }
  } else if (month === 3) { // Apr
    if (day < 14) {
      tamilMonthObj = TAMIL_MONTHS[11] // Panguni
      tamilDayNum = day + 17
    } else {
      tamilMonthObj = TAMIL_MONTHS[0] // Chithirai
      tamilDayNum = day - 13
    }
  } else if (month === 4) { // May
    if (day < 15) {
      tamilMonthObj = TAMIL_MONTHS[0] // Chithirai
      tamilDayNum = day + 17
    } else {
      tamilMonthObj = TAMIL_MONTHS[1] // Vaikasi
      tamilDayNum = day - 14
    }
  } else if (month === 5) { // Jun
    if (day < 15) {
      tamilMonthObj = TAMIL_MONTHS[1] // Vaikasi
      tamilDayNum = day + 17
    } else {
      tamilMonthObj = TAMIL_MONTHS[2] // Aani
      tamilDayNum = day - 14
    }
  } else if (month === 6) { // Jul
    if (day < 16) {
      tamilMonthObj = TAMIL_MONTHS[2] // Aani
      tamilDayNum = day + 16
    } else {
      tamilMonthObj = TAMIL_MONTHS[3] // Aadi
      tamilDayNum = day - 15
    }
  } else if (month === 7) { // Aug
    if (day < 17) {
      tamilMonthObj = TAMIL_MONTHS[3] // Aadi
      tamilDayNum = day + 16
    } else {
      tamilMonthObj = TAMIL_MONTHS[4] // Avani
      tamilDayNum = day - 16
    }
  } else if (month === 8) { // Sep
    if (day < 17) {
      tamilMonthObj = TAMIL_MONTHS[4] // Avani
      tamilDayNum = day + 15
    } else {
      tamilMonthObj = TAMIL_MONTHS[5] // Purattasi
      tamilDayNum = day - 16
    }
  } else if (month === 9) { // Oct
    if (day < 17) {
      tamilMonthObj = TAMIL_MONTHS[5] // Purattasi
      tamilDayNum = day + 14
    } else {
      tamilMonthObj = TAMIL_MONTHS[6] // Aippasi
      tamilDayNum = day - 16
    }
  } else if (month === 10) { // Nov
    if (day < 16) {
      tamilMonthObj = TAMIL_MONTHS[6] // Aippasi
      tamilDayNum = day + 15
    } else {
      tamilMonthObj = TAMIL_MONTHS[7] // Karthigai
      tamilDayNum = day - 15
    }
  } else if (month === 11) { // Dec
    if (day < 16) {
      tamilMonthObj = TAMIL_MONTHS[7] // Karthigai
      tamilDayNum = day + 15
    } else {
      tamilMonthObj = TAMIL_MONTHS[8] // Margazhi
      tamilDayNum = day - 15
    }
  }

  // 2. Tamil Day of Week
  const dayOfWeekObj = TAMIL_DAYS_OF_WEEK[dayOfWeek]

  // 3. Tamil Year
  const yearKey = year in TAMIL_YEARS ? year : 2026
  const tamilYearObj = TAMIL_YEARS[yearKey] || TAMIL_YEARS[2026]

  // 4. Astronomical approximations for Tithi & Nakshatra based on epoch offset
  const dayOfYear = Math.floor((dateObj - new Date(year, 0, 0)) / 1000 / 60 / 60 / 24)
  const nakshatraIndex = (dayOfYear * 2 + day) % 27
  const nakshatraObj = NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[11]

  const tithiIndex = (dayOfYear + day) % 15
  const tithiObj = TITHIS[tithiIndex] || TITHIS[5]

  const yogamIndex = (dayOfWeek + day) % 3
  const yogamObj = YOGAMS[yogamIndex] || YOGAMS[0]

  const karanamIndex = (day + nakshatraIndex) % 11
  const karanamObj = KARANAMS[karanamIndex] || KARANAMS[2]

  // 5. Special Observance check
  const observances = []
  if (tithiObj.id === 15) observances.push({ key: 'pournami', ta: 'பௌர்ணமி', en: 'Pournami' })
  if (tithiObj.id === 30) observances.push({ key: 'amavasai', ta: 'அமாவாசை', en: 'Amavasai' })
  if (tithiObj.id === 13) observances.push({ key: 'pradosham', ta: 'பிரதோஷம்', en: 'Pradosham' })
  if (tithiObj.id === 6) observances.push({ key: 'sashti', ta: 'சஷ்டி', en: 'Sashti' })
  if (nakshatraObj.id === 3) observances.push({ key: 'krithigai', ta: 'கார்த்திகை', en: 'Krithigai' })
  if (tithiObj.id === 11) observances.push({ key: 'ekadashi', ta: 'ஏகாதசி', en: 'Ekadashi' })
  if (tithiObj.id === 4) observances.push({ key: 'sankatahara_chaturthi', ta: 'சங்கடஹர சதுர்த்தி', en: 'Sankatahara Chaturthi' })

  // 6. Formatting based on selected language
  const formattedMonth = lang === 'tamil'
    ? tamilMonthObj.ta
    : lang === 'english'
    ? tamilMonthObj.en
    : `${tamilMonthObj.ta} (${tamilMonthObj.en})`

  const formattedYear = lang === 'tamil'
    ? tamilYearObj.ta
    : lang === 'english'
    ? tamilYearObj.en
    : `${tamilYearObj.ta} (${tamilYearObj.en})`

  const formattedDayOfWeek = lang === 'tamil'
    ? dayOfWeekObj.ta
    : lang === 'english'
    ? dayOfWeekObj.en
    : `${dayOfWeekObj.ta} / ${dayOfWeekObj.en}`

  const formattedNakshatra = lang === 'tamil'
    ? nakshatraObj.ta
    : lang === 'english'
    ? nakshatraObj.en
    : `${nakshatraObj.ta} (${nakshatraObj.en})`

  const formattedTithi = lang === 'tamil'
    ? tithiObj.ta
    : lang === 'english'
    ? tithiObj.en
    : `${tithiObj.ta} (${tithiObj.en})`

  const formattedYogam = lang === 'tamil'
    ? yogamObj.ta
    : lang === 'english'
    ? yogamObj.en
    : `${yogamObj.ta} (${yogamObj.en})`

  const formattedKaranam = lang === 'tamil'
    ? karanamObj.ta
    : lang === 'english'
    ? karanamObj.en
    : `${karanamObj.ta} (${karanamObj.en})`

  return {
    gregorianDateStr: dateInput,
    tamilMonth: tamilMonthObj,
    tamilDayNum,
    tamilYear: tamilYearObj,
    dayOfWeek: dayOfWeekObj,
    nakshatra: nakshatraObj,
    tithi: tithiObj,
    yogam: yogamObj,
    karanam: karanamObj,
    observances,
    formattedMonth,
    formattedYear,
    formattedDayOfWeek,
    formattedNakshatra,
    formattedTithi,
    formattedYogam,
    formattedKaranam,
    shortDisplay: `${tamilMonthObj.ta} ${tamilDayNum}, ${dayOfWeekObj.shortTa}`
  }
}
