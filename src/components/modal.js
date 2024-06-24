import React from 'react';
import { Modal, Box, Button } from "@mui/material";

const ModalComponent = ({ open, onClose, title, content, additionalInfo }) => {

    const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60vw",
    boxShadow: 10,
    padding: 3,
    textAlign: "left",
    background: "#FFFFFF",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    gap: "10px"
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <h1>{title}</h1>
        <ul style={{ listStyle: "none", paddingInlineStart: "0", marginBottom: "0" }}>
          {content.map((item, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <i className="fa-solid fa-check" style={{ color: "green" }}></i>
              {item}
            </li>
          ))}
        </ul>
        {additionalInfo && (
          <div style={{ backgroundColor: "rgb(34 196 234 / 20%)", borderRadius:"5px" ,padding: "0 15px", paddingTop:"10px"}}>
            <h4>For more information:</h4>
            <p style={{ fontSize: "12px" }}>{additionalInfo}</p>
          </div>
        )}
        <Button
          variant="contained"
          size="medium"
          onClick={onClose}
          style={{ alignSelf: "flex-end" }}
        >
          I UNDERSTAND
        </Button>
      </Box>
    </Modal>
  );
};

export default ModalComponent;
