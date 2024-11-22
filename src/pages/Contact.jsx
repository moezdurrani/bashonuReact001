import React from 'react';

function Contact() {
  return (
    <div style={{ padding: '20px', lineHeight: '1.6' }}>
      <h1>Contact Me</h1>
      <p>
        Please fill out the form below to send me a message. I will get back to you as soon as possible!
      </p>
      <iframe
        title="Contact Form"
        src="https://submit.jotform.com/243264174165153"
        style={{
          width: '100%',
          height: '600px',
          border: 'none',
          marginTop: '20px',
        }}
      />
    </div>
  );
}

export default Contact;
