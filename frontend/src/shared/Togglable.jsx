import { useState } from 'react';
import PropTypes from 'prop-types';

// Togglable component toggles the visibility of its children with a button
const Togglable = (props) => {
  const [visible, setVisible] = useState(false);

  // Determine the button's text based on the visibility state
  const buttonLabel = visible ? 'hide' : props.buttonLabel;

  // Determine the children's display style
  const showWhenVisible = { display: visible ? '' : 'none' };

  const toggleVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div>
      <button onClick={toggleVisibility}>{buttonLabel}</button>

      <div className="togglableContent" style={showWhenVisible}>
        {props.children}
      </div>
    </div>
  );
};

Togglable.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
};
export default Togglable;
