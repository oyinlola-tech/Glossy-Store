const DEFAULT_PROFILE = {
  base: 'NGN',
  currency: 'NGN',
  locale: 'en-NG',
  rate: 1,
};

let profile = { ...DEFAULT_PROFILE };

export const setCurrencyProfile = (next: Partial<typeof DEFAULT_PROFILE>) => {
  profile = { ...profile, ...next };
};

export const getCurrencyProfile = () => profile;

export const formatCurrency = (amount: number) => {
  const converted = Number(amount) * Number(profile.rate || 1);
  return new Intl.NumberFormat(profile.locale, {
    style: 'currency',
    currency: profile.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
};
