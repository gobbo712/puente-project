import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { login, resetError } from '../store/authSlice';

const loginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors
    dispatch(resetError());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(login(values))
      .unwrap()
      .catch(() => {
        // Reset form submission state on error
        setSubmitting(false);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 card">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Puente Trading</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={loginSchema}
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
                  placeholder="Enter your username"
                />
                <ErrorMessage name="username" component="div" className="error" />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="label">Password</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="input"
                  placeholder="Enter your password"
                />
                <ErrorMessage name="password" component="div" className="error" />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </Form>
          )}
        </Formik>
        
        <div className="mt-4 text-center">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 