import "../Checkbox.css";

const Checkbox = ({
  id,
  label,
  className,
  name,
  checked = false,
  onChange,
  checkboxClass,
}) => {
  return (
    <label className={`custom-checkbox ${className}`}>
      <input
        type="checkbox"
        id={id}
        name={name !== undefined ? name : id}
        checked={checked}
        onChange={onChange}
      />
      <span className={checkboxClass}></span>
      {label}
    </label>
  );
};

export default Checkbox;
