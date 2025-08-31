import React, { useState, useMemo } from 'react';
import { useCO2Data } from '../../hooks/useCO2Data.js';

import './CO2DataDashboard.css';

const CO2DataDashboard: React.FC = () => {
  const {
    data,
    countries,
    topEmitters,
    globalTrend,
    isLoading,
    isInitialized,
    error,
    refresh,
    searchCountries,
    getCountryData,
    getEmissionsByYearRange,
  } = useCO2Data();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [yearRange, setYearRange] = useState({ start: 1990, end: 2020 });
  const [viewMode, setViewMode] = useState<'overview' | 'country' | 'trends'>(
    'overview'
  );

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries.slice(0, 20);
    return searchCountries(searchQuery).slice(0, 20);
  }, [searchQuery, countries, searchCountries]);

  const selectedCountryData = useMemo(() => {
    if (!selectedCountry) return null;
    return getCountryData(selectedCountry);
  }, [selectedCountry, getCountryData]);

  const yearRangeData = useMemo(() => {
    return getEmissionsByYearRange(yearRange.start, yearRange.end);
  }, [yearRange, getEmissionsByYearRange]);

  if (isLoading && !isInitialized) {
    return (
      <div className="co2-dashboard loading">
        <div className="loading-spinner">Loading CO2 emissions data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="co2-dashboard error">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <button onClick={refresh} className="refresh-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="co2-dashboard no-data">
        <h2>No Data Available</h2>
        <button onClick={refresh} className="refresh-btn">
          Load Data
        </button>
      </div>
    );
  }

  return (
    <div className="co2-dashboard">
      <header className="dashboard-header">
        <h1>CO2 Emissions Dashboard</h1>
        <div className="header-controls">
          <button onClick={refresh} className="refresh-btn">
            Refresh Data
          </button>
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'overview' ? 'active' : ''}
              onClick={() => setViewMode('overview')}
            >
              Overview
            </button>
            <button
              className={viewMode === 'country' ? 'active' : ''}
              onClick={() => setViewMode('country')}
            >
              Country Data
            </button>
            <button
              className={viewMode === 'trends' ? 'active' : ''}
              onClick={() => setViewMode('trends')}
            >
              Global Trends
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {viewMode === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Countries</h3>
                <p className="stat-value">{data.metadata.totalCountries}</p>
              </div>
              <div className="stat-card">
                <h3>Year Range</h3>
                <p className="stat-value">
                  {data.metadata.yearRange.min} - {data.metadata.yearRange.max}
                </p>
              </div>
              <div className="stat-card">
                <h3>Data Source</h3>
                <p className="stat-value">{data.metadata.dataSource}</p>
              </div>
              <div className="stat-card">
                <h3>Last Updated</h3>
                <p className="stat-value">
                  {new Date(data.metadata.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="top-emitters-section">
              <h2>Top CO2 Emitters</h2>
              <div className="emitters-list">
                {topEmitters.map((country, index) => (
                  <div key={country.name} className="emitter-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="country-name">{country.name}</span>
                    <span className="emissions">
                      {country.totalEmissions.toFixed(2)} Mt CO2
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'country' && (
          <div className="country-section">
            <div className="search-controls">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="country-select"
              >
                <option value="">Select a country</option>
                {filteredCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {selectedCountryData && (
              <div className="country-data">
                <h2>{selectedCountry} CO2 Emissions</h2>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Emissions (Mt CO2)</th>
                        <th>Population</th>
                        <th>Per Capita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCountryData
                        .sort((a, b) => b.year - a.year)
                        .map((dataPoint) => (
                          <tr key={dataPoint.year}>
                            <td>{dataPoint.year}</td>
                            <td>{dataPoint.emissions?.toFixed(2) || 'N/A'}</td>
                            <td>
                              {dataPoint.population?.toLocaleString() || 'N/A'}
                            </td>
                            <td>{dataPoint.per_capita?.toFixed(2) || 'N/A'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'trends' && (
          <div className="trends-section">
            <div className="year-range-controls">
              <label>
                Start Year:
                <input
                  type="number"
                  value={yearRange.start}
                  onChange={(e) =>
                    setYearRange((prev) => ({
                      ...prev,
                      start: parseInt(e.target.value),
                    }))
                  }
                  min={data.metadata.yearRange.min}
                  max={yearRange.end}
                />
              </label>
              <label>
                End Year:
                <input
                  type="number"
                  value={yearRange.end}
                  onChange={(e) =>
                    setYearRange((prev) => ({
                      ...prev,
                      end: parseInt(e.target.value),
                    }))
                  }
                  min={yearRange.start}
                  max={data.metadata.yearRange.max}
                />
              </label>
            </div>

            <div className="global-trend">
              <h2>Global CO2 Emissions Trend</h2>
              <div className="trend-chart">
                {globalTrend.map((point) => (
                  <div key={point.year} className="trend-point">
                    <span className="year">{point.year}</span>
                    <span className="emissions">
                      {point.totalEmissions.toFixed(2)} Mt CO2
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="year-range-summary">
              <h3>
                Summary for {yearRange.start}-{yearRange.end}
              </h3>
              <p>Countries with data: {Object.keys(yearRangeData).length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CO2DataDashboard;
