import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Table, Container, Spinner, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const UserProfile = () => {
  const user = useSelector((state) => state.user); // Access the user from Redux store
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Guest',  // Default role set to 'Guest'
  });

  // Fetch users if role is Admin
  useEffect(() => {
    if (user?.role === 'Admin') {
      axios
        .get('https://localhost:443/users')
        .then((response) => {
          setUsers(response.data);
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to load users');
          setLoading(false);
        });
    }
  }, [user]);

  const handleDelete = (userId) => {
    axios
      .delete(`https://localhost:443/users/${userId}`)
      .then(() => {
        setUsers(users.filter((user) => user.id !== userId));
      })
      .catch(() => {
        setError('Failed to delete user');
      });
  };

  const handleAddUser = () => {
    axios
      .post('https://localhost:443/register', newUser)
      .then(() => {
        // After successfully adding the user, fetch the list of users again
        axios
          .get('https://localhost:443/users')
          .then((response) => {
            setUsers(response.data);
            setShowModal(false);
          })
          .catch(() => {
            setError('Failed to load users');
          });
      })
      .catch(() => {
        setError('Failed to add user');
      });
  };
  

  if (!user) {
    return (
      <div className="text-center mt-5">
        <Button variant="primary" href="/login">
          Please log in
        </Button>
      </div>
    );
  }

  if (user.role === 'Admin') {
    if (loading) {
      return (
        <div className="text-center mt-5">
          <Spinner animation="border" />
          <p>Loading user data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center mt-5">
          <p className="text-danger">{error}</p>
        </div>
      );
    }

    return (
      <Container className="mt-5">
        <div className="d-flex justify-content-between mb-3">
          <h2>All Users</h2>
          <Button variant="success" onClick={() => setShowModal(true)}>
            Add User
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <Button variant="danger" onClick={() => handleDelete(user.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Add User Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email"
                />
              </Form.Group>
              <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </Form.Group>
              <Form.Group controlId="formRole">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option>Guest</option>
                  <option>Admin</option>
                  <option>Regular User</option>  {/* New role option */}
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleAddUser}>
              Add User
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }

  // Default case: Display the current user's profile information
  return (
    <div className="text-center mt-5">
      <Card style={{ width: '18rem' }} className="mx-auto">
        <Card.Body>
          <Card.Title>{user.username}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">{user.email}</Card.Subtitle>
          <Card.Text>
            This is your profile page. You can update your details here.
          </Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UserProfile;
