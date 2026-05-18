export default function EmptyState({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <section className="emptyState">
      {eyebrow && (
        <p className="emptyStateEyebrow">{eyebrow}</p>
      )}

      <h2>{title}</h2>

      {description && (
        <p className="emptyStateDescription">
          {description}
        </p>
      )}

      {action && (
        <div className="emptyStateAction">
          {action}
        </div>
      )}
    </section>
  );
}