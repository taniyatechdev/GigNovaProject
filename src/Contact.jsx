import React, { useState } from "react";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      alert("Please fill all the fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-label">✦ Contact GigNova</div>

        <h1>Let's Connect</h1>

        <p>
          Have a question, suggestion or need help with GigNova?
          We would love to hear from you.
        </p>
      </section>

      {/* CONTACT INFO */}
      <section className="contact-info-section">

        <div className="contact-info-card">
          <div className="contact-icon">📧</div>
          <h3>Email Us</h3>
          <p>support@gignova.com</p>
          <span>We usually respond within 24 hours.</span>
        </div>

        <div className="contact-info-card">
          <div className="contact-icon">📞</div>
          <h3>Call Us</h3>
          <p>+91 9034664602</p>
          <span>Monday - Friday, 10 AM - 6 PM</span>
        </div>

        <div className="contact-info-card">
          <div className="contact-icon">📍</div>
          <h3>Our Location</h3>
          <p>India</p>
          <span>Serving clients and freelancers online.</span>
        </div>

      </section>

      {/* CONTACT FORM */}
      <section className="contact-main">

        <div className="contact-text">
          <span className="small-heading">GET IN TOUCH</span>

          <h2>How can we help?</h2>

          <p>
            Whether you are a client looking to post a gig or a freelancer
            looking for opportunities, feel free to contact us.
          </p>

          <div className="contact-points">
            <div>
              <span>✓</span>
              Quick support
            </div>

            <div>
              <span>✓</span>
              Simple communication
            </div>

            <div>
              <span>✓</span>
              Help with GigNova features
            </div>

            <div>
              <span>✓</span>
              Suggestions are welcome
            </div>
          </div>
        </div>

        <div className="contact-form-card">

          <h2>Send us a message</h2>

          {submitted && (
            <div className="success-message">
              ✓ Message sent successfully! Thank you for contacting GigNova.
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-row">

              <div className="contact-field">
                <label>Your Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="contact-field">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="contact-field">
              <label>Subject</label>

              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Select a subject</option>
                <option value="General Question">
                  General Question
                </option>
                <option value="Gig Posting">
                  Gig Posting
                </option>
                <option value="Account Help">
                  Account Help
                </option>
                <option value="Technical Issue">
                  Technical Issue
                </option>
                <option value="Suggestion">
                  Suggestion
                </option>
              </select>
            </div>

            <div className="contact-field">
              <label>Your Message</label>

              <textarea
                name="message"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="contact-submit">
              Send Message →
            </button>

          </form>
        </div>

      </section>

      {/* FAQ */}
      <section className="contact-faq">

        <div className="faq-heading">
          <span className="small-heading">FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>
            Here are some common questions about GigNova.
          </p>
        </div>

        <div className="faq-grid">

          <div className="faq-card">
            <h3>How can I post a gig?</h3>
            <p>
              Login to your account and open the Post a Gig page.
              Fill in the project details and submit the form.
            </p>
          </div>

          <div className="faq-card">
            <h3>Can freelancers browse gigs?</h3>
            <p>
              Yes. Freelancers can browse available gigs and
              view detailed project information.
            </p>
          </div>

          <div className="faq-card">
            <h3>Do I need an account?</h3>
            <p>
              An account is required for features such as posting
              and managing your gigs.
            </p>
          </div>

          <div className="faq-card">
            <h3>Can I suggest new features?</h3>
            <p>
              Absolutely! Use the contact form to send your
              suggestions and feedback.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Contact;