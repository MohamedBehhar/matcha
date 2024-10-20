import React, { useState } from 'react';

// Tag component to display individual tags
const Tag = ({ label, onRemove }) => {
  return (
    <span className="flex items-center bg-gray-200 text-gray-700 px-3 py-1 rounded-full mr-2 mb-2">
      #{label}
      <button
        className="ml-2 text-red-500 hover:text-red-700"
        onClick={() => onRemove(label)}
      >
        &times;
      </button>
    </span>
  );
};

// TagInput component to add and manage tags
const TagInput = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Function to handle adding a tag
  const handleAddTag = (e) => {
    e.preventDefault();
    if (inputValue && !tags.includes(inputValue)) {
      setTags([...tags, inputValue]);
      setInputValue(''); // Clear the input field
    }
  };

  // Function to handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap mb-4">
        {tags.map((tag, index) => (
          <Tag key={index} label={tag} onRemove={handleRemoveTag} />
        ))}
      </div>

      <form onSubmit={handleAddTag} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Add a tag"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black-600 tranparent "
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
        >
          Add Tag
        </button>
      </form>
    </div>
  );
};

export default TagInput;
