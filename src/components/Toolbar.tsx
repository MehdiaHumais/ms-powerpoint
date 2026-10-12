import React from 'react';

const Toolbar: React.FC = () => {
  return (
    <div className="flex space-x-2">
      <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Undo</button>
      <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Redo</button>
      <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Bold</button>
      <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Italic</button>
      <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Underline</button>
    </div>
  );
};

export default Toolbar;