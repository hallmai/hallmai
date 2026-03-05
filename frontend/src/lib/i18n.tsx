"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Locale = "en" | "ko";

const dictionaries = {
  en: {
    brand: "hallmai",
    updatesTab: "Updates",
    settingsTab: "Settings",
    title: "Mom's Well-being",
    subtitle: "Summarized by hallmai",
    alertSleep: "Sleep issues detected",
    alertSleepDetail: "Mom mentioned trouble sleeping 2 nights this week",
    statStreak: "Streak",
    statStreakUnit: "days",
    statWeek: "This Week",
    statWeekUnit: "chats",
    statMood: "Avg Mood",
    statMoodUnit: "good",
    weeklyMood: "Weekly Mood",
    weeklyMoodRange: "Mar 1 \u2013 7",
    moodGood: "Good",
    moodOkay: "Okay",
    moodLow: "Low",
    weeklyInsight: "Weekly Insight",
    weeklyInsightBy: "by hallmai",
    weeklyInsightText:
      "Mom had a great week overall. She went on walks 4 times and cooked for herself every day. She mentioned feeling lonely on Thursday \u2014 a quick call would brighten her day.",
    tagActive: "Active",
    tagLoneliness: "Mild loneliness",
    tagAppetite: "Good appetite",
    dailyUpdates: "Daily Updates",
    alertLoneliness: "Loneliness",
    alertSleepTag: "Sleep",
    alertLowMood: "Low mood",
    cardToday: "Today \u00b7 Mar 5",
    cardYesterday: "Yesterday \u00b7 Mar 4",
    cardMar3: "Mar 3",
    cardMar2: "Mar 2",
    cardSummary1: "Mom went for a walk with her neighbor Sunja. The warm weather put her in a great mood.",
    cardSummary2: "An old song on TV reminded her of Dad. She made doenjang-jjigae for dinner.",
    cardSummary3: "She asked for photos of the grandkids. Been keeping up with her daily walks.",
    cardSummary4: "Had trouble sleeping last night. Otherwise a quiet day at home.",
    dayMon: "M",
    dayTue: "T",
    dayWed: "W",
    dayThu: "T",
    dayFri: "F",
    daySat: "S",
    daySun: "S",
    voiceSummaryTitle: "Yesterday's Summary",
    voiceSummaryPreview: "Mom had a good day yesterday. She went on a walk with her neighbor Sunja and the warm weather lifted her spirits. She cooked doenjang-jjigae for dinner and watched her favorite drama...",
    voiceSummaryDuration: "1:42",
    voiceSummaryLabel: "Voice briefing",
    momQuote: "Mom said today",
    momQuoteText: "Walking with Sunja next door is the best thing these days.",
    momQuoteContext: "During a walk story",
    topicSuggestionsLabel: "Talk to Mom about",
    topic1: "Ask about her walk with Sunja",
    topic2: "How was the doenjang-jjigae?",
    topic3: "Ask about her checkup on the 12th",
    remindersLabel: "Reminders",
    remindersSubLabel: "Detected from conversations",
    reminder1Date: "Mar 12",
    reminder1Text: "Health checkup",
    reminder2Date: "Every morning",
    reminder2Text: "Blood pressure medicine",
    reminder3Date: "Mar 15",
    reminder3Text: "Sunja's birthday",
    callNickname: "Sunja",
    callGreeting: "Sunja, nice to see you!",
    callIdle: "Touch to talk",
    callListening: "Listening...",
    callSpeaking: "Speaking...",
    callEnding: "Sunja, have a great day!",
    settingsTitle: "Settings",
    settingsBack: "Back",
    settingsNickname: "Nickname",
    settingsNicknameDesc: "What should hallmai call you?",
    settingsTone: "Conversation tone",
    settingsToneWarm: "Warm & caring",
    settingsSchedule: "Daily call time",
    settingsFamily: "Family dashboard link",
    settingsFamilyCopy: "Copy link",
  },
  ko: {
    brand: "\uD560\uB9C8\uC774",
    updatesTab: "\uC548\uBD80",
    settingsTab: "\uC124\uC815",
    title: "\uC5B4\uBA38\uB2C8 \uC548\uBD80",
    subtitle: "\uD560\uB9C8\uC774\uAC00 \uC815\uB9AC\uD588\uC5B4\uC694",
    alertSleep: "\uC218\uBA74 \uBB38\uC81C \uAC10\uC9C0",
    alertSleepDetail: "\uC774\uBC88 \uC8FC \uB450 \uBC88 \uC7A0\uC744 \uC124\uCCE4\uB2E4\uACE0 \uD558\uC168\uC5B4\uC694",
    statStreak: "\uC5F0\uC18D",
    statStreakUnit: "\uC77C",
    statWeek: "\uC774\uBC88 \uC8FC",
    statWeekUnit: "\uD1B5\uD654",
    statMood: "\uD3C9\uADE0 \uAE30\uBD84",
    statMoodUnit: "\uC88B\uC74C",
    weeklyMood: "\uC8FC\uAC04 \uAE30\uBD84",
    weeklyMoodRange: "3\uC6D4 1\uC77C \u2013 7\uC77C",
    moodGood: "\uC88B\uC74C",
    moodOkay: "\uBCF4\uD1B5",
    moodLow: "\uC800\uC870",
    weeklyInsight: "\uC8FC\uAC04 \uC694\uC57D",
    weeklyInsightBy: "by \uD560\uB9C8\uC774",
    weeklyInsightText:
      "\uC5B4\uBA38\uB2C8\uB294 \uC804\uBC18\uC801\uC73C\uB85C \uC88B\uC740 \uD55C \uC8FC\uB97C \uBCF4\uB0B4\uC168\uC5B4\uC694. \uC0B0\uCC45\uC744 4\uBC88 \uB2E4\uB140\uC624\uC168\uACE0, \uB9E4\uC77C \uC9C1\uC811 \uBC25\uC744 \uD574 \uB4DC\uC168\uC5B4\uC694. \uBAA9\uC694\uC77C\uC5D0 \uC678\uB85C\uC6B0\uC168\uB2E4\uACE0 \uD558\uC168\uB294\uB370, \uC804\uD654 \uD55C \uD1B5\uC774\uBA74 \uAE30\uBED0\uD558\uC2E4 \uAC70\uC608\uC694.",
    tagActive: "\uD65C\uBC1C\uD568",
    tagLoneliness: "\uC57D\uAC04\uC758 \uC678\uB85C\uC6C0",
    tagAppetite: "\uC2DD\uC695 \uC88B\uC74C",
    dailyUpdates: "\uC77C\uBCC4 \uC548\uBD80",
    alertLoneliness: "\uC678\uB85C\uC6C0",
    alertSleepTag: "\uC218\uBA74",
    alertLowMood: "\uC800\uC870\uD55C \uAE30\uBD84",
    cardToday: "\uC624\uB298 \u00b7 3\uC6D4 5\uC77C",
    cardYesterday: "\uC5B4\uC81C \u00b7 3\uC6D4 4\uC77C",
    cardMar3: "3\uC6D4 3\uC77C",
    cardMar2: "3\uC6D4 2\uC77C",
    cardSummary1: "\uC5B4\uBA38\uB2C8\uAC00 \uC774\uC6C3 \uC21C\uC790 \uC544\uC904\uB9C8\uC640 \uC0B0\uCC45\uC744 \uB2E4\uB140\uC624\uC168\uC5B4\uC694. \uB530\uB73B\uD55C \uB0A0\uC528 \uB355\uBD84\uC5D0 \uAE30\uBD84\uC774 \uC88B\uC73C\uC168\uB300\uC694.",
    cardSummary2: "TV\uC5D0\uC11C \uC61B\uB178\uB798\uAC00 \uB098\uC640\uC11C \uC544\uBC84\uC9C0 \uC0DD\uAC01\uC774 \uB098\uC168\uB300\uC694. \uC800\uB141\uC5D4 \uB41C\uC7A5\uCC0C\uAC1C\uB97C \uB053\uC5EC \uB4DC\uC168\uC5B4\uC694.",
    cardSummary3: "\uC190\uC8FC \uC0AC\uC9C4\uC744 \uBCF4\uB0B4\uB2EC\uB77C\uACE0 \uD558\uC168\uC5B4\uC694. \uB9E4\uC77C \uC0B0\uCC45\uB3C4 \uAFC0\uC900\uD788 \uD558\uACE0 \uACC4\uC138\uC694.",
    cardSummary4: "\uC5B4\uC82F\uBC24\uC5D0 \uC7A0\uC744 \uC124\uCCE4\uB2E4\uACE0 \uD558\uC168\uC5B4\uC694. \uADF8 \uC678\uC5D4 \uC870\uC6A9\uD55C \uD558\uB8E8\uC600\uB300\uC694.",
    dayMon: "\uC6D4",
    dayTue: "\uD654",
    dayWed: "\uC218",
    dayThu: "\uBAA9",
    dayFri: "\uAE08",
    daySat: "\uD1A0",
    daySun: "\uC77C",
    voiceSummaryTitle: "\uC5B4\uC81C\uC758 \uC548\uBD80",
    voiceSummaryPreview: "\uC5B4\uBA38\uB2C8\uB294 \uC5B4\uC81C \uC88B\uC740 \uD558\uB8E8\uB97C \uBCF4\uB0B4\uC168\uC5B4\uC694. \uC774\uC6C3 \uC21C\uC790 \uC544\uC904\uB9C8\uC640 \uC0B0\uCC45\uC744 \uB2E4\uB140\uC624\uC168\uACE0, \uB530\uB73B\uD55C \uB0A0\uC528\uC5D0 \uAE30\uBD84\uC774 \uC88B\uC73C\uC168\uB300\uC694. \uC800\uB141\uC5D4 \uB41C\uC7A5\uCC0C\uAC1C\uB97C \uB053\uC5EC \uB4DC\uC2DC\uACE0 \uC88B\uC544\uD558\uC2DC\uB294 \uB4DC\uB77C\uB9C8\uB97C \uBCF4\uC168\uC5B4\uC694...",
    voiceSummaryDuration: "1:42",
    voiceSummaryLabel: "\uC74C\uC131 \uBE0C\uB9AC\uD551",
    momQuote: "\uC624\uB298 \uC5C4\uB9C8\uAC00 \uD558\uC2E0 \uB9D0",
    momQuoteText: "\uC694\uC998 \uC61E\uC9D1 \uC21C\uC790 \uC544\uC904\uB9C8\uB791 \uC0B0\uCC45\uD558\uB294 \uAC8C \uC81C\uC77C \uC88B\uB354\uB77C.",
    momQuoteContext: "\uC0B0\uCC45 \uC774\uC57C\uAE30 \uC911",
    topicSuggestionsLabel: "\uC5C4\uB9C8\uD55C\uD14C \uC774\uB7F0 \uC598\uAE30 \uD574\uBCF4\uC138\uC694",
    topic1: "\uC21C\uC790 \uC544\uC904\uB9C8\uC640 \uC0B0\uCC45 \uC5B4\uB560\uB294\uC9C0",
    topic2: "\uB41C\uC7A5\uCC0C\uAC1C \uB9DB\uC788\uC5C8\uB294\uC9C0",
    topic3: "12\uC77C \uAC74\uAC15\uAC80\uC9C4 \uC900\uBE44\uB294 \uC798 \uB418\uACE0 \uC788\uB294\uC9C0",
    remindersLabel: "\uB9AC\uB9C8\uC778\uB354",
    remindersSubLabel: "\uB300\uD654\uC5D0\uC11C \uAC10\uC9C0\uB428",
    reminder1Date: "3\uC6D4 12\uC77C",
    reminder1Text: "\uAC74\uAC15\uAC80\uC9C4",
    reminder2Date: "\uB9E4\uC77C \uC544\uCE68",
    reminder2Text: "\uD608\uC555\uC57D \uBCF5\uC6A9",
    reminder3Date: "3\uC6D4 15\uC77C",
    reminder3Text: "\uC21C\uC790 \uC544\uC904\uB9C8 \uC0DD\uC77C",
    callIdle: "\uD130\uCE58\uD558\uBA74 \uB300\uD654\uD574\uC694",
    callNickname: "\uC21C\uC790",
    callGreeting: "\uC21C\uC790\uB2D8, \uBC18\uAC00\uC6CC\uC694!",
    callListening: "\uB4E3\uACE0 \uC788\uC5B4\uC694...",
    callSpeaking: "\uB9D0\uD558\uACE0 \uC788\uC5B4\uC694...",
    callEnding: "\uC21C\uC790\uB2D8, \uC88B\uC740 \uD558\uB8E8 \uBCF4\uB0B4\uC138\uC694!",
    settingsTitle: "\uC124\uC815",
    settingsBack: "\uB4A4\uB85C",
    settingsNickname: "\uD638\uCE6D",
    settingsNicknameDesc: "\uD560\uB9C8\uC774\uAC00 \uBD80\uB97C \uC774\uB984",
    settingsTone: "\uB300\uD654 \uD1A4",
    settingsToneWarm: "\uB530\uB73B\uD558\uACE0 \uB2E4\uC815\uD558\uAC8C",
    settingsSchedule: "\uB9E4\uC77C \uC804\uD654 \uC2DC\uAC04",
    settingsFamily: "\uAC00\uC871 \uB300\uC2DC\uBCF4\uB4DC \uB9C1\uD06C",
    settingsFamilyCopy: "\uB9C1\uD06C \uBCF5\uC0AC",
  },
} satisfies Record<string, Record<string, string>>;

export type DictionaryKey = keyof typeof dictionaries.en;
export type Dictionary = Record<DictionaryKey, string>;

const I18nContext = createContext<{
  locale: Locale;
  t: Dictionary;
  toggleLocale: () => void;
}>({
  locale: "ko",
  t: dictionaries.ko,
  toggleLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ko");

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === "en" ? "ko" : "en"));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: dictionaries[locale], toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
