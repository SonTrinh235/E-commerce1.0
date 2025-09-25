import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    if (query) {
      fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => setResults(data));
    }
  }, [query]);

  return (
    <div className="search-results">
      <h2>Search results for: "{query}"</h2>
      <ul>
        {results.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong> - {item.brand} (${item.price})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
