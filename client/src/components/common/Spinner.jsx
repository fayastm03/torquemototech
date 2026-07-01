// components/common/Spinner.jsx
// WHY: A reusable loading indicator used across the app.
// Accepts a "size" prop: sm | md | lg

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-14 h-14 border-4",
};

const Spinner = ({ size = "md", className = "" }) => {
  return (
    <div
      className={`
        ${sizeMap[size]} 
        rounded-full 
        border-white/10
        border-t-primary-500
        animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading..."
    />
  );
};

export default Spinner;
