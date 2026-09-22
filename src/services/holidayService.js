/**
 * Holiday & Festival Service
 * Manages TN Government Public Holidays, Tamil Festivals,
 * Indian National Days, and International Important Days.
 */

export const HOLIDAY_CATEGORIES = {
  GOVT: 'Government Holiday',
  NATIONAL: 'National Holiday',
  FESTIVAL: 'Tamil Festival',
  IMPORTANT: 'Important Day',
  RESTRICTED: 'Restricted Holiday'
}

// Year-wise Master Dataset for Holidays & Observances
const YEAR_DATASETS = {
  2026: [
    // January
    { date: '2026-01-01', name: 'New Year\'s Day', taName: 'ஆங்கில புத்தாண்டு', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu & National', desc: 'First day of the Gregorian calendar year.' },
    { date: '2026-01-13', name: 'Bhogi Festival', taName: 'போகிப் பண்டிகை', category: HOLIDAY_CATEGORIES.FESTIVAL, isPublicHoliday: false, state: 'Tamil Nadu', desc: 'Celebration of discarded old possessions and welcoming the new harvest.' },
    { date: '2026-01-14', name: 'Thai Pongal', taName: 'தைப்பொங்கல்', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Harvest festival dedicated to the Sun God Surya.' },
    { date: '2026-01-15', name: 'Thiruvalluvar Day / Mattu Pongal', taName: 'திருவள்ளுவர் தினம் / மாட்டுப் பொங்கல்', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Honoring the great Tamil poet Thiruvalluvar and cattle.' },
    { date: '2026-01-16', name: 'Uzhavar Thirunal / Kaanum Pongal', taName: 'உழவர் திருநாள் / காணும் பொங்கல்', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Farmers day and family outings celebration.' },
    { date: '2026-01-26', name: 'Republic Day (India)', taName: 'குடியரசு தினம்', category: HOLIDAY_CATEGORIES.NATIONAL, isPublicHoliday: true, state: 'National', desc: 'Commemorates the adoption of the Constitution of India in 1950.' },
    { date: '2026-02-01', name: 'Thai Poosam', taName: 'தைப்பூசம்', category: HOLIDAY_CATEGORIES.FESTIVAL, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Grand festival celebrating Lord Murugan.' },

    // March
    { date: '2026-03-08', name: 'International Women\'s Day', taName: 'சர்வதேச மகளிர் தினம்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'Global', desc: 'Celebrating women\'s achievements and gender equality.' },
    { date: '2026-03-15', name: 'Maha Shivaratri', taName: 'மகா சிவராத்திரி', category: HOLIDAY_CATEGORIES.FESTIVAL, isPublicHoliday: false, state: 'Tamil Nadu', desc: 'Great night of Lord Shiva observed with night vigils.' },
    { date: '2026-04-03', name: 'Good Friday', taName: 'புனித வெள்ளி', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu & National', desc: 'Christian holiday commemorating the crucifixion of Jesus.' },

    // April
    { date: '2026-04-07', name: 'World Health Day', taName: 'உலக சுகாதார தினம்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'Global', desc: 'Promotes global health awareness.' },
    { date: '2026-04-14', name: 'Tamil New Year / Puthandu', taName: 'தமிழ் புத்தாண்டு', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Beginning of the first month Chithirai in Tamil Calendar.' },
    { date: '2026-04-14', name: 'Dr. B.R. Ambedkar Jayanti', taName: 'டாக்டர் பி.ஆர். அம்பேத்கர் ஜெயந்தி', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'National', desc: 'Birth anniversary of Dr. B.R. Ambedkar.' },

    // May
    { date: '2026-05-01', name: 'May Day / Labor Day', taName: 'மே தினம் / உழைப்பாளர் தினம்', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu & National', desc: 'Honors the contributions of workers and laborers.' },
    { date: '2026-05-27', name: 'Bakrid / Eid al-Adha', taName: 'பக்ரீத்', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu & National', desc: 'Islamic Festival of Sacrifice.' },

    // June
    { date: '2026-06-05', name: 'World Environment Day', taName: 'உலக சுற்றுச்சூழல் தினம்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'Global', desc: 'Encouraging awareness and action for the environment.' },
    { date: '2026-06-21', name: 'International Yoga Day', taName: 'சர்வதேச யோகா தினம்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'Global', desc: 'Promotes physical and mental wellness through Yoga.' },

    // August
    { date: '2026-08-03', name: 'Aadi Perukku', taName: 'ஆடி பெருக்கு', category: HOLIDAY_CATEGORIES.FESTIVAL, isPublicHoliday: false, state: 'Tamil Nadu', desc: 'Tribute to water bodies and river Kaveri.' },
    { date: '2026-08-15', name: 'Independence Day (India)', taName: 'சுதந்திர தினம்', category: HOLIDAY_CATEGORIES.NATIONAL, isPublicHoliday: true, state: 'National', desc: 'Commemorates Indian independence from British rule in 1947.' },
    { date: '2026-08-18', name: 'Village Administration Day', taName: 'கிராம நிர்வாக நாள்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'Tamil Nadu', desc: 'Honoring village level governance in Tamil Nadu.' },

    // September
    { date: '2026-09-04', name: 'Krishna Jayanthi / Gokulashtami', taName: 'கிருஷ்ண ஜெயந்தி', category: HOLIDAY_CATEGORIES.FESTIVAL, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Birth celebration of Lord Krishna.' },
    { date: '2026-09-05', name: 'Teachers\' Day (India)', taName: 'ஆசிரியர் தினம்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'National', desc: 'Honoring teachers on Dr. Sarvepalli Radhakrishnan\'s birthday.' },
    { date: '2026-09-14', name: 'Vinayagar Chathurthi', taName: 'விநாயகர் சதுர்த்தி', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Festival celebrating the arrival of Lord Ganesha.' },
    { date: '2026-09-17', name: 'World Patient Safety Day', taName: 'உலக நோயாளி பாதுகாப்பு நாள்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'Global', desc: 'Promotes patient safety awareness worldwide.' },
    { date: '2026-09-18', name: 'Purattasi 1 (Purattasi Pirappu)', taName: 'புரட்டாசி 1 (புரட்டாசி பிறப்பு)', category: HOLIDAY_CATEGORIES.FESTIVAL, isPublicHoliday: false, state: 'Tamil Nadu', desc: 'Beginning of the holy Purattasi month in Tamil solar calendar.' },
    { date: '2026-09-26', name: 'Milad-un-Nabi', taName: 'மிலாடி நபி', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu & National', desc: 'Birth anniversary of Prophet Muhammad.' },

    // October
    { date: '2026-10-02', name: 'Gandhi Jayanti', taName: 'காந்தி ஜெயந்தி', category: HOLIDAY_CATEGORIES.NATIONAL, isPublicHoliday: true, state: 'National', desc: 'Birth anniversary of Mahatma Gandhi, Father of the Nation.' },
    { date: '2026-10-19', name: 'Ayutha Pooja / Saraswathi Pooja', taName: 'ஆயுத பூஜை / சரஸ்வதி பூஜை', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Worship of tools, instruments, books and Goddess Saraswathi.' },
    { date: '2026-10-20', name: 'Vijaya Dasami', taName: 'விஜயதசமி', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu', desc: 'Celebration of victory of good over evil and auspicious day for new learning.' },

    // November
    { date: '2026-11-08', name: 'Deepavali', taName: 'தீபாவளி', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu & National', desc: 'Festival of Lights celebrating victory of light over darkness.' },
    { date: '2026-11-14', name: 'Children\'s Day (India)', taName: 'குழந்தைகள் தினம்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'National', desc: 'Celebrating childhood on Pandit Jawaharlal Nehru\'s birthday.' },
    { date: '2026-11-23', name: 'Karthigai Deepam', taName: 'கார்த்திகை தீபம்', category: HOLIDAY_CATEGORIES.FESTIVAL, isPublicHoliday: false, state: 'Tamil Nadu', desc: 'Festival of lights in Tamil Nadu homes and Lord Murugan temples.' },
    { date: '2026-11-26', name: 'Constitution Day (India)', taName: 'அரசியலமைப்பு தினம்', category: HOLIDAY_CATEGORIES.IMPORTANT, isPublicHoliday: false, state: 'National', desc: 'Celebrates the adoption of the Constitution of India.' },

    // December
    { date: '2026-12-25', name: 'Christmas', taName: 'கிறிஸ்துமஸ்', category: HOLIDAY_CATEGORIES.GOVT, isPublicHoliday: true, state: 'Tamil Nadu & National', desc: 'Birth celebration of Jesus Christ.' },
    { date: '2026-12-30', name: 'Vaikunta Ekadashi', taName: 'வைகுண்ட ஏகாதசி', category: HOLIDAY_CATEGORIES.FESTIVAL, isPublicHoliday: false, state: 'Tamil Nadu', desc: 'Opening of Paramapada Vaasal in Vishnu temples.' }
  ]
}

/**
 * Retrieves all holidays, festivals, and important days for a specific year.
 */
export const getHolidaysForYear = (year = 2026) => {
  return YEAR_DATASETS[year] || YEAR_DATASETS[2026]
}

/**
 * Retrieves holidays and observances for a specific date (YYYY-MM-DD).
 */
export const getHolidaysForDate = (dateStr, year = 2026) => {
  const all = getHolidaysForYear(year)
  return all.filter((item) => item.date === dateStr)
}

/**
 * Retrieves holidays and observances for a specific month (0-indexed).
 */
export const getHolidaysForMonth = (year, monthIdx, categoryFilter = 'All') => {
  const all = getHolidaysForYear(year)
  return all.filter((item) => {
    const itemDate = new Date(item.date)
    const matchesMonth = itemDate.getFullYear() === year && itemDate.getMonth() === monthIdx

    if (!matchesMonth) return false
    if (categoryFilter === 'All') return true
    return item.category === categoryFilter
  })
}
