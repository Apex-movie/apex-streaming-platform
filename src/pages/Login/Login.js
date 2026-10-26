
import React, { useRef, useState } from 'react'
import './Login.css'
import logo from '../../assets/logo.png'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const [signState, setSignState] = useState("Sign In")

  const navigate = useNavigate()

  const nameRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()
  const confirmPasswordRef = useRef()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState({})


  // HANDLE SUBMIT

  const handleSubmit = async (e) => {

    e.preventDefault()

    const newError = {}


    // NAME VALIDATION

    if (signState === "Sign Up") {

      if (!name.trim()) {

        newError.name =
          "Full name is required"

      }

    }


    // EMAIL VALIDATION

    if (!email.trim()) {

      newError.email =
        "Email is required"

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

      newError.email =
        "Please enter a valid email"

    }


    // PASSWORD VALIDATION

    if (!password.trim()) {

      newError.password =
        "Password is required"

    } else if (password.length < 6) {

      newError.password =
        "Password must be at least 6 characters"

    }


    // CONFIRM PASSWORD

    if (signState === "Sign Up") {

      if (!confirmPassword) {

        newError.confirmPassword =
          "Please confirm your password"

      } else if (
        password !== confirmPassword
      ) {

        newError.confirmPassword =
          "Passwords do not match"

      }

    }


    setError(newError)


    // FOCUS FIRST INVALID FIELD

    if (newError.name) {

      nameRef.current.focus()

      return

    }

    if (newError.email) {

      emailRef.current.focus()

      return

    }

    if (newError.password) {

      passwordRef.current.focus()

      return

    }

    if (newError.confirmPassword) {

      confirmPasswordRef.current.focus()

      return

    }


    // SIGN UP

    if (signState === "Sign Up") {

      try {

        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              password: password
            })
          }
        )


        const data =
          await response.json()


        if (!response.ok) {

          setError({
            email:
              data.message ||
              "Unable to create account"
          })

          emailRef.current.focus()

          return

        }


        alert(
          "Account created successfully! Please Sign In."
        )


        // CLEAR FORM

        setName("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setError({})

        setSignState("Sign In")

      } catch (error) {

        setError({
          email:
            "Unable to connect to server. Please try again."
        })

      }

      return

    }


    // SIGN IN

    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        }
      )


      const data =
        await response.json()


      if (!response.ok) {

        setError({
          email:
            data.message ||
            "Email or password is incorrect."
        })

        emailRef.current.focus()

        return

      }


      // SAVE JWT

      localStorage.setItem(
        "token",
        data.token
      )


      // SAVE USER

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )


      // SAVE LOGIN STATUS

      localStorage.setItem(
        "isLoggedIn",
        "true"
      )


      // CLEAR LOGIN FORM

      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setError({})


      // ROLE BASED NAVIGATION

      if (data.user.role === "admin") {

        navigate("/admin")

      } else {

        navigate("/home")

      }

    } catch (error) {

      setError({
        email:
          "Unable to connect to server. Please try again."
      })

    }

  }


  // SWITCH SIGN IN / SIGN UP

  const handleSignChange = (state) => {

    setSignState(state)

    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError({})

  }


  return (

    <div className="login">

      <img
        src={logo}
        alt="Apex Logo"
        className="login-logo"
      />


      <div className="login-form">

        <h1>
          {signState}
        </h1>


        <form
          onSubmit={handleSubmit}
          autoComplete="off"
        >

          {/* HIDDEN AUTOFILL BLOCKER */}

          <input
            type="text"
            name="fake-username"
            autoComplete="username"
            tabIndex="-1"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              opacity: 0,
              pointerEvents: "none"
            }}
          />


          <input
            type="password"
            name="fake-password"
            autoComplete="current-password"
            tabIndex="-1"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              opacity: 0,
              pointerEvents: "none"
            }}
          />


          {/* FULL NAME */}

          {signState === "Sign Up" && (

            <>

              <input
                type="text"
                name="signup-full-name"
                placeholder="Full Name"
                ref={nameRef}
                value={name}
                autoComplete="off"
                onChange={(e) => {

                  setName(e.target.value)

                  if (error.name) {

                    setError(prev => ({
                      ...prev,
                      name: ""
                    }))

                  }

                }}
              />


              {error.name && (

                <p className="error">
                  {error.name}
                </p>

              )}

            </>

          )}


          {/* EMAIL */}

          <input
            type="email"
            name="apex-login-email"
            placeholder="Email"
            ref={emailRef}
            value={email}
            autoComplete="off"
            onChange={(e) => {

              setEmail(e.target.value)

              if (error.email) {

                setError(prev => ({
                  ...prev,
                  email: ""
                }))

              }

            }}
          />


          {error.email && (

            <p className="error">
              {error.email}
            </p>

          )}


          {/* PASSWORD */}

          <input
            type="password"
            name="apex-login-password"
            placeholder="Password"
            ref={passwordRef}
            value={password}
            autoComplete="new-password"
            onChange={(e) => {

              setPassword(e.target.value)

              if (error.password) {

                setError(prev => ({
                  ...prev,
                  password: ""
                }))

              }

            }}
          />


          {error.password && (

            <p className="error">
              {error.password}
            </p>

          )}


          {/* CONFIRM PASSWORD */}

          {signState === "Sign Up" && (

            <>

              <input
                type="password"
                name="signup-confirm-password"
                placeholder="Confirm Password"
                ref={confirmPasswordRef}
                value={confirmPassword}
                autoComplete="new-password"
                onChange={(e) => {

                  setConfirmPassword(
                    e.target.value
                  )

                  if (
                    error.confirmPassword
                  ) {

                    setError(prev => ({
                      ...prev,
                      confirmPassword: ""
                    }))

                  }

                }}
              />


              {error.confirmPassword && (

                <p className="error">
                  {error.confirmPassword}
                </p>

              )}

            </>

          )}


          {/* SUBMIT */}

          <button type="submit">
            {signState}
          </button>

        </form>


        {/* SIGN IN HELP */}

        {signState === "Sign In" && (

          <div className="form-help">

            <div className="remember-me">

              <div className="checkbox">

                <input
                  type="checkbox"
                  id="remember"
                />

                <label htmlFor="remember">
                  Remember me
                </label>

              </div>


              <h3
                className="need-help"
                onClick={() =>
                  navigate("/help")
                }
              >
                Need help?
              </h3>

            </div>

          </div>

        )}


        {/* SWITCH SIGN IN / SIGN UP */}

        <div className="form-switch">

          {signState === "Sign In" ? (

            <p>

              New to Apex?{" "}

              <span
                onClick={() =>
                  handleSignChange(
                    "Sign Up"
                  )
                }
              >
                Sign Up Now.
              </span>

            </p>

          ) : (

            <p>

              Already have an account?{" "}

              <span
                onClick={() =>
                  handleSignChange(
                    "Sign In"
                  )
                }
              >
                Sign in Now.
              </span>

            </p>

          )}

        </div>

      </div>

    </div>

  )

}

export default Login
