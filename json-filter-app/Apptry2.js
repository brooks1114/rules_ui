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

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply filters to the data
  const applyFilters = () => {
    if (!jsonData) return;

    const filtered = jsonData.filter((item) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true;  // If the filter is empty, don't apply it
        return item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase());
      });
    });

    setFilteredData(filtered);
  };

  // Extract column names from the first object in the JSON data
  const getColumnNames = () => {
    if (!jsonData || jsonData.length === 0) return [];
    return Object.keys(jsonData[0]);
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
            <input
              key={colName}
              name={colName}
              placeholder={`Filter by ${colName}`}
              onChange={handleFilterChange}
            />
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
                  {getColumnNames().map((colName) => (
                    <td key={colName}>{item[colName]}</td>
                  ))}
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
