import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from 'react-router-dom';

function Error() {
  const navigate = useNavigate();

  useEffect(() => {
    const tokenValid = isTokenValid();
  
    if (!tokenValid) {
      console.log('Token is not valid. Redirect to login.');
      removeToken();
      navigate('/', { state: { error: 'Session expired. Please log in again.' } });
    }
  }, [navigate]);
  
  

  return (
    <div className='container text-center'>
      <h1 className='display-1'>404</h1>
      <h3 className='mb-4'>Page not found</h3>
      <Button as={Link} onClick={
        () => {
          window.history.back();
        }
      } variant='primary'>
        Go Back
      </Button>
    </div>
  );
}

export default Error;
