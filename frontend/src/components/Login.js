import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, setUser } from '../actions/authActions';
import { Modal, Button, Card, Form, Container, Row, Col } from 'react-bootstrap';

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(login(email, password));

      if (response?.access_token) {
        sessionStorage.setItem('access_token', response.access_token);
        sessionStorage.setItem('user', JSON.stringify(response));
        dispatch(setUser(response));
        setIsAuthenticated(true);
        navigate('/profile');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setModalMessage(error.response.data.detail || 'Invalid email or password');
      } else {
        setModalMessage('Login failed. Please try again.');
      }
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f8f9fa',marginTop:50 }}>
     
          <Card className="shadow-lg p-3 mb-5 bg-white rounded">
            <Card.Body>
              <Card.Title className="text-center mb-4">Welcome</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">
                  Login
                </Button>
              </Form>
              <div className="mt-3 text-center">
                <a href="/register">Don't have an account? Register here</a>
              </div>
            </Card.Body>
          </Card>
     

      {/* React-Bootstrap Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Login;
