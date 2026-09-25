import { createContext } from 'react';

export const FeatureContext = createContext({
    features: [],
    hasFeature: () => false,
    getFeatureLimit: () => 0,
    loading: true
});
