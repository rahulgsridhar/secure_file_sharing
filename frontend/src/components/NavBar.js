import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../actions/authActions';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function NavigationBar({ isAuthenticated, setIsAuthenticated, handleLogout }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();  // Get the current location

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <strong>Secure File Sharing</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/login" active={location.pathname === '/login'}>Login</Nav.Link>
                <Nav.Link as={Link} to="/register" active={location.pathname === '/register'}>Register</Nav.Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/profile" active={location.pathname === '/profile'}>Profile</Nav.Link>
                <Nav.Link as={Link} to="/upload" active={location.pathname === '/upload'}>File Upload</Nav.Link>
                {/* <Nav.Link as={Link} to="/share" active={location.pathname === '/share'}>File Share</Nav.Link> */}
              </>
            )}
          </Nav>
          {isAuthenticated && (
            <Button
              variant="outline-light"
              onClick={handleLogout}
              className="ms-2"
            >
              Logout
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
