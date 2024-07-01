import React from 'react';
import '../index.css';

const ModalComponent = ({ open, onClose, title, content, additionalInfo }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h1>{title}</h1>
        <ul className="modal-content-list">
          {content.map((item, index) => (
            <li key={index} className="modal-content-item">
              <i className="fa-solid fa-check" style={{ color: 'green' }}></i>
              {item}
            </li>
          ))}
        </ul>
        {additionalInfo && (
          <div className="modal-additional-info">
            <h4>For more information:</h4>
            <p>{additionalInfo}</p>
          </div>
        )}
        <button className="modal-close-button" onClick={onClose}>
          I UNDERSTAND
        </button>
      </div>
    </div>
  );
};

export default ModalComponent;
