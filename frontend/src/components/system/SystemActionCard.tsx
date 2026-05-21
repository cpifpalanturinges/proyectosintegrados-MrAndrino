type SystemActionCardProps = {
  kicker: string;
  title: string;
  description: string;
  buttonLabel: string;
  disabled?: boolean;
  onClick?: () => void;
};

function SystemActionCard({
  kicker,
  title,
  description,
  buttonLabel,
  disabled = false,
  onClick,
}: SystemActionCardProps) {
  return (
    <article className="system-card system-action-card">
      <div>
        <p className="team-card-kicker">{kicker}</p>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className="system-secondary-button system-card-button"
        onClick={onClick}
        disabled={disabled}
      >
        {buttonLabel}
      </button>
    </article>
  );
}

export default SystemActionCard;
