import React from 'react';
import './Contact.css';

function Contact() {
  return (
    <div className="contact-page">
      <p className="contact-description">
        Please fill out the form below to send me a message. I will get back to you as soon as possible!
      </p>
      <iframe
        title="Contact Form"
        src="https://submit.jotform.com/243264174165153"
        className="contact-form"
      />
    </div>
  );
}

export default Contact;
