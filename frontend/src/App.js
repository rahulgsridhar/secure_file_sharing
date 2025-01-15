import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import store from './store/store'; // Redux store
import { setUser, logout } from './actions/authActions'; // Redux actions to manage user
import NavigationBar from './components/NavBar'; // Navbar
import UserProfile from './components/UserProfile'; // Profile component
import Register from './components/Register'; // Register component
import Login from './components/Login'; // Login component
import FileUpload from './components/FileUpload'; // File upload component
import FileShare from './components/FileShare'; // File share component
import { useDispatch } from 'react-redux';
import { Container, Row, Col,Spinner } from 'react-bootstrap';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const dispatch = useDispatch();
  const user = JSON.parse(sessionStorage.getItem('user'));
  
  // Check if user is authenticated on page load
  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      const user = JSON.parse(sessionStorage.getItem('user')); // Get user from sessionStorage
      if (user) {
        dispatch(setUser(user)); // Set user in Redux store
      }
      setIsAuthenticated(true); // Set authentication status to true
    } else {
      setIsAuthenticated(false); // No token found, user is not authenticated
    }
    setLoading(false); // Set loading to false once the authentication check is done
  }, [dispatch]);

  // Protected route component
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />; // If not authenticated, redirect to login
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('access_token'); // Clear the access token
    sessionStorage.removeItem('user'); // Clear user details
    dispatch(logout()); // Reset user in Redux store
    setIsAuthenticated(false); // Set authentication to false
  };

  // If loading, show a loading spinner
  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" size="lg" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Router>
        <NavigationBar 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
          handleLogout={handleLogout}
          user={user} // Pass logout handler to Navbar
        />
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
          <Row style={{width:"100%"}}>
            <Col>
              <Routes>
                {/* Redirect to /login as default */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route exact path="/register" element={<Register />} />
                <Route exact path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route exact path="/profile" element={<ProtectedRoute element={<UserProfile />} />} />
                <Route exact path="/upload" element={<ProtectedRoute element={<FileUpload />} />} />
                {/* <Route exact path="/file-share" element={<ProtectedRoute element={<FileShare />} />} /> */}
                {/* Any other routes */}
              </Routes>
            </Col>
          </Row>
        </Container>
      </Router>
    </Provider>
  );
}

export default App;
