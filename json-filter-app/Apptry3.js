import React, { useState } from 'react';

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [filters, setFilters] = useState({});

  // Handle file input and parse JSON
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setJsonData(data);
      setFilteredData(data);  // Initially, no filters applied
    };

    reader.readAsText(file);
  };

  // Handle dropdown (filter) changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value === "All" ? "" : value });
  };

  // Apply filters to the data
  const applyFilters = () => {
    if (!jsonData) return;

    const filtered = jsonData.filter((item) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true;  // If no filter is selected, don't apply it
        const keys = key.split('.'); // To handle nested keys
        let itemValue = item;
        for (let i = 0; i < keys.length; i++) {
          itemValue = itemValue[keys[i]];
        }
        return itemValue?.toString() === filters[key];
      });
    });

    setFilteredData(filtered);
  };

  // Get unique values for each column to populate the dropdown filters
  const getUniqueValues = (columnName) => {
    if (!jsonData) return [];
    const uniqueValues = [...new Set(jsonData.map((item) => {
      const keys = columnName.split('.'); // Handle nested keys
      let value = item;
      for (let i = 0; i < keys.length; i++) {
        value = value[keys[i]];
      }
      return value;
    }))];
    return uniqueValues;
  };

  // Flattened column names (for nested data)
  const getColumnNames = () => {
    return [
      'id',
      'given.givenId',
      'given.location',
      'given.locator',
      'given.action',
      'given.value',
      'when.whenId',
      'when.location',
      'when.locator',
      'when.action',
      'when.value',
      'then.thenId',
      'then.location',
      'then.locator',
      'then.action',
      'then.value'
    ];
  };

  return (
    <div className="App">
      <h1>JSON File Uploader and Filter</h1>

      {/* Upload JSON File */}
      <input type="file" accept=".json" onChange={handleFileUpload} />

      {/* Display Filters if JSON is loaded */}
      {jsonData && (
        <div>
          <h2>Filters</h2>
          {getColumnNames().map((colName) => (
            <div key={colName}>
              <label>{`Filter by ${colName}`}: </label>
              <select name={colName} onChange={handleFilterChange}>
                <option value="All">All</option>
                {getUniqueValues(colName).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button onClick={applyFilters}>Apply Filters</button>
        </div>
      )}

      {/* Display filtered data in table */}
      {filteredData && filteredData.length > 0 && (
        <div>
          <h2>Filtered Data</h2>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                {getColumnNames().map((colName) => (
                  <th key={colName}>{colName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx}>
                  {getColumnNames().map((colName) => {
                    const keys = colName.split('.');
                    let value = item;
                    for (let i = 0; i < keys.length; i++) {
                      value = value[keys[i]];
                    }
                    return <td key={colName}>{value}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show a message if no data is present */}
      {filteredData && filteredData.length === 0 && <p>No data available</p>}
    </div>
  );
}

export default App;
