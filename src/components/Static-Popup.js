import React, { useEffect, useRef, useState, useContext } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, } from 'reactstrap';

const StaticPopup = ({
  message,
  title,
  isShow,
  link,
  btnText_1,
  btnText_2,
  page,
  handleClosePopup
}) => {
  
  const [modal, setModal] = useState(isShow);

  useEffect(() => {
    setModal(isShow);
  }, [isShow]); 

  const toggle = () => {
    setModal(!modal);
    handleClosePopup();
  };

  const redirectToPage = () => {
    window.open("https://fnotrader.com/discover/pricing", '_blank');
  }
    
  const closeBtn = (
    <button className="close" onClick={toggle} type="button">
      &times;
    </button>
  );
  
      return (
        <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle} close={closeBtn}>{title}</ModalHeader>
        <ModalBody>
            {message?.map((des, index) => (
              <div key={"d-"+index}>
                 {des} 
              </div>
            ))}        </ModalBody>
        <ModalFooter>
          {btnText_2 &&
            <Button color="danger" onClick={toggle}>{btnText_2}</Button>
          }
          {btnText_1 &&
             <Button color="primary" onClick={redirectToPage}>{btnText_1}</Button>
          }   
        </ModalFooter>
      </Modal>
      );
    
};

export default StaticPopup;
