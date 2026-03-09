"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Locale = "en" | "ko";

const dictionaries = {
  en: {
    brand: "hallmai",
    updatesTab: "Updates",
    settingsTab: "Settings",
    tabCall: "Talk",
    tabStories: "Stories",
    tabSettings: "Settings",
    subtitle: "Today's stories",
    moodGood: "Good",
    moodOkay: "Okay",
    moodLow: "Low",
    dailyUpdates: "Daily Updates",
    callGreeting: "Hello!",
    callIdle: "Touch to talk",
    callListening: "Listening...",
    callSpeaking: "Speaking...",
    callEnding: "Have a great day!",
    settingsTitle: "Settings",
    settingsBack: "Back",
    callConnecting: "Connecting...",
    emptyCards: "No story cards yet",
    emptyCardsDesc: "Stories will appear here after conversations",
    settingsTerms: "Terms of Service",
    settingsPrivacy: "Privacy Policy",
    settingsMarketing: "Marketing Consent",
    settingsLogout: "Log out",
    linkNicknameTitle: "Who would you like updates from?",
    linkNicknamePlaceholder: "Mom",
    linkNext: "Next",
    linkConnect: "Connect",
    linkChangeNickname: "Change name",
    linkCodeDesc: "Enter the code shown on the\ntop-right of {name}'s call screen",
    linkConnecting: "Connecting...",
    linkCodeHint: "Open the hallmai app on {name}'s phone\nto see the code on the top-right of the call screen",
    linkFailed: "Connection failed",
    legalBack: "Back",
    legalPreparing: "Coming soon",
    registerTitle: "Sign Up",
    registerSubtitle: "Agree to terms to get started",
    registerAgreeAll: "Agree to all",
    registerRequired: "required",
    registerOptional: "optional",
    registerMarketingDesc: "We'll only send important updates. You can opt out anytime in settings.",
    registerSubmitting: "Signing up...",
    registerSubmit: "Sign Up",
    settingsLoginTitle: "Connect with family",
    settingsLoginDesc: "Log in to receive story cards",
    settingsLoginButton: "Sign in with Google",
    settingsLoginLoading: "Signing in...",
    loginTagline: "Warm stories, delivered daily",
    loginButton: "Get started with Google",
    loginLoading: "Signing in...",
    loginError: "Login failed. Please try again.",
    loginGoogleError: "Google sign-in failed.",
  },
  ko: {
    brand: "\uD560\uB9C8\uC774",
    updatesTab: "\uC548\uBD80",
    settingsTab: "\uC124\uC815",
    tabCall: "\uB300\uD654",
    tabStories: "\uC774\uC57C\uAE30",
    tabSettings: "\uC124\uC815",
    subtitle: "\uC624\uB298\uC758 \uC774\uC57C\uAE30\uC608\uC694",
    moodGood: "\uC88B\uC74C",
    moodOkay: "\uBCF4\uD1B5",
    moodLow: "\uC800\uC870",
    dailyUpdates: "\uC77C\uBCC4 \uC548\uBD80",
    callIdle: "\uD130\uCE58\uD558\uBA74 \uB300\uD654\uD574\uC694",
    callGreeting: "\uC548\uB155\uD558\uC138\uC694!",
    callListening: "\uB4E3\uACE0 \uC788\uC5B4\uC694...",
    callSpeaking: "\uB9D0\uD558\uACE0 \uC788\uC5B4\uC694...",
    callEnding: "\uC88B\uC740 \uD558\uB8E8 \uBCF4\uB0B4\uC138\uC694!",
    settingsTitle: "\uC124\uC815",
    settingsBack: "\uB4A4\uB85C",
    callConnecting: "\uC5F0\uACB0 \uC911...",
    emptyCards: "\uC544\uC9C1 \uC774\uC57C\uAE30 \uCE74\uB4DC\uAC00 \uC5C6\uC5B4\uC694",
    emptyCardsDesc: "\uC5B4\uB974\uC2E0\uACFC \uB300\uD654\uAC00 \uC2DC\uC791\uB418\uBA74 \uC5EC\uAE30\uC5D0 \uC774\uC57C\uAE30\uAC00 \uC313\uC5EC\uC694",
    settingsTerms: "\uC11C\uBE44\uC2A4 \uC774\uC6A9\uC57D\uAD00",
    settingsPrivacy: "\uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68",
    settingsMarketing: "\uB9C8\uCF00\uD305 \uC218\uC2E0 \uB3D9\uC758",
    settingsLogout: "\uB85C\uADF8\uC544\uC6C3",
    linkNicknameTitle: "\uB204\uAD6C\uC758 \uC548\uBD80\uB97C \uBC1B\uC744\uAE4C\uC694?",
    linkNicknamePlaceholder: "\uC5B4\uBA38\uB2C8",
    linkNext: "\uB2E4\uC74C",
    linkConnect: "\uC5F0\uACB0\uD558\uAE30",
    linkChangeNickname: "\uD638\uCE6D \uBCC0\uACBD",
    linkCodeDesc: "{name}\uC758 \uD734\uB300\uD3F0 \uD1B5\uD654 \uD654\uBA74 \uC6B0\uCE21 \uC0C1\uB2E8\uC5D0\n\uD45C\uC2DC\uB41C \uC0AC\uC6A9\uC790 \uCF54\uB4DC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
    linkConnecting: "\uC5F0\uACB0 \uC911...",
    linkCodeHint: "{name}\uC758 \uD734\uB300\uD3F0\uC5D0\uC11C \uD560\uB9C8\uC774 \uC571\uC744 \uC5F4\uBA74\n\uD1B5\uD654 \uD654\uBA74 \uC6B0\uCE21 \uC0C1\uB2E8\uC5D0 \uCF54\uB4DC\uAC00 \uD45C\uC2DC\uB429\uB2C8\uB2E4",
    linkFailed: "\uC5F0\uACB0\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4",
    legalBack: "\uB3CC\uC544\uAC00\uAE30",
    legalPreparing: "\uC900\uBE44 \uC911\uC785\uB2C8\uB2E4",
    registerTitle: "\uD68C\uC6D0\uAC00\uC785",
    registerSubtitle: "\uC57D\uAD00\uC5D0 \uB3D9\uC758\uD558\uACE0 \uC2DC\uC791\uD558\uC138\uC694",
    registerAgreeAll: "\uC804\uCCB4 \uB3D9\uC758",
    registerRequired: "\uD544\uC218",
    registerOptional: "\uC120\uD0DD",
    registerMarketingDesc: "\uAF2D \uD544\uC694\uD55C \uC18C\uC2DD\uB9CC \uB4DC\uB9AC\uBA70, \uC5B8\uC81C\uB4E0 \uC124\uC815\uC5D0\uC11C \uD574\uC81C\uD560 \uC218 \uC788\uC5B4\uC694.",
    registerSubmitting: "\uAC00\uC785 \uC911...",
    registerSubmit: "\uAC00\uC785\uD558\uAE30",
    settingsLoginTitle: "\uAC00\uC871\uACFC \uC5F0\uACB0\uD558\uAE30",
    settingsLoginDesc: "\uB85C\uADF8\uC778\uD558\uBA74 \uC774\uC57C\uAE30 \uCE74\uB4DC\uB97C \uBC1B\uC544\uBCFC \uC218 \uC788\uC5B4\uC694",
    settingsLoginButton: "Google\uB85C \uB85C\uADF8\uC778",
    settingsLoginLoading: "\uB85C\uADF8\uC778 \uC911...",
    loginTagline: "\uB9E4\uC77C \uC804\uD558\uB294 \uB530\uB73B\uD55C \uC548\uBD80",
    loginButton: "Google\uB85C \uC2DC\uC791\uD558\uAE30",
    loginLoading: "\uB85C\uADF8\uC778 \uC911...",
    loginError: "\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.",
    loginGoogleError: "Google \uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
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
