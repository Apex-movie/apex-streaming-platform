import React, { useState } from 'react'
import './Help.css'


const Help = () => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [problem, setProblem] = useState("")

  

  const handleSubmit = (e) => {
    e.preventDefault()

    // Check empty fields
    if (
      name.trim() === "" ||
      email.trim() === "" ||
      problem.trim() === ""
    ) {
      alert("Please fill Name, Email and Describe Problem.")
      return
    }

    // Success popup
    alert(
      `Thank you ${name}!\n\nYour problem has been submitted successfully.\nOur support team will contact you soon.`
    )

    // Clear form
    setName("")
    setEmail("")
    setProblem("")
  }

  return (
    <div className="help-page">

      <div className="help-container">

        <h1>Need Help?</h1>

        <p className="help-subtitle">
          Having a problem with your account, login, password or anything else?
          Tell us about your problem and we will help you.
        </p>

        <div className="help-box">

          <h2>Contact Support</h2>

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="help-field">

              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

            </div>

            {/* Email */}
            <div className="help-field">

              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>

            {/* Problem */}
            <div className="help-field">

              <label>Describe Your Problem</label>

              <textarea
                placeholder="Example: I can't login to my account, I forgot my password, my account is not working..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows="7"
              />

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="help-submit"
            >
              Submit
            </button>

          </form>

          {/* Back to Login */}
         <button
          className="back-btn"
          onClick={() => window.history.back()}
        >
          Back to Login
        </button>

        </div>

      </div>

    </div>
  )
}

export default Help