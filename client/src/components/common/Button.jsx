// components/common/Button.jsx
// WHY: A reusable button with variants, loading state, and icon support.
// Use this instead of repeating button styles everywhere.

import Spinner from "./Spinner";

const variants = {
  primary: "btn-primary",
  accent:  "btn-accent",
  ghost:   "btn-ghost",
  danger:  "btn-danger",
  outline: `inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl
            font-semibold text-sm transition-all duration-300 cursor-pointer
            border border-primary-500/40 text-primary-400
            hover:bg-primary-500/10 hover:border-primary-400
            disabled:opacity-50 disabled:cursor-not-allowed`,
};

const sizes = {
  sm:   "!text-xs !px-3 !py-2",
  md:   "",
  lg:   "!text-base !px-8 !py-4",
  icon: "!px-3 !py-3 !rounded-xl",
};

const Button = ({
  children,
  variant  = "primary",
  size     = "md",
  loading  = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type     = "button",
  className = "",
  id,
}) => {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant] || variants.primary}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
