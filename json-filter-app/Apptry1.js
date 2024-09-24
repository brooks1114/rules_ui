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

  return (
    <div className="App">
      <h1>JSON File Uploader and Filter</h1>

      {/* Upload JSON File */}
      <input type="file" accept=".json" onChange={handleFileUpload} />

      {/* Display Filters if JSON is loaded */}
      {jsonData && (
        <div>
          <h2>Filters</h2>
          {/* Example filters based on field names in your JSON */}
          <input
            name="name"
            placeholder="Filter by name"
            onChange={handleFilterChange}
          />
          <input
            name="age"
            placeholder="Filter by age"
            onChange={handleFilterChange}
          />
          <button onClick={applyFilters}>Apply Filters</button>
        </div>
      )}

      {/* Display filtered data */}
      {filteredData && (
        <div>
          <h2>Filtered Data</h2>
          <pre>{JSON.stringify(filteredData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
