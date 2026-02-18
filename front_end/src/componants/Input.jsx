import React from "react";

const Input = ({
  id,
  type,
  autoComplete,
  value,
  placeholder,
  setUserdata,
  field,
}) => {
  return (
    <>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) =>
          setUserdata((prev) => ({ ...prev, [field]: e.target.value }))
        }
        className=" block w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
      />
    </>
  );
};

export default Input;
