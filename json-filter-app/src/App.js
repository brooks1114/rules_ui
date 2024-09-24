import React, { useState } from 'react';
import './App.css';

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [filters, setFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState([]); // To store visible columns

  // Handle file input and parse JSON
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setJsonData(data);
      setFilteredData(data); // Initially, no filters applied
      setVisibleColumns(getColumnNames(data)); // Initialize visible columns
    };

    reader.readAsText(file);
  };

  // Handle dropdown (filter) changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value === "All" ? "" : value });
  };

  // Flatten out the nested arrays and objects in given/when/then
  const flattenNestedData = (item, section) => {
    const result = {};
    if (!item[section]) return result; // Handle case when section is missing

    item[section].forEach((nestedObj) => {
      Object.keys(nestedObj).forEach((key) => {
        Object.keys(nestedObj[key]).forEach((innerKey) => {
          result[`${section}.${key}.${innerKey}`] = nestedObj[key][innerKey] || ''; // Safely access values
        });
      });
    });
    return result;
  };

  // Get unique values for each column to populate the dropdown filters
  const getUniqueValues = (data, columnName) => {
    if (!data) return [];
    const uniqueValues = new Set(); // Use Set to store unique values

    data.forEach((item) => {
      if (columnName.startsWith('given') || columnName.startsWith('when') || columnName.startsWith('then')) {
        // Handle nested structures
        const section = columnName.split('.')[0];
        const flattened = flattenNestedData(item, section);
        uniqueValues.add(flattened[columnName] || ''); // Safely access flattened data
      } else {
        // Handle simple fields
        const keys = columnName.split('.');
        let value = item;
        for (let i = 0; i < keys.length; i++) {
          value = value?.[keys[i]];
          if (value === undefined) return;
        }
        uniqueValues.add(value || '');
      }
    });

    return [...uniqueValues].filter((v) => v !== ''); // Return as an array and filter out empty values
  };

  // Get column names based on the nested structure
  const getColumnNames = (data) => {
    if (!data || data.length === 0) return [];

    // Get the columns dynamically based on the first item
    const firstItem = data[0];
    let columns = ['businessRuleId'];

    // Flatten columns for 'given', 'when', 'then'
    ['given', 'when', 'then'].forEach((section) => {
      const flattened = flattenNestedData(firstItem, section);
      columns = [...columns, ...Object.keys(flattened)];
    });

    return columns;
  };

  // Get the value at a nested path
  const getValueAtPath = (item, path) => {
    const keys = path.split('.');
    let value = item;
    for (let i = 0; i < keys.length; i++) {
      value = value?.[keys[i]]; // Safely access values
      if (value === undefined) return ''; // Return empty string if path is invalid
    }
    return value;
  };

  // Apply filters and hide columns with all blank values
  const applyFilters = () => {
    if (!jsonData) return;

    // Apply the filters to the data
    const filtered = jsonData.filter((item) => {
      return Object.keys(filters).every((key) => {
        if (!filters[key]) return true; // If no filter is selected, don't apply it
        const keys = key.split('.'); // To handle nested keys
        let itemValue = item;
        for (let i = 0; i < keys.length; i++) {
          itemValue = itemValue?.[keys[i]];
          if (itemValue === undefined) return false; // If path is invalid, skip
        }
        return itemValue?.toString() === filters[key];
      });
    });

    setFilteredData(filtered);

    // Now check for columns where all values are blank and hide those columns
    const nonEmptyColumns = getColumnNames(jsonData).filter((colName) => {
      const uniqueValues = getUniqueValues(filtered, colName);
      return uniqueValues.length > 0; // Only include columns with non-blank values
    });

    setVisibleColumns(nonEmptyColumns);
  };

  return (
    <div className="App">
      <h1>JSON File Uploader and Filter</h1>

      {/* Upload JSON File */}
      <input type="file" accept=".json" onChange={handleFileUpload} />

      {/* Display filtered data in table */}
      {filteredData && filteredData.length > 0 && (
        <div>
          <h2>Filtered Data</h2>
          <table border="1" cellPadding="10" cellSpacing="0">
            <thead>
              <tr>
                {visibleColumns.map((colName) => (
                  <th key={colName}>
                    {colName}
                    <div>
                      <select name={colName} onChange={handleFilterChange}>
                        <option value="All">All</option>
                        {getUniqueValues(jsonData, colName).map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx}>
                  {visibleColumns.map((colName) => {
                    let value;
                    if (colName.includes('given') || colName.includes('when') || colName.includes('then')) {
                      const section = colName.split('.')[0];
                      const flattened = flattenNestedData(item, section);
                      value = flattened[colName];
                    } else {
                      value = getValueAtPath(item, colName);
                    }
                    return <td key={colName}>{value || ''}</td>; // Safely render value
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={applyFilters}>Apply Filters</button>
        </div>
      )}

      {/* Show a message if no data is present */}
      {filteredData && filteredData.length === 0 && <p>No data available</p>}
    </div>
  );
}

export default App;
