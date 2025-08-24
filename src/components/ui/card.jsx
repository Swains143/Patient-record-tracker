export function Card({ className = '', ...props }) {
  return <div className={`bg-white rounded-2xl shadow ${className}`} {...props} />;
}

export function CardContent({ className = '', ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}
