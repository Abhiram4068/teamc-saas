import React from 'react';
import { useFeatures } from './FeatureProvider';

export const FeatureGate = ({ feature, children }) => {
    const { hasFeature, loading } = useFeatures();

    if (loading) {
        return null; // Or a loading spinner if preferred
    }

    if (!hasFeature(feature)) {
        return null;
    }

    return children;
};
