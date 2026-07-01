// components/common/Badge.jsx
// WHY: Reusable colored badge for status labels (order status, category, etc.)

const colorMap = {
  primary:  "badge-primary",
  success:  "badge-success",
  warning:  "badge-warning",
  danger:   "badge-danger",
  accent:   "badge-accent",
};

const Badge = ({ children, color = "primary", className = "" }) => (
  <span className={`${colorMap[color] || colorMap.primary} ${className}`}>
    {children}
  </span>
);

export default Badge;
