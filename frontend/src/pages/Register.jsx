import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { register, resetError, resetRegistrationSuccess } from '../store/authSlice';

// Password validation message
const PASSWORD_REQUIREMENTS = 'Password must be at least 8 characters';

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .required('Username is required'),
  firstName: Yup.string()
    .min(3, 'First name must be at least 3 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(3, 'Last name must be at least 3 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(8, PASSWORD_REQUIREMENTS)
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, registrationSuccess, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors and registration success
    dispatch(resetError());
    dispatch(resetRegistrationSuccess());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.error('Registration error:', error);
    }
  }, [error]);

  // Redirect to login ONLY after successful registration
  useEffect(() => {
    if (registrationSuccess) {
      navigate('/login');
    }
  }, [registrationSuccess, navigate]);

  const handleSubmit = (values, { resetForm, setStatus }) => {
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = values;
    console.log('Submitting registration with data:', userData);
    dispatch(register(userData));
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 card">
        <h1 className="text-2xl font-bold text-center mb-6">Register for Puente Trading</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Registration Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {registrationSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Registration Successful!</p>
            <p>You can now proceed to the login page.</p>
          </div>
        )}
        
        <Formik
          initialValues={{ username: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="username" className="label">Username</label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  className="input"
                  placeholder="Choose a username"
                />
                <ErrorMessage name="username" component="div" className="error" />
              </div>
              
              <div className="mb-4">
                <label htmlFor="firstName" className="label">First Name</label>
                <Field
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="input"
                  placeholder="Enter your first name"
                />
                <ErrorMessage name="firstName" component="div" className="error" />
              </div>
              
              <div className="mb-4">
                <label htmlFor="lastName" className="label">Last Name</label>
                <Field
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="input"
                  placeholder="Enter your last name"
                />
                <ErrorMessage name="lastName" component="div" className="error" />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="label">Email</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="input"
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="error" />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="label">Password</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="input"
                  placeholder="Create a password"
                />
                <ErrorMessage name="password" component="div" className="error" />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="input"
                  placeholder="Confirm your password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="error" />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="mt-4 text-center">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 