/**
 * Labelled form control with inline error message.
 * Renders <input>, <textarea> (as="textarea") or <select> (as="select").
 */
export default function Field({ label, name, error, as = "input", hint, children, ...props }) {
  const Tag = as;
  const id = `f-${name}`;
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={id} className="field__label">{label}</label>
      <Tag id={id} name={name} className="field__control" aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props}>
        {children}
      </Tag>
      {error ? (
        <p className="field__error" id={`${id}-err`}>{error}</p>
      ) : (
        hint && <p className="field__hint">{hint}</p>
      )}
    </div>
  );
}
