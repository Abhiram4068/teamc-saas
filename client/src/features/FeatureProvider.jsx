import React, { useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';
import { FeatureContext } from './FeatureContext';
import { getToken } from '../utils/tokenStorage';

export const FeatureProvider = ({ children }) => {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFeatures = async () => {
        setLoading(true);
        const token = getToken();
        if (!token) {
            setFeatures([]);
            setLoading(false);
            return;
        }

        try {
            const response = await axiosClient.get('/tenant/features');
            // According to our ApiResponse wrapper, the data is inside response.data.data
            const data = response.data?.data || response.data;
            if (data && data.features) {
                setFeatures(data.features);
            }
        } catch (error) {
            console.error("Failed to load tenant features:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeatures();
    }, []);

    const hasFeature = (code) => {
        return features.some(
            feature => feature.code === code && feature.enabled
        );
    };

    const getFeatureLimit = (code) => {
        const feature = features.find(f => f.code === code);
        return feature?.limit ?? 0;
    };

    return (
        <FeatureContext.Provider value={{ features, hasFeature, getFeatureLimit, loading, reloadFeatures: loadFeatures }}>
            {children}
        </FeatureContext.Provider>
    );
};

export const useFeatures = () => useContext(FeatureContext);
